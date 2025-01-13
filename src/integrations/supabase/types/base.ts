export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      messages: TablesDefinition['messages']
      profiles: TablesDefinition['profiles']
      properties: TablesDefinition['properties']
      property_details: TablesDefinition['property_details']
      property_viewing_settings: TablesDefinition['property_viewing_settings']
      property_viewing_slots: TablesDefinition['property_viewing_slots']
      time_windows: TablesDefinition['time_windows']
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}