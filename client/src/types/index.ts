export interface Course {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  teachers?: {
    id: string;
    nickname: string;
    name: string;
    avatar?: string;
  }[];
}

export interface Subject {
  id: number;
  name: string;
  description: string;
  lessons?: Lesson[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: number;
  name: string;
  description: string;
  subject: Subject;
  files?: File[];
  createdAt: Date;
  updatedAt: Date;
}

export interface File {
  id: number;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  lesson: Lesson;
  uploadedBy: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: string;
  content: string;
  media?: Array<{
    id: string;
    type: string;
    path: string;
    createdAt: string;
  }>;
  author: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  likes?: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  isLiked: boolean;
  isRetweeted: boolean;
  poll?: { question: string; options: { text: string; votes: number }[] } | null;
  retweetsCount?: number;
}

export interface User {
  id: number;
  email: string;
  nickname: string;
  name?: string;
  role: 'super-admin' | 'teacher' | 'student';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
} 