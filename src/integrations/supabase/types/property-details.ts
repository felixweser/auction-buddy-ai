import { Json } from './base'

export interface PropertyDetailsTable {
  Row: {
    bathrooms: number
    bedrooms: number
    cooling_system: string | null
    created_at: string
    electrical_system: string | null
    heating_system: string | null
    id: string
    last_system_service_date: string | null
    property_id: string | null
    square_footage: number
    year_built: number
  }
  Insert: {
    bathrooms: number
    bedrooms: number
    cooling_system?: string | null
    created_at?: string
    electrical_system?: string | null
    heating_system?: string | null
    id?: string
    last_system_service_date?: string | null
    property_id?: string | null
    square_footage: number
    year_built: number
  }
  Update: {
    bathrooms?: number
    bedrooms?: number
    cooling_system?: string | null
    created_at?: string
    electrical_system?: string | null
    heating_system?: string | null
    id?: string
    last_system_service_date?: string | null
    property_id?: string | null
    square_footage?: number
    year_built?: number
  }
  Relationships: [
    {
      foreignKeyName: "property_details_property_id_fkey"
      columns: ["property_id"]
      isOneToOne: false
      referencedRelation: "properties"
      referencedColumns: ["id"]
    }
  ]
}