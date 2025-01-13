import { Json } from './base'

export interface PropertiesTable {
  Row: {
    address_line1: string
    address_line2: string | null
    city: string
    created_at: string
    created_by: string
    description: string
    id: string
    image_url: string
    is_negotiable: boolean
    last_updated: string
    price: number
    state: string
    title: string
    zip_code: string
  }
  Insert: {
    address_line1: string
    address_line2?: string | null
    city: string
    created_at?: string
    created_by: string
    description: string
    id?: string
    image_url: string
    is_negotiable?: boolean
    last_updated?: string
    price: number
    state: string
    title: string
    zip_code: string
  }
  Update: {
    address_line1?: string
    address_line2?: string | null
    city?: string
    created_at?: string
    created_by?: string
    description?: string
    id?: string
    image_url?: string
    is_negotiable?: boolean
    last_updated?: string
    price?: number
    state?: string
    title?: string
    zip_code?: string
  }
  Relationships: []
}