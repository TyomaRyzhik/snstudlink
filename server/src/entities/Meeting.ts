import { Schema, model, Document } from 'mongoose';

export interface IMeeting extends Document {
  title: string;
  description?: string;
  startTime: Date;
  duration: number;
  meetingId: string;
  password?: string;
  joinUrl: string;
  courseId?: Schema.Types.ObjectId;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const meetingSchema = new Schema<IMeeting>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    startTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    meetingId: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    joinUrl: {
      type: String,
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model<IMeeting>('Meeting', meetingSchema); 