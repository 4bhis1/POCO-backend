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
    if (val) {
      return encrypt(val);
    }
    throw new Error("Value is required for encryption.");
  }
}


(mongoose.Schema.Types as any).Encrypt = Encrypt;

export default Encrypt;
