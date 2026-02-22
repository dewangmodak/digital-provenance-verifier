const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  fileId: { type: String, required: true },
  analysis: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Report", ReportSchema);
