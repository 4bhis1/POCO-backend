import { kafka } from "./admin";

async function admin() {
  const admin = kafka.admin();
  console.log(">>> aAdminConnection.........");

  admin.connect();
  console.log(">>> connection success");

  console.log("commit-into-github");

  await admin.createTopics({
    topics: [
      {
        topic: "commit-into-github",
        numPartitions: 2,
      },
    ],
  });

  console.log(">>> topic created suvves");

  await admin.disconnect();
}
