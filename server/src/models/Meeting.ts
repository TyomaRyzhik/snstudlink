import mongoose, { Schema, Document } from 'mongoose';

export interface IMeeting extends Document {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  participants: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  participants: [{
    type: String,
    required: true,
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model<IMeeting>('Meeting', MeetingSchema); 