@@ .. @@
 import { useState, useRef, useEffect } from 'react';
 import { Send, Image, ShoppingCart, X, MessageCircle, Loader2 } from 'lucide-react';
-import { aiService } from '../services/aiService';
+import { geminiService } from '../services/geminiService';
 import { shopifyService } from '../services/shopify';
 import { dbService } from '../services/supabase';
@@ .. @@
   const handleSendMessage = async () => {
     if (!input.trim() && !selectedImage) return;
 
     const userMessage = input.trim();
     const imageFile = selectedImage;
     
     setInput('');
     setSelectedImage(null);
     setIsLoading(true);

     // Add user message
     const newUserMessage: Message = {
       id: Date.now().toString(),
       content: userMessage || 'Shared an image',
       sender: 'user',
       timestamp: new Date(),
       image: imageFile ? URL.createObjectURL(imageFile) : undefined
     };

     setMessages(prev => [...prev, newUserMessage]);

     try {
       let aiResponse: string;
       let recommendedProducts: any[] = [];

       if (imageFile) {
         // Handle image-based search
         const imageBase64 = await convertImageToBase64(imageFile);
-        const result = await aiService.analyzeImage(imageFile, products);
+        const result = await geminiService.analyzeImage(imageBase64, products);
         recommendedProducts = result.products;
         aiResponse = result.explanation;
       } else if (userMessage) {
         // Check if user is asking for specific product or general query
         const exactProduct = findExactProduct(userMessage, products);
         
         if (exactProduct) {
           // Direct product match - offer to add to cart
           aiResponse = `I found exactly what you're looking for! "${exactProduct.title}" is available for $${exactProduct.price_min}. Would you like me to add it to your cart?`;
           recommendedProducts = [exactProduct];
         } else {
           // General search or conversation
-          const searchResult = await aiService.searchProducts(userMessage, products, 5);
+          const searchResult = await geminiService.searchProducts(userMessage, products, 5);
           recommendedProducts = searchResult.products;
           
           if (recommendedProducts.length > 0) {
             aiResponse = `${searchResult.explanation} Here are the products I found:`;
           } else {
             // Generate conversational response
-            aiResponse = await aiService.generateResponse(userMessage, {
+            aiResponse = await geminiService.generateResponse(userMessage, {
               products,
               storeInfo: store,
               conversationHistory: messages.slice(-5), // Last 5 messages for context
               businessInfo: []
             });
           }
         }
       }
@@ .. @@
+  const convertImageToBase64 = (file: File): Promise<string> => {
+    return new Promise((resolve, reject) => {
+      const reader = new FileReader();
+      reader.onload = () => resolve(reader.result as string);
+      reader.onerror = reject;
+      reader.readAsDataURL(file);
+    });
+  };
+
   const findExactProduct = (query: string, products: any[]): any | null => {