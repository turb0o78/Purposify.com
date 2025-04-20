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
      content_statistics: {
        Row: {
          average_likes: number | null
          average_views: number | null
          created_at: string | null
          id: string
          source_platform: string
          target_platform: string
          total_failed: number | null
          total_pending: number | null
          total_published: number | null
          total_repurposed: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_likes?: number | null
          average_views?: number | null
          created_at?: string | null
          id?: string
          source_platform: string
          target_platform: string
          total_failed?: number | null
          total_pending?: number | null
          total_published?: number | null
          total_repurposed?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_likes?: number | null
          average_views?: number | null
          created_at?: string | null
          id?: string
          source_platform?: string
          target_platform?: string
          total_failed?: number | null
          total_pending?: number | null
          total_published?: number | null
          total_repurposed?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      platform_connections: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string | null
          id: string
          platform: Database["public"]["Enums"]["platform_type"]
          platform_avatar_url: string | null
          platform_user_id: string | null
          platform_username: string | null
          refresh_token: string | null
          scopes: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          platform: Database["public"]["Enums"]["platform_type"]
          platform_avatar_url?: string | null
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token?: string | null
          scopes?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          platform?: Database["public"]["Enums"]["platform_type"]
          platform_avatar_url?: string | null
          platform_user_id?: string | null
          platform_username?: string | null
          refresh_token?: string | null
          scopes?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      processed_videos: {
        Row: {
          id: string
          platform_video_id: string
          processed_at: string
          source_platform: string
          workflow_id: string
        }
        Insert: {
          id?: string
          platform_video_id: string
          processed_at?: string
          source_platform: string
          workflow_id: string
        }
        Update: {
          id?: string
          platform_video_id?: string
          processed_at?: string
          source_platform?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "processed_videos_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      republished_content: {
        Row: {
          created_at: string
          description: string | null
          id: string
          source_platform: string
          source_video_id: string
          status: string
          target_platform: string
          target_video_id: string
          title: string | null
          workflow_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          source_platform: string
          source_video_id: string
          status?: string
          target_platform: string
          target_video_id: string
          title?: string | null
          workflow_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          source_platform?: string
          source_video_id?: string
          status?: string
          target_platform?: string
          target_video_id?: string
          title?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "republished_content_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      video_queue: {
        Row: {
          created_at: string
          description: string | null
          duration: number | null
          error_message: string | null
          id: string
          platform_video_id: string
          source_platform: string
          status: string
          target_platform_id: string | null
          thumbnail: string | null
          title: string | null
          updated_at: string
          workflow_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: number | null
          error_message?: string | null
          id?: string
          platform_video_id: string
          source_platform: string
          status?: string
          target_platform_id?: string | null
          thumbnail?: string | null
          title?: string | null
          updated_at?: string
          workflow_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number | null
          error_message?: string | null
          id?: string
          platform_video_id?: string
          source_platform?: string
          status?: string
          target_platform_id?: string | null
          thumbnail?: string | null
          title?: string | null
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_queue_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          source_connection_id: string
          source_platform: Database["public"]["Enums"]["platform_type"]
          target_connection_id: string
          target_platform: Database["public"]["Enums"]["platform_type"]
          updated_at: string | null
          user_id: string
          workflow_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          source_connection_id: string
          source_platform: Database["public"]["Enums"]["platform_type"]
          target_connection_id: string
          target_platform: Database["public"]["Enums"]["platform_type"]
          updated_at?: string | null
          user_id: string
          workflow_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          source_connection_id?: string
          source_platform?: Database["public"]["Enums"]["platform_type"]
          target_connection_id?: string
          target_platform?: Database["public"]["Enums"]["platform_type"]
          updated_at?: string | null
          user_id?: string
          workflow_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_source_connection_id_fkey"
            columns: ["source_connection_id"]
            isOneToOne: false
            referencedRelation: "platform_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_target_connection_id_fkey"
            columns: ["target_connection_id"]
            isOneToOne: false
            referencedRelation: "platform_connections"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      platform_type: "tiktok" | "youtube"
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
      platform_type: ["tiktok", "youtube"],
    },
  },
} as const
