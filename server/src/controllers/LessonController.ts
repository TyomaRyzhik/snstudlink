import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Lesson } from '../entities/Lesson';
import { Subject } from '../entities/Subject';
import { File } from '../entities/File';
import { AuthenticatedRequest } from '../types'; // Assuming AuthenticatedRequest is defined here or similar

export class LessonController {
  private lessonRepository = AppDataSource.getRepository(Lesson);
  private subjectRepository = AppDataSource.getRepository(Subject);
  private fileRepository = AppDataSource.getRepository(File);

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { name, description, subjectId } = req.body;

      const subject = await this.subjectRepository.findOneBy({ id: subjectId });
      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      const lesson = this.lessonRepository.create({ name, description, subject });
      await this.lessonRepository.save(lesson);

      return res.status(201).json(lesson);
    } catch (error) {
      console.error('Error creating lesson:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getAll(_req: Request, res: Response): Promise<Response> {
    try {
      const lessons = await this.lessonRepository.find({ relations: ['subject', 'files'] });
      return res.json(lessons);
    } catch (error) {
      console.error('Error getting lessons:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const lessonId = parseInt(req.params.id);
      const lesson = await this.lessonRepository.findOne({ where: { id: lessonId }, relations: ['subject', 'files'] });

      if (!lesson) {
        return res.status(404).json({ message: 'Lesson not found' });
      }

      return res.json(lesson);
    } catch (error) {
      console.error('Error getting lesson by id:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const lessonId = parseInt(req.params.id);
      const { name, description, subjectId } = req.body;

      const lesson = await this.lessonRepository.findOneBy({ id: lessonId });

      if (!lesson) {
        return res.status(404).json({ message: 'Lesson not found' });
      }

      lesson.name = name || lesson.name;
      lesson.description = description || lesson.description;

      if (subjectId) {
        const subject = await this.subjectRepository.findOneBy({ id: subjectId });
        if (!subject) {
          return res.status(404).json({ message: 'Subject not found' });
        }
        lesson.subject = subject;
      }

      await this.lessonRepository.save(lesson);

      return res.json(lesson);
    } catch (error) {
      console.error('Error updating lesson:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const lessonId = parseInt(req.params.id);
      const result = await this.lessonRepository.delete({ id: lessonId });

      if (result.affected === 0) {
        return res.status(404).json({ message: 'Lesson not found' });
      }

      return res.status(200).json({ message: 'Lesson deleted successfully' });
    } catch (error) {
      console.error('Error deleting lesson:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async uploadFileToLesson(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const lessonId = parseInt(req.params.id);
      const lesson = await this.lessonRepository.findOneBy({ id: lessonId });

      if (!lesson) {
        return res.status(404).json({ message: 'Lesson not found' });
      }

      const files = req.files as Express.Multer.File[];
      const uploadedBy = req.user; // Still assuming req.user is available here with id

      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      const fileEntities = files.map(file => this.fileRepository.create({
        filename: file.filename,
        path: `/uploads/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size,
        lesson: lesson,
        uploadedBy: uploadedBy ? { id: uploadedBy.id } : undefined, // Передаем только ID пользователя или undefined
      }));

      await this.fileRepository.save(fileEntities);

      // Refresh the lesson entity to include the new files in the response
      const updatedLesson = await this.lessonRepository.findOne({ where: { id: lessonId }, relations: ['subject', 'files'] });

      return res.status(201).json(updatedLesson);
    } catch (error) {
      console.error('Error uploading file to lesson:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getLessonFiles(req: Request, res: Response): Promise<Response> {
    try {
      const lessonId = parseInt(req.params.id);
      const lesson = await this.lessonRepository.findOne({ where: { id: lessonId }, relations: ['files'] });

      if (!lesson) {
        return res.status(404).json({ message: 'Lesson not found' });
      }

      return res.json(lesson.files);
    } catch (error) {
      console.error('Error getting lesson files:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}