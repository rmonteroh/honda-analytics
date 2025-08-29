import express from "express";
import cors from "cors";
import PocketBase from "pocketbase";
import {
  acceptedLeads,
  countHondaConversations,
  followUpStats,
  rejectedLeads,
} from "./stats";

const app = express();
const port = 3000;

app.use(cors());

app.get("/", async (req, res) => {
  const pb = new PocketBase("https://pb.nexus.iamgloria.com");
  // authenticate as auth collection record
  const userData = await pb
    .collection("_superusers")
    .authWithPassword("ricardo@webtroniclabs.com", "v4h-5gN0pVActOf");

  const promiseArray = [
    followUpStats(pb),
    acceptedLeads(pb),
    rejectedLeads(pb),
    countHondaConversations(pb),
  ];

  const [followUpUsers, acceptLeads, rejectLeads, totalHondaConversations] =
    await Promise.all(promiseArray);

  const totalItems =
    followUpUsers.length +
    (acceptLeads?.items?.length || 0) +
    (rejectLeads?.length || 0);
  const allConversations = totalHondaConversations;

  res.json({
    nonQualifiedInFollowUpUsers: {
      total: followUpUsers.length,
      percentage: ((followUpUsers.length / allConversations) * 100).toFixed(2),
    },
    qualifiedAcceptUsers: {
      total: acceptLeads?.items?.length || 0,
      percentage: (
        ((acceptLeads?.items?.length || 0) / allConversations) *
        100
      ).toFixed(2),
      customCases: {
        offeredWhatsappNumber: {
          total: acceptLeads?.offeredWhatsappNumber || 0,
          percentageBasedOnAccepts: (
            ((acceptLeads?.offeredWhatsappNumber || 0) /
              (acceptLeads?.items?.length || 0)) *
            100
          ).toFixed(2),
        },
        acceptInFirstContactStep: {
          total: acceptLeads?.acceptInFollowUp || 0,
          percentageBasedOnAccepts: (
            ((acceptLeads?.acceptInFollowUp || 0) /
              (acceptLeads?.items?.length || 0)) *
            100
          ).toFixed(2),
        },
        outOfBusinessHours: {
          total: acceptLeads?.outOfBusinessHours || 0,
          percentageBasedOnAccepts: (
            ((acceptLeads?.outOfBusinessHours || 0) /
              (acceptLeads?.items?.length || 0)) *
            100
          ).toFixed(2),
        },
      },
    },
    qualifiedRejectUsers: {
      total: rejectLeads?.length || 0,
      percentage: (
        ((rejectLeads?.length || 0) / allConversations) *
        100
      ).toFixed(2),
    },
    totalTrackedUsers: totalItems,
    totalHondaConversations,
  });
});

app.get("/test", async (req, res) => {
  res.json({ message: "Hello World" });
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
