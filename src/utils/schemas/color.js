const mongoose = require("mongoose");

class Color extends mongoose.SchemaType {
  constructor(key, options) {
    super(key, options, "Color");
    this.colorArr = options.array;
    this.default(function () {
      return "";
    });
  }

  cast(val) {
    if (val) {
      return val;
    } else {
      return this.colorArr[Math.floor(Math.random() * this.colorArr.length)];
    }
  }
}

mongoose.Schema.Types.Color = Color;
module.exports = Color;
