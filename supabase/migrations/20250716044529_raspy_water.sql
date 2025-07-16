/*
  # Helper Functions for Shopify AI Assistant

  1. Functions
    - `increment_message_count` - Updates conversation message count
    - `mark_cart_abandoned` - Marks cart sessions as abandoned after inactivity
    - `get_popular_products` - Returns most searched/viewed products
    - `get_conversion_funnel` - Returns conversion funnel analytics

  2. Triggers
    - Auto-update cart session activity
    - Auto-mark abandoned carts
*/

-- Function to increment message count in conversations
CREATE OR REPLACE FUNCTION increment_message_count(conversation_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE conversations 
  SET total_messages = total_messages + 1
  WHERE id = conversation_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark cart sessions as abandoned
CREATE OR REPLACE FUNCTION mark_cart_abandoned(hours_inactive integer DEFAULT 2)
RETURNS integer AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE cart_sessions 
  SET status = 'abandoned'
  WHERE status = 'active'
    AND last_activity_at < now() - interval '1 hour' * hours_inactive;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get popular products
CREATE OR REPLACE FUNCTION get_popular_products(store_uuid uuid, days_back integer DEFAULT 7, limit_count integer DEFAULT 10)
RETURNS TABLE(
  product_id uuid,
  title text,
  view_count bigint,
  cart_count bigint,
  conversion_rate decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.title,
    COUNT(CASE WHEN a.event_type = 'product_view' THEN 1 END) as view_count,
    COUNT(CASE WHEN a.event_type = 'add_to_cart' THEN 1 END) as cart_count,
    CASE 
      WHEN COUNT(CASE WHEN a.event_type = 'product_view' THEN 1 END) = 0 THEN 0
      ELSE ROUND(
        (COUNT(CASE WHEN a.event_type = 'add_to_cart' THEN 1 END)::decimal / 
         COUNT(CASE WHEN a.event_type = 'product_view' THEN 1 END)) * 100, 2
      )
    END as conversion_rate
  FROM products p
  LEFT JOIN analytics a ON p.id = a.product_id 
    AND a.created_at >= now() - interval '1 day' * days_back
  WHERE p.store_id = store_uuid
    AND p.status = 'active'
  GROUP BY p.id, p.title
  ORDER BY view_count DESC, cart_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get conversion funnel data
CREATE OR REPLACE FUNCTION get_conversion_funnel(store_uuid uuid, days_back integer DEFAULT 30)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_sessions', (
      SELECT COUNT(DISTINCT session_id)
      FROM analytics
      WHERE store_id = store_uuid
      AND created_at >= now() - interval '1 day' * days_back
    ),
    'product_views', (
      SELECT COUNT(*)
      FROM analytics
      WHERE store_id = store_uuid
      AND event_type = 'product_view'
      AND created_at >= now() - interval '1 day' * days_back
    ),
    'add_to_cart', (
      SELECT COUNT(*)
      FROM analytics
      WHERE store_id = store_uuid
      AND event_type = 'add_to_cart'
      AND created_at >= now() - interval '1 day' * days_back
    ),
    'checkout_started', (
      SELECT COUNT(*)
      FROM analytics
      WHERE store_id = store_uuid
      AND event_type = 'checkout_started'
      AND created_at >= now() - interval '1 day' * days_back
    ),
    'purchase_completed', (
      SELECT COUNT(*)
      FROM analytics
      WHERE store_id = store_uuid
      AND event_type = 'purchase_completed'
      AND created_at >= now() - interval '1 day' * days_back
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update cart session activity
CREATE OR REPLACE FUNCTION update_cart_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE cart_sessions 
  SET last_activity_at = now()
  WHERE session_id = NEW.session_id
    AND store_id = NEW.store_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update cart activity when analytics events are created
CREATE TRIGGER update_cart_activity_trigger
  AFTER INSERT ON analytics
  FOR EACH ROW
  WHEN (NEW.event_type IN ('add_to_cart', 'remove_from_cart', 'cart_view'))
  EXECUTE FUNCTION update_cart_activity();

-- Function to clean old analytics data (optional, for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_analytics(days_to_keep integer DEFAULT 90)
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM analytics 
  WHERE created_at < now() - interval '1 day' * days_to_keep;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;