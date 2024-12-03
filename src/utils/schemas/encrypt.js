const mongoose = require("mongoose");
const { encrypt } = require("../encryptDecrypt");

class Encrypt extends mongoose.SchemaType {
  constructor(key, options) {
    super(key, options, "Color");
    this.colorArr = options.array;
    this.default(function () {
      return "";
    });
  }

  cast(val) {
    if (val) {
      return encrypt(val);
    }
  }
}

mongoose.Schema.Types.Encrypt = Encrypt;
module.exports = Encrypt;
