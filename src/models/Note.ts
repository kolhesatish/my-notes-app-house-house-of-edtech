import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface INote extends Document {
  title: string;
  content: string;
  tags: string[];
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

// Create text index only on title and content (NOT on tags array)
NoteSchema.index({ title: "text", content: "text" });

// Create separate index for tags array searching
NoteSchema.index({ tags: 1 });

// Optional: Create compound index for user-specific searches
NoteSchema.index({ userId: 1, createdAt: -1 });

export const Note: Model<INote> =
  mongoose.models.Note || mongoose.model<INote>("Note", NoteSchema);