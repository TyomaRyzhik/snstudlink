// Enum типы
export type UserRole = 'admin' | 'teacher' | 'student';
export type MediaType = 'image' | 'video' | 'audio' | 'file';
export type ReactionType = 'like' | 'dislike';
export type PomodoroStatus = 'new' | 'in_progress' | 'done';
export type MaterialType = 'text' | 'file' | 'link' | 'video';
export type QuestionType = 'single' | 'multiple' | 'free_text';

// Базовый интерфейс для всех сущностей с id и timestamps
export interface BaseEntity {
  id: string;
  created_at: Date;
  updated_at?: Date;
}

// Роли
export interface Role {
  id: number;
  name: UserRole;
}

// Пользователи
export interface User extends BaseEntity {
  email: string;
  password: string;
  name: string;
  nickname: string;
  user_group: string;
  about?: string;
  avatar?: string;
  banner?: string;
  role_id?: number;
}

// Посты
export interface Post extends BaseEntity {
  author_id: string;
  content: string;
  media?: string[];
  poll?: Record<string, any>;
}

// Медиа
export interface Media extends BaseEntity {
  post_id: string;
  type: MediaType;
  path: string;
}

// Комментарии
export interface Comment extends BaseEntity {
  post_id: string;
  author_id: string;
  content: string;
}

// Реакции
export interface Reaction extends BaseEntity {
  post_id: string;
  user_id: string;
  type: ReactionType;
}

// Задачи помодоро
export interface PomodoroTask extends BaseEntity {
  user_id: string;
  title: string;
  description?: string;
  status: PomodoroStatus;
}

// Предметы
export interface Subject extends BaseEntity {
  teacher_id: string;
  title: string;
}

// Материалы
export interface Material extends BaseEntity {
  subject_id: string;
  type: MaterialType;
  content: string;
}

// Задания
export interface Assignment extends BaseEntity {
  subject_id: string;
  title: string;
  due_date: Date;
}

// Сдачи заданий
export interface Submission extends BaseEntity {
  assignment_id: string;
  student_id: string;
  content: string;
  grade?: number;
  graded_at?: Date;
}

// Тесты
export interface Test extends BaseEntity {
  subject_id: string;
  title: string;
}

// Вопросы теста
export interface TestQuestion extends BaseEntity {
  test_id: string;
  question_text: string;
  type: QuestionType;
  options?: Record<string, any>; // JSONB для вариантов ответов
}

// Результаты тестов
export interface TestResult extends BaseEntity {
  test_id: string;
  student_id: string;
  score: number;
  taken_at: Date;
}

// Конференции
export interface Conference extends BaseEntity {
  teacher_id: string;
  room_name: string; // UUID
  scheduled_at: Date;
} 