import { Json } from './base'

export interface PropertyViewingBookingsTable {
  Row: {
    id: string
    viewing_slot_id: string
    property_id: string
    booked_by: string
    booking_date: string
    start_time: string
    end_time: string
    created_at: string
  }
  Insert: {
    id?: string
    viewing_slot_id: string
    property_id: string
    booked_by: string
    booking_date: string
    start_time: string
    end_time: string
    created_at?: string
  }
  Update: {
    id?: string
    viewing_slot_id?: string
    property_id?: string
    booked_by?: string
    booking_date?: string
    start_time?: string
    end_time?: string
    created_at?: string
  }
  Relationships: [
    {
      foreignKeyName: "property_viewing_bookings_viewing_slot_id_fkey"
      columns: ["viewing_slot_id"]
      isOneToOne: false
      referencedRelation: "property_viewing_slots"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "property_viewing_bookings_property_id_fkey"
      columns: ["property_id"]
      isOneToOne: false
      referencedRelation: "properties"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "property_viewing_bookings_booked_by_fkey"
      columns: ["booked_by"]
      isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
  ]
}

export interface PropertyViewingSettingsTable {
  Row: {
    buffer_time: number
    created_at: string
    default_time_window_end: string
    default_time_window_start: string
    id: string
    updated_at: string
    user_id: string
    viewing_duration: number
  }
  Insert: {
    buffer_time?: number
    created_at?: string
    default_time_window_end?: string
    default_time_window_start?: string
    id?: string
    updated_at?: string
    user_id: string
    viewing_duration?: number
  }
  Update: {
    buffer_time?: number
    created_at?: string
    default_time_window_end?: string
    default_time_window_start?: string
    id?: string
    updated_at?: string
    user_id?: string
    viewing_duration?: number
  }
  Relationships: []
}

export interface PropertyViewingSlotsTable {
  Row: {
    buffer_minutes: number
    created_at: string
    end_time: string
    id: string
    property_id: string
    slot_date: string
    slot_duration_minutes: number
    start_time: string
  }
  Insert: {
    buffer_minutes?: number
    created_at?: string
    end_time: string
    id?: string
    property_id: string
    slot_date: string
    slot_duration_minutes?: number
    start_time: string
  }
  Update: {
    buffer_minutes?: number
    created_at?: string
    end_time?: string
    id?: string
    property_id?: string
    slot_date?: string
    slot_duration_minutes?: number
    start_time?: string
  }
  Relationships: [
    {
      foreignKeyName: "property_viewing_slots_property_id_fkey"
      columns: ["property_id"]
      isOneToOne: false
      referencedRelation: "properties"
      referencedColumns: ["id"]
    }
  ]
}

export interface TimeWindowsTable {
  Row: {
    created_at: string
    date: string
    id: string
    is_available: boolean
    updated_at: string
    user_id: string
    window_end: string
    window_start: string
  }
  Insert: {
    created_at?: string
    date: string
    id?: string
    is_available?: boolean
    updated_at?: string
    user_id: string
    window_end: string
    window_start: string
  }
  Update: {
    created_at?: string
    date?: string
    id?: string
    is_available?: boolean
    updated_at?: string
    user_id?: string
    window_end?: string
    window_start?: string
  }
  Relationships: []
}