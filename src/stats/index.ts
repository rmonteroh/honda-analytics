import PocketBase from "pocketbase";
import { parseISO, getDay, format, isAfter, isBefore, parse } from "date-fns";

const HONDA_ORGANIZATION_ID = "7d48b89x9b1l1e5";
const NOT_CREATED_BY_ID = "uha4mc6yxy01gcj";
const FIRST_TRY_CONTACT_STEP = "first_try";
const PROD_AGENT_ID = "51a8x36fd1265g7";
const BATCH_SIZE = 100;

/* 
organization="7d48b89x9b1l1e5" && created_by != "uha4mc6yxy01gcj" && state.contact_step= "first_try" && state._agent_flow_concluded_with_opt_in != true && state._agent_flow_concluded_with_opt_in != false
*/

async function handleBatch(pb: PocketBase, filter: string) {
  let items: Record<string, unknown>[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const batch = await pb
        .collection("conversations")
        .getList(page, BATCH_SIZE, {
          filter,
          requestKey: crypto.randomUUID(),
        });

      items = items.concat(batch.items);

      // Check if there are more pages
      hasMore = batch.page < batch.totalPages;
      page++;

      console.log(`Loaded batch ${page - 1}: ${batch.items.length} users`);
    } catch (error) {
      console.error(`Error loading batch ${page}:`, error);
      break;
    }
  }

  return items;
}

export const followUpStats = async (pb: PocketBase) => {
  // organization="7d48b89x9b1l1e5" && agents ~ "51a8x36fd1265g7" && (state.contact_step= "first_try" || state.contact_step= "second_try" || state.contact_step= "change_contact_method") && state._agent_flow_concluded_with_opt_in != true && state._agent_flow_concluded_with_opt_in != false
  const filter = `organization="${HONDA_ORGANIZATION_ID}" && agents ~ "${PROD_AGENT_ID}" && (state.contact_step= "${FIRST_TRY_CONTACT_STEP}" || state.contact_step= "second_try" || state.contact_step= "change_contact_method") && state._agent_flow_concluded_with_opt_in != true && state._agent_flow_concluded_with_opt_in != false`;
  const items = await handleBatch(pb, filter);
  const falsePositives: string[] = [];
  // Check messages to discart follow up false positives
  for (const item of items) {
    const messages = await pb.collection("messages").getList(1, 100, {
      filter: `conversation="${item.id}"`,
    });
    console.log("messages", messages);
    // Check if all messages failed
    if (messages.items.length === 1) {
      if (
        messages.items[0].content.includes("{{") ||
        messages.items[0].content.includes("}}")
      ) {
        falsePositives.push(item.id as string);
        continue;
      }
    }
    const allMessagesFailed = messages.items.every(
      (message) => message?.channel_data?.messageStatus === "failed"
    );
    if (allMessagesFailed) {
      falsePositives.push(item.id as string);
    }
  }
  const filteredItems = items.filter(
    (item) => !falsePositives.includes(item.id as string)
  );
  return { items: filteredItems, falsePositives };
};

