import { kafka } from "./admin";

export async function consumer() {
  const consumer = kafka.consumer({ groupId: "group-1" });
  await consumer.connect();

  console.log("consumer connecrted.....");

  await consumer.subscribe({
    topics: ["commit-into-github"],
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(">> topic", topic, partition, message.value?.toString());
    },
  });
}
