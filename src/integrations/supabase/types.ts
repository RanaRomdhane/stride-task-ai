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
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string | null
          project_id: string | null
          task_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          project_id?: string | null
          task_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          project_id?: string | null
          task_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "message_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_messages: {
        Row: {
          content: string
          created_at: string
          file_name: string | null
          file_url: string | null
          group_id: string
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          group_id: string
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          group_id?: string
          id?: string
          sender_id?: string
        }
        Relationships: []
      }
      meeting_attendees: {
        Row: {
          created_at: string
          id: string
          meeting_id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meeting_id: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          meeting_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_attendees_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          end_time: string
          id: string
          location: string | null
          meeting_url: string | null
          project_id: string | null
          start_time: string
          task_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          end_time: string
          id?: string
          location?: string | null
          meeting_url?: string | null
          project_id?: string | null
          start_time: string
          task_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          end_time?: string
          id?: string
          location?: string | null
          meeting_url?: string | null
          project_id?: string | null
          start_time?: string
          task_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      message_groups: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          project_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          project_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_groups_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          assignments: boolean
          comments: boolean
          created_at: string
          deadline_reminders: boolean
          email_notifications: boolean
          id: string
          in_app_notifications: boolean
          mentions: boolean
          task_updates: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          assignments?: boolean
          comments?: boolean
          created_at?: string
          deadline_reminders?: boolean
          email_notifications?: boolean
          id?: string
          in_app_notifications?: boolean
          mentions?: boolean
          task_updates?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          assignments?: boolean
          comments?: boolean
          created_at?: string
          deadline_reminders?: boolean
          email_notifications?: boolean
          id?: string
          in_app_notifications?: boolean
          mentions?: boolean
          task_updates?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      pomodoro_sessions: {
        Row: {
          completed: boolean
          completed_at: string | null
          duration: number
          id: string
          started_at: string
          task_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          duration: number
          id?: string
          started_at?: string
          task_id: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          duration?: number
          id?: string
          started_at?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pomodoro_sessions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          default_pomodoro_duration: number | null
          full_name: string | null
          id: string
          timezone: string | null
          updated_at: string
          work_hours_end: string | null
          work_hours_start: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          default_pomodoro_duration?: number | null
          full_name?: string | null
          id: string
          timezone?: string | null
          updated_at?: string
          work_hours_end?: string | null
          work_hours_start?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          default_pomodoro_duration?: number | null
          full_name?: string | null
          id?: string
          timezone?: string | null
          updated_at?: string
          work_hours_end?: string | null
          work_hours_start?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: number | null
          created_at: string
          description: string | null
          end_date: string | null
          expenses: number | null
          id: string
          manager_id: string
          name: string
          start_date: string | null
          status: string | null
          team_id: string | null
          updated_at: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          expenses?: number | null
          id?: string
          manager_id: string
          name: string
          start_date?: string | null
          status?: string | null
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          expenses?: number | null
          id?: string
          manager_id?: string
          name?: string
          start_date?: string | null
          status?: string | null
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      sticky_notes: {
        Row: {
          color: string | null
          content: string
          created_at: string
          id: string
          position_x: number | null
          position_y: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          content: string
          created_at?: string
          id?: string
          position_x?: number | null
          position_y?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          content?: string
          created_at?: string
          id?: string
          position_x?: number | null
          position_y?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      task_assignments: {
        Row: {
          assigned_by: string
          created_at: string
          id: string
          role: string
          task_id: string
          user_id: string
        }
        Insert: {
          assigned_by: string
          created_at?: string
          id?: string
          role?: string
          task_id: string
          user_id: string
        }
        Update: {
          assigned_by?: string
          created_at?: string
          id?: string
          role?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_batches: {
        Row: {
          context: string | null
          created_at: string
          id: string
          name: string
          priority: Database["public"]["Enums"]["batch_priority"]
          scheduled: string | null
          tasks: string[] | null
          total_duration: number
          user_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          id?: string
          name: string
          priority?: Database["public"]["Enums"]["batch_priority"]
          scheduled?: string | null
          tasks?: string[] | null
          total_duration?: number
          user_id: string
        }
        Update: {
          context?: string | null
          created_at?: string
          id?: string
          name?: string
          priority?: Database["public"]["Enums"]["batch_priority"]
          scheduled?: string | null
          tasks?: string[] | null
          total_duration?: number
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          batch_id: string | null
          category: string | null
          completed_at: string | null
          context: string | null
          created_at: string
          deadline: string | null
          dependencies: string[] | null
          description: string | null
          estimated_duration: number
          id: string
          important: boolean
          pomodoro_sessions: number
          priority: Database["public"]["Enums"]["task_priority"]
          project_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          tags: string[] | null
          title: string
          updated_at: string
          urgent: boolean
          user_id: string
        }
        Insert: {
          batch_id?: string | null
          category?: string | null
          completed_at?: string | null
          context?: string | null
          created_at?: string
          deadline?: string | null
          dependencies?: string[] | null
          description?: string | null
          estimated_duration?: number
          id?: string
          important?: boolean
          pomodoro_sessions?: number
          priority?: Database["public"]["Enums"]["task_priority"]
          project_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
          urgent?: boolean
          user_id: string
        }
        Update: {
          batch_id?: string | null
          category?: string | null
          completed_at?: string | null
          context?: string | null
          created_at?: string
          deadline?: string | null
          dependencies?: string[] | null
          description?: string | null
          estimated_duration?: number
          id?: string
          important?: boolean
          pomodoro_sessions?: number
          priority?: Database["public"]["Enums"]["task_priority"]
          project_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
          urgent?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tasks_batch_id"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "task_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          manager_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          manager_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          department: string | null
          id: string
          manager_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          id?: string
          manager_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          id?: string
          manager_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_view_user_data: {
        Args: { _viewer_id: string; _target_user_id: string }
        Returns: boolean
      }
      get_my_department: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_department: {
        Args: { p_user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "sub_admin" | "employee"
      batch_priority: "low" | "medium" | "high"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status:
        | "inbox"
        | "next-action"
        | "waiting-for"
        | "project"
        | "someday-maybe"
        | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "sub_admin", "employee"],
      batch_priority: ["low", "medium", "high"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: [
        "inbox",
        "next-action",
        "waiting-for",
        "project",
        "someday-maybe",
        "completed",
      ],
    },
  },
} as const
