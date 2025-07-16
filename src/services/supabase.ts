@@ .. @@
 import { createClient } from '@supabase/supabase-js';
+import type { Database } from '../types/database';
 
-const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
-const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
+const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
+const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
 
-export const supabase = createClient(supabaseUrl, supabaseAnonKey);
+if (!supabaseUrl || !supabaseAnonKey) {
+  console.error('Missing Supabase environment variables');
+}
+
+export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
+  auth: {
+    persistSession: true,
+    autoRefreshToken: true,
+  },
+  realtime: {
+    params: {
+      eventsPerSecond: 10,
+    },
+  },
+});
+
+// Database service functions
+export const dbService = {
+  // Store management
+  async createStore(storeData: any) {
+    const { data, error } = await supabase
+      .from('stores')
+      .insert(storeData)
+      .select()
+      .single();
+    
+    if (error) throw error;
+    return data;
+  },
+
+  async getStore(shopDomain: string) {
+    const { data, error } = await supabase
+      .from('stores')
+      .select('*')
+      .eq('shop_domain', shopDomain)
+      .single();
+    
+    if (error && error.code !== 'PGRST116') throw error;
+    return data;
+  },
+
+  async updateStore(id: string, updates: any) {
+    const { data, error } = await supabase
+      .from('stores')
+      .update(updates)
+      .eq('id', id)
+      .select()
+      .single();
+    
+    if (error) throw error;
+    return data;
+  },
+
+  // Product management
+  async syncProducts(storeId: string, products: any[]) {
+    const { data, error } = await supabase
+      .from('products')
+      .upsert(
+        products.map(product => ({
+          ...product,
+          store_id: storeId,
+        })),
+        { 
+          onConflict: 'store_id,shopify_product_id',
+          ignoreDuplicates: false 
+        }
+      )
+      .select();
+    
+    if (error) throw error;
+    return data;
+  },
+
+  async searchProducts(storeId: string, query: string, limit = 10) {
+    const { data, error } = await supabase
+      .from('products')
+      .select('*')
+      .eq('store_id', storeId)
+      .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
+      .eq('status', 'active')
+      .limit(limit);
+    
+    if (error) throw error;
+    return data;
+  },
+
+  // Conversation management
+  async createConversation(conversationData: any) {
+    const { data, error } = await supabase
+      .from('conversations')
+      .insert(conversationData)
+      .select()
+      .single();
+    
+    if (error) throw error;
+    return data;
+  },
+
+  async addMessage(messageData: any) {
+    const { data, error } = await supabase
+      .from('messages')
+      .insert(messageData)
+      .select()
+      .single();
+    
+    if (error) throw error;
+    
+    // Update conversation message count
+    await supabase.rpc('increment_message_count', {
+      conversation_uuid: messageData.conversation_id
+    });
+    
+    return data;
+  },
+
+  async getConversationMessages(conversationId: string) {
+    const { data, error } = await supabase
+      .from('messages')
+      .select('*')
+      .eq('conversation_id', conversationId)
+      .order('created_at', { ascending: true });
+    
+    if (error) throw error;
+    return data;
+  },
+
+  // Analytics
+  async trackEvent(eventData: any) {
+    const { data, error } = await supabase
+      .from('analytics')
+      .insert(eventData)
+      .select()
+      .single();
+    
+    if (error) throw error;
+    return data;
+  },
+
+  async getStoreAnalytics(storeId: string, daysBack = 30) {
+    const { data, error } = await supabase
+      .rpc('get_store_analytics', {
+        store_uuid: storeId,
+        days_back: daysBack
+      });
+    
+    if (error) throw error;
+    return data;
+  },
+
+  // AI Training
+  async getAITrainingData(storeId: string) {
+    const { data, error } = await supabase
+      .from('ai_training')
+      .select('*')
+      .eq('store_id', storeId)
+      .eq('is_active', true)
+      .order('priority', { ascending: false });
+    
+    if (error) throw error;
+    return data;
+  },
+
+  async saveAITrainingData(trainingData: any) {
+    const { data, error } = await supabase
+      .from('ai_training')
+      .upsert(trainingData)
+      .select();
+    
+    if (error) throw error;
+    return data;
+  },
+
+  // Cart sessions
+  async updateCartSession(sessionData: any) {
+    const { data, error } = await supabase
+      .from('cart_sessions')
+      .upsert(sessionData, {
+        onConflict: 'store_id,session_id'
+      })
+      .select()
+      .single();
+    
+    if (error) throw error;
+    return data;
+  },
+
+  async getAbandonedCarts(storeId: string, hoursBack = 24) {
+    const { data, error } = await supabase
+      .from('cart_sessions')
+      .select('*')
+      .eq('store_id', storeId)
+      .eq('status', 'abandoned')
+      .gte('last_activity_at', new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString());
+    
+    if (error) throw error;
+    return data;
+  }
+};