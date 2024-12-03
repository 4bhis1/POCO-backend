import * as crypto from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

const ENCRYPTION_KEY: string = "your-secret-key-32-chars";
const IV_LENGTH: number = 16;

function encrypt(text: string): string {
  const iv: Buffer = crypto.randomBytes(IV_LENGTH);
  const cipher: crypto.Cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "utf-8"),
    iv
  );
  let encrypted: string = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(text: string): string {
  const [ivHex, encryptedText] = text.split(":");
  const iv: Buffer = Buffer.from(ivHex, "hex");
  const decipher: crypto.Decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "utf-8"),
    iv
  );
  let decrypted: string = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export { encrypt, decrypt };
