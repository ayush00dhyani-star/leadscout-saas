# LeadScout - AI-Powered B2B Lead Generation

LeadScout is a comprehensive B2B SaaS application that monitors Reddit and Twitter for buying intent signals, using AI to score and deliver high-quality leads to your inbox.

## 🚀 Features

- **Smart Monitoring**: Track unlimited keywords across Reddit and Twitter
- **AI Lead Scoring**: GPT-4 powered scoring rates buying intent from 1-10
- **Real-time Alerts**: Get notified immediately for high-value leads (8+ score)
- **Analytics Dashboard**: Track performance with detailed metrics
- **Multi-tier Pricing**: Starter ($49), Pro ($149), Enterprise ($299)
- **Secure & Scalable**: Enterprise-grade security with 99.9% uptime

## 🛠 Tech Stack

- **Frontend**: Next.js 14 with App Router, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with email/password
- **Payments**: Stripe integration
- **APIs**: Reddit API, Twitter API v2, OpenAI API
- **Deployment**: Ready for Replit, Vercel, or any Node.js platform

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- API keys for:
  - OpenAI (GPT-4)
  - Reddit API
  - Twitter API v2
  - Stripe (for payments)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/ayush00dhyani-star/leadscout-saas.git
cd leadscout-saas
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Required environment variables:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/leadscout"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# API Keys
OPENAI_API_KEY="sk-..."
REDDIT_CLIENT_ID="your-reddit-client-id"
REDDIT_CLIENT_SECRET="your-reddit-client-secret"
REDDIT_USER_AGENT="LeadScout/1.0"
TWITTER_BEARER_TOKEN="your-twitter-bearer-token"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Additional
ENCRYPTION_KEY="your-32-character-encryption-key"
CRON_SECRET="your-cron-secret-key"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed with demo data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🔑 Demo Login

After seeding, you can login with:
- **Email**: demo@leadscout.com
- **Password**: demo123456

## 📊 Database Schema

### Core Models

- **Users**: Authentication and profile data
- **Keywords**: Tracked search terms with platform settings
- **Leads**: Discovered leads with AI scores and metadata
- **Subscriptions**: Stripe billing and plan management
- **ApiKeys**: Encrypted API keys for external services

### Key Relationships

- Users have many Keywords and one Subscription
- Keywords have many Leads
- Leads belong to Keywords (and indirectly to Users)

## 🔄 Background Jobs

### Lead Monitoring (Every 5 minutes)

The cron job at `/api/cron/monitor-leads` handles:

1. Fetches all active keywords
2. Searches Reddit and Twitter APIs
3. Scores content with OpenAI GPT-4
4. Saves leads with score ≥ 6
5. Sends notifications for score ≥ 8

### Setup Cron Job

For production, set up a cron job or use a service like Vercel Cron:

```bash
# Every 5 minutes
*/5 * * * * curl -X POST https://your-domain.com/api/cron/monitor-leads \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 🎨 UI Components

Built with shadcn/ui components:
- Responsive design with mobile-first approach
- Modern B2B SaaS aesthetic
- Loading states and skeleton screens
- Toast notifications for user feedback

## 💳 Stripe Integration

### Plans

- **Starter**: $49/month, 10 keywords
- **Pro**: $149/month, 50 keywords  
- **Enterprise**: $299/month, unlimited keywords

### Setup

1. Create products in Stripe Dashboard
2. Add price IDs to environment variables
3. Configure webhooks for subscription events

## 🔐 Security Features

- Password hashing with bcrypt
- API key encryption
- Rate limiting on endpoints
- CORS configuration
- Row-level security for multi-tenant data
- Environment variable protection

## 📈 Analytics & Monitoring

Dashboard includes:
- Total leads and conversion rates
- Lead quality distribution
- Platform performance metrics
- Keyword effectiveness tracking
- Real-time activity feed

## 🚀 Deployment

### Replit Deployment

1. Import repository to Replit
2. Set environment variables in Secrets
3. Run database migrations
4. Start the application

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:
- Database connection string
- API keys for all services
- NextAuth configuration
- Stripe keys and webhook secrets

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login (handled by NextAuth)

### Keywords
- `GET /api/keywords` - List user's keywords
- `POST /api/keywords` - Create new keyword
- `PATCH /api/keywords/[id]` - Update keyword
- `DELETE /api/keywords/[id]` - Delete keyword

### Leads
- `GET /api/leads` - List leads with filtering
- `PATCH /api/leads` - Mark leads as processed

### Cron Jobs
- `POST /api/cron/monitor-leads` - Background lead monitoring

## 🧪 Testing

The application includes demo data for testing:
- Sample keywords across different industries
- Mock leads with various scores
- Different platforms (Reddit/Twitter)
- Realistic content and metadata

## 📝 Development Notes

### Adding New Platforms

1. Create service class in `lib/services/`
2. Update keyword platforms enum
3. Add platform logic to cron job
4. Update UI components

### Customizing AI Scoring

Modify the OpenAI prompt in `lib/services/openai.ts` to adjust:
- Scoring criteria
- Industry-specific factors
- Language and tone analysis

### Extending Analytics

Add new metrics by:
1. Creating database queries
2. Adding API endpoints
3. Building dashboard components
4. Implementing charts with Recharts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the demo data and examples

## 🎯 Roadmap

- [ ] Additional social platforms (LinkedIn, Discord)
- [ ] Advanced filtering and search
- [ ] Team collaboration features
- [ ] API for third-party integrations
- [ ] Mobile app
- [ ] Advanced analytics and reporting
- [ ] Custom AI model training
- [ ] Webhook integrations

---

Built with ❤️ using Next.js, Prisma, and modern web technologies.