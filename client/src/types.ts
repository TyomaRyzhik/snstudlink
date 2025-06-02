export interface Post {
  id: string
  content: string
  media: string[]
  author: {
    id: string
    nickname: string
    avatar?: string
  }
  likes: string[]
  likesCount: number
  commentsCount: number
  retweetsCount: number
  createdAt: string
  updatedAt: string
  isLiked: boolean
  isRetweeted: boolean
  poll?: {
    question: string
    options: {
      text: string
      votes: number
      voterIds?: string[]
    }[]
  } | null
}

export interface Subject {
  id: string;
  title: string;
  description: string;
  lessons?: Lesson[];
  // Add other relevant fields if known, e.g., teacher, courses, etc.
}

export interface Lesson {
  id: number;
  name: string;
  description: string;
  subjectId: string;
  // Add other lesson fields as needed, e.g., materials, assignments, etc.
}

export interface User {
  id: string;
  nickname: string;
  avatar?: string | null;
  role?: 'super-admin' | 'teacher' | 'student' | string; // Assuming role is a string
  // Add other user fields as needed
}

export type UserRole = 'super-admin' | 'teacher' | 'student' | string; 