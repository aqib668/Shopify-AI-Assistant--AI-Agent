/*
  # Shopify AI Assistant Database Schema

  1. New Tables
    - `stores` - Store configuration and Shopify API credentials
    - `products` - Synced product catalog from Shopify
    - `conversations` - Chat conversations and messages
    - `analytics` - Interaction tracking and conversion metrics
    - `ai_training` - Business information and AI training data
    - `cart_sessions` - Cart tracking and abandonment monitoring

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
    - Secure API credential storage

  3. Features
    - Real-time chat capabilities
    - Product search and recommendations
    - Conversion tracking
    - AI training data management
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Stores table for Shopify configuration
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain text UNIQUE NOT NULL,
  access_token text NOT NULL,
  api_key text,
  api_secret text,
  webhook_secret text,
  store_name text,
  store_email text,
  currency text DEFAULT 'USD',
  timezone text,
  plan_name text,
  is_active boolean DEFAULT true,
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products table synced from Shopify
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  shopify_product_id bigint NOT NULL,
  title text NOT NULL,
  description text,
  vendor text,
  product_type text,
  tags text[],
  handle text,
  status text DEFAULT 'active',
  price_min decimal(10,2),
  price_max decimal(10,2),
  images jsonb DEFAULT '[]',
  variants jsonb DEFAULT '[]',
  options jsonb DEFAULT '[]',
  seo_title text,
  seo_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(store_id, shopify_product_id)
);

-- Conversations table for chat history
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  customer_id text,
  status text DEFAULT 'active',
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  total_messages integer DEFAULT 0,
  converted boolean DEFAULT false,
  conversion_value decimal(10,2),
  metadata jsonb DEFAULT '{}'
);

-- Messages within conversations
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'product', 'cart')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Analytics for tracking interactions
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  session_id text,
  customer_id text,
  product_id uuid REFERENCES products(id),
  conversion_value decimal(10,2),
  created_at timestamptz DEFAULT now()
);

-- AI Training data
CREATE TABLE IF NOT EXISTS ai_training (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('business_info', 'policies', 'products', 'custom_prompts')),
  title text NOT NULL,
  content text NOT NULL,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cart sessions for abandonment tracking
CREATE TABLE IF NOT EXISTS cart_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  customer_id text,
  cart_data jsonb DEFAULT '{}',
  total_value decimal(10,2),
  items_count integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'converted', 'abandoned')),
  last_activity_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(store_id, session_id)
);

-- Product recommendations tracking
CREATE TABLE IF NOT EXISTS product_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  query text,
  query_type text CHECK (query_type IN ('text', 'image')),
  recommended_products jsonb DEFAULT '[]',
  clicked_products jsonb DEFAULT '[]',
  added_to_cart jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_title_gin ON products USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_description_gin ON products USING gin(description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_conversations_store_id ON conversations(store_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_analytics_store_id ON analytics(store_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_cart_sessions_store_id ON cart_sessions(store_id);
CREATE INDEX IF NOT EXISTS idx_cart_sessions_session_id ON cart_sessions(session_id);

-- Enable Row Level Security
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stores
CREATE POLICY "Stores are viewable by authenticated users"
  ON stores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Stores can be inserted by authenticated users"
  ON stores FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Stores can be updated by authenticated users"
  ON stores FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for products
CREATE POLICY "Products are viewable by authenticated users"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Products can be managed by authenticated users"
  ON products FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for conversations
CREATE POLICY "Conversations are viewable by authenticated users"
  ON conversations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Conversations can be managed by authenticated users"
  ON conversations FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for messages
CREATE POLICY "Messages are viewable by authenticated users"
  ON messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Messages can be managed by authenticated users"
  ON messages FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for analytics
CREATE POLICY "Analytics are viewable by authenticated users"
  ON analytics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Analytics can be managed by authenticated users"
  ON analytics FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for ai_training
CREATE POLICY "AI training data is viewable by authenticated users"
  ON ai_training FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "AI training data can be managed by authenticated users"
  ON ai_training FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for cart_sessions
CREATE POLICY "Cart sessions are viewable by authenticated users"
  ON cart_sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Cart sessions can be managed by authenticated users"
  ON cart_sessions FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for product_recommendations
CREATE POLICY "Product recommendations are viewable by authenticated users"
  ON product_recommendations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Product recommendations can be managed by authenticated users"
  ON product_recommendations FOR ALL
  TO authenticated
  USING (true);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_training_updated_at BEFORE UPDATE ON ai_training
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get store analytics
CREATE OR REPLACE FUNCTION get_store_analytics(store_uuid uuid, days_back integer DEFAULT 30)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_conversations', (
      SELECT COUNT(*) FROM conversations 
      WHERE store_id = store_uuid 
      AND started_at >= now() - interval '1 day' * days_back
    ),
    'total_messages', (
      SELECT COUNT(*) FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE c.store_id = store_uuid
      AND m.created_at >= now() - interval '1 day' * days_back
    ),
    'conversion_rate', (
      SELECT CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND((COUNT(*) FILTER (WHERE converted = true)::decimal / COUNT(*)) * 100, 2)
      END
      FROM conversations 
      WHERE store_id = store_uuid
      AND started_at >= now() - interval '1 day' * days_back
    ),
    'total_revenue', (
      SELECT COALESCE(SUM(conversion_value), 0)
      FROM conversations
      WHERE store_id = store_uuid
      AND converted = true
      AND started_at >= now() - interval '1 day' * days_back
    ),
    'abandoned_carts', (
      SELECT COUNT(*)
      FROM cart_sessions
      WHERE store_id = store_uuid
      AND status = 'abandoned'
      AND created_at >= now() - interval '1 day' * days_back
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;