export const acceptedLeads = async (pb: PocketBase) => {
  // organization="7d48b89x9b1l1e5" && agents ~ "51a8x36fd1265g7" && state._agent_flow_concluded_with_opt_in = true
  const filter = `organization="${HONDA_ORGANIZATION_ID}" && agents ~ "${PROD_AGENT_ID}" && state._agent_flow_concluded_with_opt_in = true`;
  const items = await handleBatch(pb, filter);
  // Se le ofrecio whatsapp number
  const offeredWhatsappNumber = items.filter(
    (item) =>
      item?.state?._last_user_decision === "accepted_whatsapp" ||
      item?.state?._last_user_decision === "accepted_no_whatsapp"
  );
  // Dio click en el numero de whatsapp
  // const clickedWhatsappNumber = items.filter((item) => item?.state?._last_user_decision === "accepted_whatsapp" || item?.state?._last_user_decision === "accepted_no_whatsapp");

  // Out of business hours
  const outOfBusinessHours = outOfBusinessHoursBaseOnLastUserDecision(items);
  // Aceptaron en el follow up
  const acceptInFollowUp = items.filter(
    (item) =>
      item?.state?._agent_flow_concluded_with_opt_in === true &&
      item?.state?.contact_step === FIRST_TRY_CONTACT_STEP
  );
  const acceptInFollowUpSecondTry = items.filter(
    (item) =>
      item?.state?._agent_flow_concluded_with_opt_in === true &&
      item?.state?.contact_step === "second_try"
  );

  return {
    offeredWhatsappNumber: offeredWhatsappNumber.length || 0,
    outOfBusinessHours: outOfBusinessHours.length || 0,
    acceptInFollowUp: acceptInFollowUp.length || 0,
    acceptInFollowUpSecondTry: acceptInFollowUpSecondTry.length || 0,
    items: items || [],
  };
};

export const rejectedLeads = async (pb: PocketBase) => {
  // organization="7d48b89x9b1l1e5" && agents ~ "51a8x36fd1265g7" && state._agent_flow_concluded_with_opt_in = false
  const filter = `organization="${HONDA_ORGANIZATION_ID}" && agents ~ "${PROD_AGENT_ID}" && state._agent_flow_concluded_with_opt_in = false`;
  const items = await handleBatch(pb, filter);
  return items;
};

export const countHondaConversations = async (pb: PocketBase) => {
  // organization="7d48b89x9b1l1e5" && agents ~ "51a8x36fd1265g7"
  const filter = `organization="${HONDA_ORGANIZATION_ID}" && agents ~ "${PROD_AGENT_ID}"`;
  const items = await pb.collection("conversations").getList(1, 1, {
    filter,
    requestKey: crypto.randomUUID(),
  });
  return items.totalItems;
};

function outOfBusinessHoursBaseOnLastUserDecision(
  items: Record<string, unknown>[]
) {
  return items.filter(
    (item) =>
      item.state?._agent_flow_concluded_with_opt_in === true &&
      item.state?._last_user_decision === "accepted_no_whatsapp"
  );
}

function checkingOutBusinessHours(items: Record<string, unknown>[]) {
  return items.filter((item) => {
    const state = item.state as Record<string, unknown>;
    const contactStepAt = state?.contact_step_at;
    const workingCallCenter = state?.working_call_center;

    if (
      !contactStepAt ||
      !workingCallCenter ||
      !Array.isArray(workingCallCenter) ||
      workingCallCenter.length === 0
    ) {
      return false;
    }

    const contactDate = parseISO(contactStepAt as string);
    const dayOfWeek = getDay(contactDate); // 0 = Sunday, 1 = Monday, etc.
    const contactTime = format(contactDate, "HH:mm:ss");

    const callCenter = workingCallCenter[0] as Record<string, unknown>;
    const workSchedules =
      (callCenter?.work_schedules as Array<Record<string, unknown>>) || [];

    // Find the work schedule for this day of the week
    const daySchedule = workSchedules.find(
      (schedule) => schedule.day_of_week === dayOfWeek
    );

    if (!daySchedule) {
      // No schedule for this day means it's out of business hours
      // console.log("Out of business hours", item.id);
      return true;
    }

    const startTime = parse(
      daySchedule.start_time as string,
      "HH:mm:ss",
      contactDate
    );
    const endTime = parse(
      daySchedule.end_time as string,
      "HH:mm:ss",
      contactDate
    );
    const contactDateTime = parse(contactTime, "HH:mm:ss", contactDate);

    // Check if contact time is outside business hours
    const isOutOfBusinessHours =
      isBefore(contactDateTime, startTime) || isAfter(contactDateTime, endTime);
    if (isOutOfBusinessHours) {
      // console.log("Out of business hours", item.id);
    }
    return isOutOfBusinessHours;
  });
}
