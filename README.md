# Shopify AI Assistant

A comprehensive AI-powered chat assistant for Shopify stores that helps customers find products, get recommendations, and complete purchases through natural language conversations.

## 🚀 Features

### Customer-Facing Chat Widget
- **Natural Language Search**: Find products using conversational queries
- **Image-Based Search**: Upload images to find similar products
- **Smart Recommendations**: AI-powered product suggestions
- **Direct Cart Integration**: Add products to cart directly from chat
- **Multi-language Support**: Communicate in multiple languages

### Admin Dashboard
- **Real-time Analytics**: Track conversations, conversions, and customer behavior
- **Store Configuration**: Easy Shopify API integration setup
- **AI Training**: Customize AI responses with business information
- **Abandoned Cart Tracking**: Monitor and recover lost sales
- **Performance Metrics**: Detailed insights into chat effectiveness

### AI Capabilities
- **Product Discovery**: Intelligent product search and filtering
- **Business Information**: Answer questions about policies, shipping, returns
- **Contextual Conversations**: Maintain conversation context across interactions
- **Custom Training**: Train AI on your specific business needs

## 🛠 Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **AI/ML**: OpenAI GPT integration
- **Deployment**: Netlify/Vercel ready
- **Integration**: Shopify Admin API + Storefront API

## 📦 Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase account
- Shopify store with API access
- OpenAI API key (optional, for enhanced AI features)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd shopify-ai-assistant
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env
```

Fill in your environment variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key (optional)
```

4. **Start development server**
```bash
npm run dev
```

5. **Setup Database**
- Connect to Supabase in the app
- Database tables will be created automatically

## 🔧 Configuration

### Shopify Integration
1. Go to Admin → Settings in the app
2. Add your Shopify store credentials:
   - Store URL (e.g., `yourstore.myshopify.com`)
   - Admin API Access Token
   - Storefront API Access Token

### AI Training
1. Navigate to Admin → AI Training
2. Configure business information:
   - Store policies (shipping, returns, privacy)
   - Product categories and descriptions
   - Custom response templates
   - FAQ and common questions

### Embed Widget
Add this script to your Shopify theme's `theme.liquid` file before `</body>`:

```html
<script>
  window.ShopifyAIConfig = {
    storeUrl: 'your-app-domain.netlify.app',
    storeId: 'your-store-id'
  };
</script>
<script src="https://your-app-domain.netlify.app/embed.js"></script>
```

## 📊 Analytics & Tracking

The app automatically tracks:
- **Conversation Metrics**: Total chats, average duration, customer satisfaction
- **Product Performance**: Most searched, viewed, and purchased items
- **Conversion Funnel**: From chat initiation to purchase completion
- **Abandonment Analysis**: Cart abandonment patterns and recovery opportunities

## 🚀 Deployment

### Netlify Deployment
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy!

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Environment variables will be detected automatically
3. Deploy with zero configuration

## 🔒 Security

- **Row Level Security**: Multi-tenant database architecture
- **API Key Management**: Secure credential storage
- **CORS Configuration**: Proper cross-origin resource sharing
- **Data Encryption**: All sensitive data encrypted at rest

## 📱 Mobile Responsive

The chat widget and admin dashboard are fully responsive and work seamlessly across:
- Desktop browsers
- Mobile devices
- Tablet interfaces
- Shopify mobile app (admin)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the documentation in the `/docs` folder
- Contact support through the admin dashboard

## 🎯 Roadmap

- [ ] Multi-language AI responses
- [ ] Advanced analytics dashboard
- [ ] A/B testing for chat flows
- [ ] Integration with more e-commerce platforms
- [ ] Voice chat capabilities
- [ ] Advanced product recommendation algorithms

---

Built with ❤️ for Shopify merchants who want to provide exceptional customer experiences through AI-powered conversations.