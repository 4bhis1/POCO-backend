import mongoose, { SchemaTypeOptions } from "mongoose";
import { encrypt } from "../encryptDecrypt";

class Encrypt extends mongoose.SchemaType {
  constructor(key: string, options: SchemaTypeOptions<any>) {
    super(key, options, "Encrypt");

    this.default(() => {
      return "";
    });
  }

  cast(val: string): string {
    if (this.isEncrypted(val)) {
      return val;
    }

    if (val) {
      return encrypt(val);
    }

    throw new Error("Value is required for encryption.");
  }

  isEncrypted(val: string): boolean {
    if (typeof val !== "string" || !val.includes(":")) return false;

    const [iv, encryptedText] = val.split(":");

    const IV_LENGTH = 16; // Update this if your IV length changes
    return /^[0-9a-fA-F]+$/.test(iv) && iv.length === IV_LENGTH * 2;
  }
}

(mongoose.Schema.Types as any).Encrypt = Encrypt;

export default Encrypt;
