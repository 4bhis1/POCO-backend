import { kafka } from "./admin";

export async function producer() {
  const producer = kafka.producer();

  console.log(">>>connecitong producer");
  await producer.connect();

  console.log(">>> producer conencted");

  await producer.send({
    topic: "commit-into-github",
    messages: [
      {
        value: JSON.stringify({
          platform: "gfg",
          questionName: "32e34",
          question: "drf",
          difficulty: "easy",
          solution: "Ferfre",
        }),
      },
    ],
  });

  await producer.disconnect();
}

// init();
