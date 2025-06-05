import { Request, Response } from 'express';
import Meeting from '../models/Meeting';
import { AuthenticatedRequest as AuthRequest } from '../types';

interface MeetingData {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  participants: string[];
}

// Get all meetings
export const getMeetings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const meetings = await Meeting.find().populate('createdBy', 'name nickname');
    const formattedMeetings = meetings.map((meeting: any) => ({
      id: meeting._id,
      title: meeting.title,
      description: meeting.description,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      participants: meeting.participants,
      createdBy: {
        id: meeting.createdBy._id,
        name: meeting.createdBy.name,
        nickname: meeting.createdBy.nickname,
      },
    }));
    res.json(formattedMeetings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching meetings' });
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
export const createMeeting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, startTime, endTime, participants } = req.body as MeetingData;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const meeting = new Meeting({
      title,
      description,
      startTime,
      endTime,
      participants,
      createdBy: req.user.id,
    });

    await meeting.save();
    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Error creating meeting' });
  }
};

// Update a meeting
export const updateMeeting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, startTime, endTime, participants } = req.body as MeetingData;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      res.status(404).json({ message: 'Meeting not found' });
      return;
    }

    if (meeting.createdBy.toString() !== req.user.id) {
      res.status(403).json({ message: 'Not authorized to update this meeting' });
      return;
    }

    meeting.title = title;
    meeting.description = description;
    meeting.startTime = startTime;
    meeting.endTime = endTime;
    meeting.participants = participants;

    await meeting.save();
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Error updating meeting' });
  }
};

// Delete a meeting
export const deleteMeeting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      res.status(404).json({ message: 'Meeting not found' });
      return;
    }

    if (meeting.createdBy.toString() !== req.user.id) {
      res.status(403).json({ message: 'Not authorized to delete this meeting' });
      return;
    }

    await meeting.deleteOne();
    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting meeting' });
  }
}; 