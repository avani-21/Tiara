import mongoose from "mongoose";

const category = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    isListed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const categorySchema = mongoose.model("Category", category);
export default categorySchema;
