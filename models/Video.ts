import mongoose, { Schema, model, models } from "mongoose";
// Ensure User model is registered for population
import "@/models/User";

export interface IVideo {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  controls?: boolean;
  uploadedAt?: Date;
  updatedAt?: Date;
  duration?: number; // in seconds, max 60
  aspectRatio?: string; // default "9:16"
  likes?: number; // default 0
  likedBy?: mongoose.Types.ObjectId[]; // array of user IDs
  shares?: number; // default 0
  author?: mongoose.Types.ObjectId; // reference to User
  transformation?: {
    height?: number;
    width?: number;
    quality?: number;
  };
  strictPopulate?: boolean;
}

const videoSchema = new Schema<IVideo>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    videoUrl: { type: String, required: true },
    controls: { type: Boolean, required: true, default: true },
    thumbnailUrl: { type: String, required: true },
    duration: {
      type: Number,
      min: 0,
      max: 60,
      required: true,
    },
    aspectRatio: {
      type: String,
      default: "9:16",
      validate: {
        validator: function (v: string) {
          return v === "9:16";
        },
        message: "Aspect ratio must be 9:16",
      },
    },
    likes: { type: Number, default: 0, min: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    shares: { type: Number, default: 0, min: 0 },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    transformation: {
      height: { type: Number, min: 1 },
      width: { type: Number, min: 1 },
      quality: { type: Number, min: 1, max: 100 },
    },
  },
  { timestamps: true, strictPopulate: false }
);

// Delete cached model to ensure schema options are applied
if (models?.Video) {
  delete models.Video;
}
const Video = model<IVideo>("Video", videoSchema);

export default Video;
