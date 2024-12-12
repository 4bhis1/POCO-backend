import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "PO-CO",
  brokers: ["192.168.29.54:9092"],
});