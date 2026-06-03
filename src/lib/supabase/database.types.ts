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
          receipt_pin_hash: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: Database['public']['Enums']['app_role'];
          receipt_pin_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: Database['public']['Enums']['app_role'];
          receipt_pin_hash?: string | null;
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
      request_items: {
        Row: {
          id: string;
          request_id: string;
          part_code: string;
          part_description: string | null;
          quantity: number;
          delivered_quantity: number | null;
          received_quantity: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          part_code: string;
          part_description?: string | null;
          quantity: number;
          delivered_quantity?: number | null;
          received_quantity?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          part_code?: string;
          part_description?: string | null;
          quantity?: number;
          delivered_quantity?: number | null;
          received_quantity?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'request_items_request_id_fkey';
            columns: ['request_id'];
            isOneToOne: false;
            referencedRelation: 'requests';
            referencedColumns: ['id'];
          },
        ];
      };
      request_receipts: {
        Row: {
          id: string;
          request_id: string;
          received_by: string;
          delivered_by: string | null;
          method: string;
          confirmed_quantity: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          received_by: string;
          delivered_by?: string | null;
          method?: string;
          confirmed_quantity: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          received_by?: string;
          delivered_by?: string | null;
          method?: string;
          confirmed_quantity?: number;
          comment?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'request_receipts_delivered_by_fkey';
            columns: ['delivered_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'request_receipts_received_by_fkey';
            columns: ['received_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'request_receipts_request_id_fkey';
            columns: ['request_id'];
            isOneToOne: false;
            referencedRelation: 'requests';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      confirm_request_receipt: {
        Args: {
          p_request_id: string;
          p_pin: string;
          p_comment?: string | null;
        };
        Returns: Database['public']['Tables']['requests']['Row'];
      };
      create_request_with_items: {
        Args: {
          p_priority: Database['public']['Enums']['request_priority'];
          p_notes: string | null;
          p_items: Json;
        };
        Returns: Database['public']['Tables']['requests']['Row'];
      };
      set_my_receipt_pin: {
        Args: {
          pin: string;
        };
        Returns: undefined;
      };
    };
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
