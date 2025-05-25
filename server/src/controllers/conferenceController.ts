import { Response } from 'express';
import { AppDataSource } from '../data-source';
import { Conference } from '../entities/Conference';
import jwt from 'jsonwebtoken';
import { User } from '../entities/User';
import { AuthenticatedRequest } from '../types';

const conferenceRepository = AppDataSource.getRepository(Conference);
const userRepository = AppDataSource.getRepository(User);

// Replace with your actual Jitsi configuration
const JITSI_APP_ID = process.env.JITSI_APP_ID || 'your-jitsi-app-id'; // CHANGE THIS
const JITSI_JWT_SECRET = process.env.JITSI_JWT_SECRET || 'your-jitsi-jwt-secret'; // CHANGE THIS

// Helper function to generate JWT
const generateJitsiToken = (user: User, roomName: string, isModerator: boolean) => {
    const jitsiPayload = {
        context: {
            user: {
                avatar: '', // Optional: user avatar URL
                email: user.email,
                name: user.name,
                id: user.id
            },
            features: { // Optional: Jitsi features
                lobby: true
            }
        },
        aud: JITSI_APP_ID,
        iss: JITSI_APP_ID,
        sub: 'meet.jit.si', // Or your Jitsi server domain
        room: roomName,
        moderator: isModerator,
    };
    return jwt.sign(jitsiPayload, JITSI_JWT_SECRET, { algorithm: 'HS256', expiresIn: '1h' });
};

export const conferenceController = {
    // Get all conferences
    async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const conferences = await conferenceRepository.find({
                relations: ['host'],
                order: {
                    scheduled_at: 'ASC'
                }
            });

            let userJitsiToken = null;
            let currentUser = null;

            if (req.user?.id) {
                currentUser = await userRepository.findOne({ where: { id: req.user.id } });
                if (currentUser) {
                    userJitsiToken = generateJitsiToken(currentUser, 'general-lobby', false);
                }
            }

            res.json({ conferences, userJitsiToken });
        } catch (error) {
            console.error('Error fetching conferences:', error);
            res.status(500).json({ message: 'Error fetching conferences', error });
        }
    },

    // Create new conference
    async create(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user?.id) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const { title, scheduled_at, room_name } = req.body;
            const host_id = req.user.id;

            const hostUser = await userRepository.findOne({ where: { id: host_id } });
            if (!hostUser) {
                res.status(404).json({ message: 'Host user not found' });
                return;
            }

            const conference = conferenceRepository.create({
                title,
                scheduled_at,
                room_name: room_name || `conference-${Date.now()}`,
                host: hostUser
            });

            await conferenceRepository.save(conference);

            const jitsiToken = generateJitsiToken(hostUser, conference.room_name, true);

            res.status(201).json({ conference, jitsiToken });
        } catch (error) {
            console.error('Error creating conference:', error);
            res.status(500).json({ message: 'Error creating conference', error });
        }
    },

    // Get conference by ID
    async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const conference = await conferenceRepository.findOne({
                where: { id },
                relations: ['host']
            });

            if (!conference) {
                res.status(404).json({ message: 'Conference not found' });
                return;
            }

            let jitsiToken = null;
            if (req.user?.id) {
                const currentUser = await userRepository.findOne({ where: { id: req.user.id } });
                if (currentUser) {
                    const isModerator = conference.host.id === currentUser.id;
                    jitsiToken = generateJitsiToken(currentUser, conference.room_name, isModerator);
                }
            }

            res.json({ conference, jitsiToken });
        } catch (error) {
            console.error('Error fetching conference:', error);
            res.status(500).json({ message: 'Error fetching conference', error });
        }
    },

    // Delete conference
    async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user?.id) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            const { id } = req.params;
            const conference = await conferenceRepository.findOne({
                where: { id },
                relations: ['host']
            });

            if (!conference) {
                res.status(404).json({ message: 'Conference not found' });
                return;
            }

            if (conference.host.id !== req.user.id) {
                res.status(403).json({ message: 'Only the host can delete this conference' });
                return;
            }

            await conferenceRepository.remove(conference);
            res.status(204).send();
        } catch (error) {
            console.error('Error deleting conference:', error);
            res.status(500).json({ message: 'Error deleting conference', error });
        }
    }
}; 