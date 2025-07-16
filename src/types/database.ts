export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string;
          shop_domain: string;
          access_token: string;
          api_key: string | null;
          api_secret: string | null;
          webhook_secret: string | null;
          store_name: string | null;
          store_email: string | null;
          currency: string;
          timezone: string | null;
          plan_name: string | null;
          is_active: boolean;
          last_sync_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shop_domain: string;
          access_token: string;
          api_key?: string | null;
          api_secret?: string | null;
          webhook_secret?: string | null;
          store_name?: string | null;
          store_email?: string | null;
          currency?: string;
          timezone?: string | null;
          plan_name?: string | null;
          is_active?: boolean;
          last_sync_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shop_domain?: string;
          access_token?: string;
          api_key?: string | null;
          api_secret?: string | null;
          webhook_secret?: string | null;
          store_name?: string | null;
          store_email?: string | null;
          currency?: string;
          timezone?: string | null;
          plan_name?: string | null;
          is_active?: boolean;
          last_sync_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          store_id: string;
          shopify_product_id: number;
          title: string;
          description: string | null;
          vendor: string | null;
          product_type: string | null;
          tags: string[] | null;
          handle: string | null;
          status: string;
          price_min: number | null;
          price_max: number | null;
          images: any;
          variants: any;
          options: any;
          seo_title: string | null;
          seo_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          shopify_product_id: number;
          title: string;
          description?: string | null;
          vendor?: string | null;
          product_type?: string | null;
          tags?: string[] | null;
          handle?: string | null;
          status?: string;
          price_min?: number | null;
          price_max?: number | null;
          images?: any;
          variants?: any;
          options?: any;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          shopify_product_id?: number;
          title?: string;
          description?: string | null;
          vendor?: string | null;
          product_type?: string | null;
          tags?: string[] | null;
          handle?: string | null;
          status?: string;
          price_min?: number | null;
          price_max?: number | null;
          images?: any;
          variants?: any;
          options?: any;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          store_id: string;
          session_id: string;
          customer_id: string | null;
          status: string;
          started_at: string;
          ended_at: string | null;
          total_messages: number;
          converted: boolean;
          conversion_value: number | null;
          metadata: any;
        };
        Insert: {
          id?: string;
          store_id: string;
          session_id: string;
          customer_id?: string | null;
          status?: string;
          started_at?: string;
          ended_at?: string | null;
          total_messages?: number;
          converted?: boolean;
          conversion_value?: number | null;
          metadata?: any;
        };
        Update: {
          id?: string;
          store_id?: string;
          session_id?: string;
          customer_id?: string | null;
          status?: string;
          started_at?: string;
          ended_at?: string | null;
          total_messages?: number;
          converted?: boolean;
          conversion_value?: number | null;
          metadata?: any;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: string;
          content: string;
          message_type: string;
          metadata: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: string;
          content: string;
          message_type?: string;
          metadata?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: string;
          content?: string;
          message_type?: string;
          metadata?: any;
          created_at?: string;
        };
      };
      analytics: {
        Row: {
          id: string;
          store_id: string;
          event_type: string;
          event_data: any;
          session_id: string | null;
          customer_id: string | null;
          product_id: string | null;
          conversion_value: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          event_type: string;
          event_data?: any;
          session_id?: string | null;
          customer_id?: string | null;
          product_id?: string | null;
          conversion_value?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          event_type?: string;
          event_data?: any;
          session_id?: string | null;
          customer_id?: string | null;
          product_id?: string | null;
          conversion_value?: number | null;
          created_at?: string;
        };
      };
      ai_training: {
        Row: {
          id: string;
          store_id: string;
          category: string;
          title: string;
          content: string;
          is_active: boolean;
          priority: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          category: string;
          title: string;
          content: string;
          is_active?: boolean;
          priority?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          category?: string;
          title?: string;
          content?: string;
          is_active?: boolean;
          priority?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      cart_sessions: {
        Row: {
          id: string;
          store_id: string;
          session_id: string;
          customer_id: string | null;
          cart_data: any;
          total_value: number | null;
          items_count: number;
          status: string;
          last_activity_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          session_id: string;
          customer_id?: string | null;
          cart_data?: any;
          total_value?: number | null;
          items_count?: number;
          status?: string;
          last_activity_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          session_id?: string;
          customer_id?: string | null;
          cart_data?: any;
          total_value?: number | null;
          items_count?: number;
          status?: string;
          last_activity_at?: string;
          created_at?: string;
        };
      };
      product_recommendations: {
        Row: {
          id: string;
          store_id: string;
          session_id: string;
          query: string | null;
          query_type: string | null;
          recommended_products: any;
          clicked_products: any;
          added_to_cart: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          session_id: string;
          query?: string | null;
          query_type?: string | null;
          recommended_products?: any;
          clicked_products?: any;
          added_to_cart?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          session_id?: string;
          query?: string | null;
          query_type?: string | null;
          recommended_products?: any;
          clicked_products?: any;
          added_to_cart?: any;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_store_analytics: {
        Args: {
          store_uuid: string;
          days_back?: number;
        };
        Returns: any;
      };
      increment_message_count: {
        Args: {
          conversation_uuid: string;
        };
        Returns: void;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}