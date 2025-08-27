import PocketBase from "pocketbase";

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
  // organization="7d48b89x9b1l1e5" && agents ~ "51a8x36fd1265g7" && state.contact_step= "first_try" && state._agent_flow_concluded_with_opt_in != true && state._agent_flow_concluded_with_opt_in != false
  const filter = `organization="${HONDA_ORGANIZATION_ID}" && agents ~ "${PROD_AGENT_ID}" && state.contact_step= "${FIRST_TRY_CONTACT_STEP}" && state._agent_flow_concluded_with_opt_in != true && state._agent_flow_concluded_with_opt_in != false`;
  const items = await handleBatch(pb, filter);
  return items;
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
  // Aceptaron en el follow up
  const acceptInFollowUp = items.filter(
    (item) =>
      item?.state?._agent_flow_concluded_with_opt_in === true &&
      item?.state?.contact_step === FIRST_TRY_CONTACT_STEP
  );

  return {
    offeredWhatsappNumber: offeredWhatsappNumber.length || 0,
    // outOfBusinessHours: outOfBusinessHours.length || 0,
    acceptInFollowUp: acceptInFollowUp.length || 0,
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
