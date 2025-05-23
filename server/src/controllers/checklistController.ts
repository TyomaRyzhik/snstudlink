import { Response } from 'express';
import { AppDataSource } from '../data-source';
import { ChecklistItem } from '../entities/ChecklistItem';
import { AuthenticatedRequest } from '../types';

const checklistItemRepository = AppDataSource.getRepository(ChecklistItem);

export const getChecklistItems = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const items = await checklistItemRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching checklist items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createChecklistItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { description, dueDate } = req.body;
    if (!description) {
      res.status(400).json({ message: 'Description is required' });
      return;
    }
    const newItem = checklistItemRepository.create({ description, userId, dueDate });
    await checklistItemRepository.save(newItem);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating checklist item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateChecklistItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const itemId = req.params.id;
    const { isCompleted, dueDate } = req.body;

    const item = await checklistItemRepository.findOne({
      where: { id: itemId, userId },
    });

    if (!item) {
      res.status(404).json({ message: 'Checklist item not found' });
      return;
    }

    item.isCompleted = isCompleted;
    if (dueDate !== undefined) {
      item.dueDate = dueDate ? new Date(dueDate) : null;
    }
    await checklistItemRepository.save(item);
    res.json(item);
  } catch (error) {
    console.error('Error updating checklist item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteChecklistItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const itemId = req.params.id;

    const item = await checklistItemRepository.findOne({
      where: { id: itemId, userId },
    });

    if (!item) {
      res.status(404).json({ message: 'Checklist item not found' });
      return;
    }

    await checklistItemRepository.remove(item);
    res.status(200).json({ message: 'Checklist item deleted successfully' });
  } catch (error) {
    console.error('Error deleting checklist item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 