import { Schema, model } from "mongoose";
import { TAGS } from "../constants/tags.js";

const noteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",
      trim: true,
    },
    tag: {
      type: String,
      required: false,
      enum: TAGS,
      default: "Todo",
    },
  },
  { timestamps: true, versionKey: false }
);

noteSchema.index({ title: "text", content: "text" }, { name: 'noteTextIndex' });

export const Note = model("Note", noteSchema);
