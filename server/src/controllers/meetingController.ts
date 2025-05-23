import { Request, Response } from 'express';
import Meeting, { IMeeting } from '../models/Meeting';
import { generateMeetingId } from '../utils/meetingUtils';

// Get all meetings
export const getMeetings = async (req: Request, res: Response) => {
  try {
    const meetings = await Meeting.find()
      .populate('courseId', 'title')
      .populate('createdBy', 'name')
      .sort({ startTime: 1 });

    const formattedMeetings = meetings.map(meeting => ({
      ...meeting.toObject(),
      courseName: meeting.courseId ? (meeting.courseId as any).title : undefined,
      courseId: meeting.courseId ? (meeting.courseId as any)._id : undefined,
    }));

    res.json(formattedMeetings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching meetings', error });
  }
};

// Get meetings by course
export const getMeetingsByCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const meetings = await Meeting.find({ courseId })
      .populate('createdBy', 'name')
      .sort({ startTime: 1 });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course meetings', error });
  }
};

// Create a new meeting
export const createMeeting = async (req: Request, res: Response) => {
  try {
    const { title, description, startTime, duration, courseId } = req.body;
    const meetingId = generateMeetingId();
    const joinUrl = `${process.env.FRONTEND_URL}/meetings/join/${meetingId}`;

    const meeting = new Meeting({
      title,
      description,
      startTime,
      duration,
      meetingId,
      joinUrl,
      courseId,
      createdBy: req.user._id,
    });

    await meeting.save();
    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Error creating meeting', error });
  }
};

// Update a meeting
export const updateMeeting = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, startTime, duration } = req.body;

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Check if user is the creator of the meeting
    if (meeting.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this meeting' });
    }

    const updatedMeeting = await Meeting.findByIdAndUpdate(
      id,
      { title, description, startTime, duration },
      { new: true }
    );

    res.json(updatedMeeting);
  } catch (error) {
    res.status(500).json({ message: 'Error updating meeting', error });
  }
};

// Delete a meeting
export const deleteMeeting = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Check if user is the creator of the meeting
    if (meeting.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this meeting' });
    }

    await Meeting.findByIdAndDelete(id);
    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting meeting', error });
  }
}; 