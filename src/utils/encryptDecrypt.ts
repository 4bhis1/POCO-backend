import * as crypto from "crypto";
import * as dotenv from "dotenv";

dotenv.config();

// Secret key should be a 256-bit key (32 bytes) for AES-256-CBC
const ENCRYPTION_KEY: string = "b2d4a28f2c8d5a9e58cb7cd5d44a34b2"; // 32 bytes key (256 bits)
const IV_LENGTH: number = 16; // AES block size is 16 bytes

function encrypt(text: string): string {
  const iv: Buffer = crypto.randomBytes(IV_LENGTH);

  // Create AES-256-CBC cipher
  const cipher: crypto.Cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "utf-8"),
    iv
  );

  // Encrypt the text
  let encrypted: string = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Return the IV and encrypted text as a single string (IV:EncryptedText)
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(text: string): string {
  // Split the input into IV and encrypted text
  const [ivHex, encryptedText] = text.split(":");

  // Convert the IV from hex to Buffer
  const iv: Buffer = Buffer.from(ivHex, "hex");

  // Create AES-256-CBC decipher
  const decipher: crypto.Decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "utf-8"),
    iv
  );

  // Decrypt the encrypted text
  let decrypted: string = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

export { encrypt, decrypt };