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