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
      professors: {
        Row: {
          id: number
          name: string
          email: string | null
          phone: string | null
          department: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          email?: string | null
          phone?: string | null
          department?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          email?: string | null
          phone?: string | null
          department?: string | null
          created_at?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          id: number
          name: string
          capacity: number
          type: string | null
          equipment: string[] | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          capacity?: number
          type?: string | null
          equipment?: string[] | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          capacity?: number
          type?: string | null
          equipment?: string[] | null
          created_at?: string
        }
        Relationships: []
      }
      modules: {
        Row: {
          id: number
          code: string
          name: string
          semester: string | null
          credits: number
          professor_id: number | null
          created_at: string
        }
        Insert: {
          id?: number
          code: string
          name: string
          semester?: string | null
          credits?: number
          professor_id?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          code?: string
          name?: string
          semester?: string | null
          credits?: number
          professor_id?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_professor_id_fkey"
            columns: ["professor_id"]
            referencedRelation: "professors"
            referencedColumns: ["id"]
          }
        ]
      }
      exams: {
        Row: {
          id: number
          module_id: number
          room_id: number | null
          date: string
          start_time: string | null
          end_time: string | null
          duration_minutes: number | null
          status: string | null
          professor_id: number | null
          created_at: string
        }
        Insert: {
          id?: number
          module_id: number
          room_id?: number | null
          date: string
          start_time?: string | null
          end_time?: string | null
          duration_minutes?: number | null
          status?: string | null
          professor_id?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          module_id?: number
          room_id?: number | null
          date?: string
          start_time?: string | null
          end_time?: string | null
          duration_minutes?: number | null
          status?: string | null
          professor_id?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_module_id_fkey"
            columns: ["module_id"]
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_room_id_fkey"
            columns: ["room_id"]
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_professor_id_fkey"
            columns: ["professor_id"]
            referencedRelation: "professors"
            referencedColumns: ["id"]
          }
        ]
      }
      events: {
        Row: {
          id: number
          title: string
          date: string
          type: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          date: string
          type?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          title?: string
          date?: string
          type?: string | null
          description?: string | null
          created_at?: string
        }
        Relationships: []
      }
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
