import { randomBytes } from 'crypto';

export const generateMeetingId = (): string => {
  // Generate a random 10-character string
  return randomBytes(5).toString('hex');
};

export const generateMeetingPassword = (): string => {
  // Generate a random 6-digit password
  return Math.floor(100000 + Math.random() * 900000).toString();
}; 