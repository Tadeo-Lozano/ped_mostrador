export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: Database['public']['Enums']['app_role'];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: Database['public']['Enums']['app_role'];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: Database['public']['Enums']['app_role'];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      requests: {
        Row: {
          id: string;
          part_code: string;
          part_description: string | null;
          quantity: number;
          priority: Database['public']['Enums']['request_priority'];
          status: Database['public']['Enums']['request_status'];
          requester_id: string;
          picker_id: string | null;
          created_at: string;
          updated_at: string;
          delivered_at: string | null;
          received_at: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          part_code: string;
          part_description?: string | null;
          quantity: number;
          priority?: Database['public']['Enums']['request_priority'];
          status?: Database['public']['Enums']['request_status'];
          requester_id: string;
          picker_id?: string | null;
          created_at?: string;
          updated_at?: string;
          delivered_at?: string | null;
          received_at?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          part_code?: string;
          part_description?: string | null;
          quantity?: number;
          priority?: Database['public']['Enums']['request_priority'];
          status?: Database['public']['Enums']['request_status'];
          requester_id?: string;
          picker_id?: string | null;
          created_at?: string;
          updated_at?: string;
          delivered_at?: string | null;
          received_at?: string | null;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'requests_picker_id_fkey';
            columns: ['picker_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'requests_requester_id_fkey';
            columns: ['requester_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      request_movements: {
        Row: {
          id: string;
          request_id: string;
          user_id: string;
          action: string;
          previous_status: Database['public']['Enums']['request_status'] | null;
          new_status: Database['public']['Enums']['request_status'] | null;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          user_id: string;
          action: string;
          previous_status?: Database['public']['Enums']['request_status'] | null;
          new_status?: Database['public']['Enums']['request_status'] | null;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          user_id?: string;
          action?: string;
          previous_status?: Database['public']['Enums']['request_status'] | null;
          new_status?: Database['public']['Enums']['request_status'] | null;
          comment?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'request_movements_request_id_fkey';
            columns: ['request_id'];
            isOneToOne: false;
            referencedRelation: 'requests';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'request_movements_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: 'solicitante' | 'surtidor' | 'supervisor';
      request_status:
        | 'pendiente'
        | 'en_proceso'
        | 'surtida'
        | 'recibida'
        | 'no_encontrada'
        | 'cancelada';
      request_priority: 'normal' | 'urgente' | 'critica';
    };
    CompositeTypes: Record<string, never>;
  };
};
