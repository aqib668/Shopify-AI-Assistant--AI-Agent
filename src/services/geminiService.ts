import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

if (!API_KEY) {
  console.warn('Gemini API key not found. AI features will be limited.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async generateResponse(
    prompt: string,
    context: {
      products?: any[];
      storeInfo?: any;
      conversationHistory?: any[];
      businessInfo?: any[];
    } = {}
  ): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(context);
      const fullPrompt = `${systemPrompt}\n\nCustomer: ${prompt}`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      return this.getFallbackResponse(prompt);
    }
  }

  async searchProducts(
    query: string,
    products: any[],
    limit: number = 5
  ): Promise<{
    products: any[];
    explanation: string;
  }> {
    try {
      const searchPrompt = `
You are a product search assistant for an e-commerce store. 

Available products:
${products.map(p => `- ${p.title}: ${p.description || 'No description'} (Price: $${p.price_min || 'N/A'})`).join('\n')}

Customer search query: "${query}"

Please:
1. Find the most relevant products that match the customer's query
2. Return the product IDs of the best matches (maximum ${limit} products)
3. Provide a brief explanation of why these products match

Respond in this exact JSON format:
{
  "productIds": [array of product IDs],
  "explanation": "Brief explanation of the matches"
}
`;

      const result = await this.model.generateContent(searchPrompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const parsed = JSON.parse(text);
        const matchedProducts = products.filter(p => 
          parsed.productIds.includes(p.id) || 
          parsed.productIds.includes(p.shopify_product_id)
        );
        
        return {
          products: matchedProducts.slice(0, limit),
          explanation: parsed.explanation || 'Found relevant products for your search.'
        };
      } catch (parseError) {
        // Fallback to simple text matching
        return this.fallbackProductSearch(query, products, limit);
      }
    } catch (error) {
      console.error('Product search error:', error);
      return this.fallbackProductSearch(query, products, limit);
    }
  }

  async analyzeImage(imageBase64: string, products: any[]): Promise<{
    products: any[];
    description: string;
  }> {
    try {
      const imagePrompt = `
Analyze this image and find similar products from our catalog.

Available products:
${products.map(p => `- ${p.title}: ${p.description || 'No description'}`).join('\n')}

Please:
1. Describe what you see in the image
2. Find products that match or are similar to items in the image
3. Explain why these products are relevant

Respond in this exact JSON format:
{
  "description": "Description of what you see in the image",
  "productIds": [array of matching product IDs],
  "explanation": "Why these products match the image"
}
`;

      const imagePart = {
        inlineData: {
          data: imageBase64.split(',')[1], // Remove data:image/jpeg;base64, prefix
          mimeType: 'image/jpeg'
        }
      };

      const result = await this.model.generateContent([imagePrompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      try {
        const parsed = JSON.parse(text);
        const matchedProducts = products.filter(p => 
          parsed.productIds.includes(p.id) || 
          parsed.productIds.includes(p.shopify_product_id)
        );

        return {
          products: matchedProducts.slice(0, 5),
          description: parsed.description || 'I can see items in this image that might match our products.'
        };
      } catch (parseError) {
        return {
          products: products.slice(0, 3), // Return some random products as fallback
          description: 'I can see your image. Here are some products that might interest you.'
        };
      }
    } catch (error) {
      console.error('Image analysis error:', error);
      return {
        products: products.slice(0, 3),
        description: 'I received your image. Here are some popular products you might like.'
      };
    }
  }

  async generateProductRecommendations(
    userPreferences: string,
    products: any[],
    conversationHistory: any[] = []
  ): Promise<{
    products: any[];
    explanation: string;
  }> {
    try {
      const recommendationPrompt = `
You are a personal shopping assistant. Based on the customer's preferences and conversation history, recommend the best products.

Customer preferences: "${userPreferences}"

Conversation history:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Available products:
${products.map(p => `- ID: ${p.id}, Title: ${p.title}, Price: $${p.price_min || 'N/A'}, Description: ${p.description || 'No description'}`).join('\n')}

Please recommend 3-5 products that best match the customer's needs and explain why.

Respond in this exact JSON format:
{
  "productIds": [array of recommended product IDs],
  "explanation": "Personalized explanation of why these products are recommended"
}
`;

      const result = await this.model.generateContent(recommendationPrompt);
      const response = await result.response;
      const text = response.text();

      try {
        const parsed = JSON.parse(text);
        const recommendedProducts = products.filter(p => 
          parsed.productIds.includes(p.id) || 
          parsed.productIds.includes(p.shopify_product_id)
        );

        return {
          products: recommendedProducts.slice(0, 5),
          explanation: parsed.explanation || 'Here are some products I think you\'ll love!'
        };
      } catch (parseError) {
        return this.fallbackRecommendations(products);
      }
    } catch (error) {
      console.error('Recommendation error:', error);
      return this.fallbackRecommendations(products);
    }
  }

  private buildSystemPrompt(context: any): string {
    const { storeInfo, businessInfo } = context;
    
    let systemPrompt = `You are a helpful AI shopping assistant for ${storeInfo?.store_name || 'our store'}. 

Your role is to:
- Help customers find products they're looking for
- Answer questions about products, shipping, returns, and store policies
- Provide personalized recommendations
- Assist with adding items to cart
- Be friendly, helpful, and knowledgeable

Store Information:
- Store Name: ${storeInfo?.store_name || 'Our Store'}
- Currency: ${storeInfo?.currency || 'USD'}
- Email: ${storeInfo?.store_email || 'Not provided'}

`;

    if (businessInfo && businessInfo.length > 0) {
      systemPrompt += `\nBusiness Information:\n`;
      businessInfo.forEach(info => {
        systemPrompt += `- ${info.title}: ${info.content}\n`;
      });
    }

    systemPrompt += `\nGuidelines:
- Always be helpful and friendly
- If you don't know something, say so honestly
- When recommending products, explain why they're a good fit
- Keep responses concise but informative
- If a customer wants to add something to cart, confirm the product and guide them through the process
- For shipping, returns, or policy questions, refer to the business information provided above

`;

    return systemPrompt;
  }

  private getFallbackResponse(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('shipping')) {
      return "I'd be happy to help with shipping information! Please check our shipping policy for detailed information, or feel free to ask specific questions about delivery times and costs.";
    }
    
    if (lowerPrompt.includes('return') || lowerPrompt.includes('refund')) {
      return "For returns and refunds, please refer to our return policy. If you have specific questions about returning an item, I'm here to help!";
    }
    
    if (lowerPrompt.includes('size') || lowerPrompt.includes('sizing')) {
      return "For sizing information, please check the product details page where you'll find our size chart and fitting guide.";
    }
    
    return "I'm here to help you find what you're looking for! Could you tell me more about what you need, or would you like me to show you some of our popular products?";
  }

  private fallbackProductSearch(query: string, products: any[], limit: number) {
    const lowerQuery = query.toLowerCase();
    const matchedProducts = products.filter(product => 
      product.title.toLowerCase().includes(lowerQuery) ||
      (product.description && product.description.toLowerCase().includes(lowerQuery)) ||
      (product.tags && product.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery)))
    ).slice(0, limit);

    return {
      products: matchedProducts,
      explanation: matchedProducts.length > 0 
        ? `Found ${matchedProducts.length} products matching "${query}"`
        : `No exact matches found for "${query}". Here are some popular products you might like.`
    };
  }

  private fallbackRecommendations(products: any[]) {
    return {
      products: products.slice(0, 3),
      explanation: "Here are some of our popular products that customers love!"
    };
  }
}

export const geminiService = new GeminiService();