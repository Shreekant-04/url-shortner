const mongoose = require("mongoose");

const urlSchema = mongoose.Schema(
  {
    LongUrl: { type: String, unique: true },
    shortUrl: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Data", urlSchema);
