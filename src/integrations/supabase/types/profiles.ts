import { Json } from './base'

export interface ProfilesTable {
  Row: {
    avatar_url: string | null
    created_at: string
    id: string
    username: string | null
  }
  Insert: {
    avatar_url?: string | null
    created_at?: string
    id: string
    username?: string | null
  }
  Update: {
    avatar_url?: string | null
    created_at?: string
    id?: string
    username?: string | null
  }
  Relationships: []
}