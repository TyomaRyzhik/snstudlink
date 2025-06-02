import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Subject } from '../entities/Subject';

export class SubjectController {
  private subjectRepository = AppDataSource.getRepository(Subject);

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { title } = req.body;

      if (!title || title.trim() === '') {
        return res.status(400).json({ message: 'Subject title is required' });
      }

      const subject = this.subjectRepository.create({
        title: title.trim()
      });

      await this.subjectRepository.save(subject);
      return res.status(201).json(subject);
    } catch (error) {
      console.error('Error creating subject:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getAll(_req: Request, res: Response): Promise<Response> {
    try {
      const subjects = await this.subjectRepository.find({
        order: {
          createdAt: 'DESC'
        }
      });
      return res.json(subjects);
    } catch (error) {
      console.error('Error getting subjects:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const subjectId = req.params.id;
      const subject = await this.subjectRepository.findOneBy({ id: subjectId });

      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      return res.json(subject);
    } catch (error) {
      console.error('Error getting subject by id:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const subjectId = req.params.id;
      const { title } = req.body;

      const subject = await this.subjectRepository.findOneBy({ id: subjectId });

      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      if (title) {
        subject.title = title.trim();
      }

      await this.subjectRepository.save(subject);
      return res.json(subject);
    } catch (error) {
      console.error('Error updating subject:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const subjectId = req.params.id;
      const result = await this.subjectRepository.delete({ id: subjectId });

      if (result.affected === 0) {
        return res.status(404).json({ message: 'Subject not found' });
      }

      return res.status(200).json({ message: 'Subject deleted successfully' });
    } catch (error) {
      console.error('Error deleting subject:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
} 