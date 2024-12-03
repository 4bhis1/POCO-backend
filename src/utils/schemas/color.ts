import mongoose from "mongoose";

class Color extends mongoose.SchemaType {
  colorArr: string[];
  constructor(key: any, options: any) {
    super(key, options, "Color");
    this.colorArr = options.array;
    this.default(function () {
      return "";
    });
  }

  cast(val: string | undefined) {
    if (val) {
      return val;
    } else {
      return this.colorArr[Math.floor(Math.random() * this.colorArr.length)];
    }
  }
}

(mongoose.Schema.Types as any).Color = Color;

export default Color;
