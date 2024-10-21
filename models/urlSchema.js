const mongoose = require("mongoose");

const urlSchema = mongoose.Schema(
  {
    LongUrl: { type: String, unique: true },
    shortUrl: { type: String, default: "" },
  },
  {
    timestamp: true,
  }
);

module.exports = mongoose.model("Data", urlSchema);
