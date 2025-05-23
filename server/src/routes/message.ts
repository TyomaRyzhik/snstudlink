import { Router, Response } from 'express'
import { AppDataSource } from '../data-source'
import { Conversation } from '../entities/Conversation'
import { Message } from '../entities/Message'
import { User } from '../entities/User'
import { authenticateToken } from '../middleware/auth'
import { AuthenticatedRequest } from '../types'
import { In } from 'typeorm'

const router = Router()
const conversationRepository = AppDataSource.getRepository(Conversation)
const messageRepository = AppDataSource.getRepository(Message)
const userRepository = AppDataSource.getRepository(User)

// Create or get existing conversation
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const { participantIds } = req.body

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length < 1) {
      res.status(400).json({ message: 'participantIds array is required and must contain at least one user ID' })
      return
    }

    // Include the current user's ID in the participants
    const allParticipantIds = [...new Set([...participantIds, req.user.id])]

    // Find existing conversation with these participants
    // This is a simplified check and might need refinement for complex group chats
    const existingConversation = await conversationRepository
      .createQueryBuilder('conversation')
      .leftJoin('conversation.participants', 'user')
      .where('user.id IN (:...userIds)', { userIds: allParticipantIds })
      .groupBy('conversation.id')
      .having('COUNT(DISTINCT user.id) = :count', { count: allParticipantIds.length })
      .getOne()

    if (existingConversation) {
      res.json(existingConversation)
      return
    }

    // Create new conversation
    const participants = await userRepository.find({ where: { id: In(allParticipantIds) } })

    if (participants.length !== allParticipantIds.length) {
        // This means some participant IDs were invalid
        res.status(404).json({ message: 'One or more participants not found' });
        return;
    }

    const newConversation = conversationRepository.create({ participants })
    await conversationRepository.save(newConversation)

    res.status(201).json(newConversation)

  } catch (error) {
    console.error('Create or get conversation error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get user's conversations
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const conversations = await conversationRepository
      .createQueryBuilder('conversation')
      .leftJoin('conversation.participants', 'participant')
      .where('participant.id = :userId', { userId: req.user.id })
      .leftJoinAndSelect('conversation.participants', 'allParticipants') // Load all participants for each conversation
      .leftJoinAndSelect('conversation.messages', 'lastMessage', 'lastMessage."createdAt" = (SELECT MAX(m."createdAt") FROM message m WHERE m."conversationId" = conversation.id)') // Get last message - simplified approach
      .orderBy('lastMessage."createdAt"', 'DESC') // Order by last message time
      .getMany()
      
    // Format the response to include necessary participant info
    const formattedConversations = conversations.map(conv => ({
        id: conv.id,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        participants: conv.participants.map(p => ({
            id: p.id,
            nickname: p.nickname,
            avatar: p.avatar,
        })),
        lastMessage: conv.messages && conv.messages.length > 0 ? {
            id: conv.messages[0].id,
            content: conv.messages[0].content,
            createdAt: conv.messages[0].createdAt,
            sender: {
                id: conv.messages[0].sender.id,
                nickname: conv.messages[0].sender.nickname,
                avatar: conv.messages[0].sender.avatar,
            }
        } : null
    }))

    res.json(formattedConversations)

  } catch (error) {
    console.error('Get user conversations error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Get messages for a conversation
router.get('/:conversationId/messages', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const conversationId = req.params.conversationId

    // Check if the current user is a participant in this conversation
    const conversation = await conversationRepository
        .createQueryBuilder('conversation')
        .leftJoin('conversation.participants', 'participant')
        .where('conversation.id = :conversationId', { conversationId })
        .andWhere('participant.id = :userId', { userId: req.user.id })
        .getOne();

    if (!conversation) {
        res.status(404).json({ message: 'Conversation not found or user is not a participant' });
        return;
    }

    const messages = await messageRepository.find({
      where: { conversation: { id: conversationId } },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
      take: 50, // Limit the number of messages - implement pagination later
    })

    // Format messages to include sender info
    const formattedMessages = messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        createdAt: msg.createdAt,
        sender: {
            id: msg.sender.id,
            nickname: msg.sender.nickname,
            avatar: msg.sender.avatar,
        }
    }))

    res.json(formattedMessages)

  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// Send message to a conversation
router.post('/:conversationId/messages', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const conversationId = req.params.conversationId;
        const { content } = req.body;

        if (!content || !content.trim()) {
            res.status(400).json({ message: 'Message content is required' });
            return;
        }

        // Check if the current user is a participant in this conversation
        const conversation = await conversationRepository
            .createQueryBuilder('conversation')
            .leftJoin('conversation.participants', 'participant')
            .where('conversation.id = :conversationId', { conversationId })
            .andWhere('participant.id = :userId', { userId: req.user.id })
            .getOne();

        if (!conversation) {
            res.status(404).json({ message: 'Conversation not found or user is not a participant' });
            return;
        }

        const sender = await userRepository.findOne({ where: { id: req.user.id } });

        if (!sender) {
             res.status(404).json({ message: 'Sender user not found' });
            return;
        }

        const newMessage = messageRepository.create({
            content,
            conversation: conversation,
            sender: sender,
        });

        await messageRepository.save(newMessage);

        // Optionally update conversation updatedAt to bring it to top of list
        conversation.updatedAt = new Date();
        await conversationRepository.save(conversation);

        res.status(201).json({
            id: newMessage.id,
            content: newMessage.content,
            createdAt: newMessage.createdAt,
            sender: {
                id: sender.id,
                nickname: sender.nickname,
                avatar: sender.avatar,
            }
        });

    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export const messageRouter = router 