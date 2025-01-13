import { Json } from './base'

export interface MessagesTable {
  Row: {
    content: string
    created_at: string
    id: string
    listing_id: string
    receiver_id: string
    sender_id: string
  }
  Insert: {
    content: string
    created_at?: string
    id?: string
    listing_id: string
    receiver_id: string
    sender_id: string
  }
  Update: {
    content?: string
    created_at?: string
    id?: string
    listing_id?: string
    receiver_id?: string
    sender_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "messages_sender_id_profiles_fkey"
      columns: ["sender_id"]
      isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
  ]
}