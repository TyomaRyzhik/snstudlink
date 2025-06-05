export interface Post {
  id: string
  content: string
  media: Media[]
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

export interface File {
  id: number;
  filename: string;
  size: number;
  path: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: number;
  name: string;
  description: string;
  subjectId: string;
  files?: File[];
  // Add other lesson fields as needed, e.g., materials, assignments, etc.
}

export interface User {
  id: string;
  nickname: string;
  avatar?: string | null;
  role?: 'super-admin' | 'teacher' | 'student' | string;
  username?: string;
  bio?: string;
  bannerUrl?: string;
  avatarUrl?: string;
  followingCount?: number;
  followersCount?: number;
  name?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Media {
  id: string;
  type: string;
  path: string;
  createdAt: string;
}

export interface Lecture {
  id: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  slidesUrl?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  type: 'homework' | 'quiz' | 'project' | 'exam';
  status: 'draft' | 'published' | 'closed';
  dueDate?: string;
  maxScore?: number;
  instructions?: string;
  submissionInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'super-admin' | 'teacher' | 'student' | string; 