import mongoose, { Schema, model, models } from "mongoose";

export interface IComment {
  _id?: mongoose.Types.ObjectId;
  videoId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  text: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const commentSchema = new Schema<IComment>(
  {
    videoId: { type: Schema.Types.ObjectId, ref: "Video", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

// Index for efficient queries
commentSchema.index({ videoId: 1, createdAt: -1 });

const Comment = models?.Comment || model<IComment>("Comment", commentSchema);

export default Comment;

