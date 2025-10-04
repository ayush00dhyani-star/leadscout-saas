import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123456', 12)
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@leadscout.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@leadscout.com',
      password: hashedPassword,
      company: 'LeadScout Demo',
      role: 'Sales Manager',
    },
  })

  console.log('✅ Created demo user:', demoUser.email)

  // Create demo subscription
  const subscription = await prisma.subscription.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      stripeCustomerId: 'cus_demo_customer',
      stripeSubscriptionId: 'sub_demo_subscription',
      planType: 'pro',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  })

  console.log('✅ Created demo subscription')

  // Create demo keywords
  const keywords = [
    {
      text: 'looking for CRM alternative',
      platforms: ['reddit', 'twitter'],
    },
    {
      text: 'need project management tool',
      platforms: ['reddit', 'twitter'],
    },
    {
      text: 'email marketing software',
      platforms: ['reddit'],
    },
    {
      text: 'customer support platform',
      platforms: ['twitter'],
    },
    {
      text: 'sales automation tool',
      platforms: ['reddit', 'twitter'],
    },
  ]

  const createdKeywords = []
  for (const keywordData of keywords) {
    const keyword = await prisma.keyword.upsert({
      where: {
        userId_text: {
          userId: demoUser.id,
          text: keywordData.text,
        },
      },
      update: {},
      create: {
        userId: demoUser.id,
        text: keywordData.text,
        platforms: keywordData.platforms,
        isActive: true,
      },
    })
    createdKeywords.push(keyword)
  }

  console.log('✅ Created demo keywords:', createdKeywords.length)

  // Create demo leads
  const demoLeads = [
    {
      keywordId: createdKeywords[0].id,
      platform: 'reddit',
      content: 'Hey everyone! We\'re a growing startup and currently using Salesforce, but it\'s getting too expensive for our team of 15. Looking for a more affordable CRM alternative that still has good automation features. Any recommendations? Budget is around $50/user/month.',
      author: 'startup_founder_2024',
      postUrl: 'https://reddit.com/r/sales/comments/demo1',
      leadScore: 9,
      metadata: {
        subreddit: 'sales',
        score: 45,
        numComments: 12,
        createdUtc: Math.floor(Date.now() / 1000) - 3600,
      },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      keywordId: createdKeywords[1].id,
      platform: 'twitter',
      content: 'Our team is drowning in scattered tasks and missed deadlines. We need a project management tool that actually works for remote teams. Tried Asana but it\'s too complex. Any simpler alternatives? #projectmanagement #remotework',
      author: 'remote_team_lead',
      postUrl: 'https://twitter.com/remote_team_lead/status/demo2',
      leadScore: 8,
      metadata: {
        authorId: '1234567890',
        authorName: 'Remote Team Lead',
        authorUsername: 'remote_team_lead',
        authorVerified: false,
        authorFollowers: 1250,
        publicMetrics: {
          retweet_count: 3,
          like_count: 12,
          reply_count: 8,
          quote_count: 1,
        },
      },
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    },
    {
      keywordId: createdKeywords[2].id,
      platform: 'reddit',
      content: 'Running a small e-commerce business and need to step up our email marketing game. Currently just sending manual newsletters. What email marketing software do you recommend for someone just starting out? Preferably something with good templates and automation.',
      author: 'ecommerce_newbie',
      postUrl: 'https://reddit.com/r/entrepreneur/comments/demo3',
      leadScore: 7,
      metadata: {
        subreddit: 'entrepreneur',
        score: 23,
        numComments: 18,
        createdUtc: Math.floor(Date.now() / 1000) - 7200,
      },
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
    {
      keywordId: createdKeywords[3].id,
      platform: 'twitter',
      content: 'Customer support is becoming a nightmare as we scale. Currently using basic email but need something more robust. Looking for a customer support platform that can handle tickets, live chat, and knowledge base. Budget is flexible for the right solution.',
      author: 'saas_cto',
      postUrl: 'https://twitter.com/saas_cto/status/demo4',
      leadScore: 8,
      metadata: {
        authorId: '9876543210',
        authorName: 'SaaS CTO',
        authorUsername: 'saas_cto',
        authorVerified: true,
        authorFollowers: 5420,
        publicMetrics: {
          retweet_count: 7,
          like_count: 24,
          reply_count: 15,
          quote_count: 3,
        },
      },
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    },
    {
      keywordId: createdKeywords[4].id,
      platform: 'reddit',
      content: 'Sales team is spending too much time on manual tasks. We need a sales automation tool that can handle lead scoring, email sequences, and pipeline management. Currently evaluating HubSpot but open to other options. What do you use?',
      author: 'sales_director_pro',
      postUrl: 'https://reddit.com/r/sales/comments/demo5',
      leadScore: 9,
      metadata: {
        subreddit: 'sales',
        score: 67,
        numComments: 31,
        createdUtc: Math.floor(Date.now() / 1000) - 10800,
      },
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    },
    {
      keywordId: createdKeywords[0].id,
      platform: 'reddit',
      content: 'Been using an old CRM system for years and it\'s finally time to upgrade. Looking for something modern with good mobile apps and integrations. Team size is about 25 people. What CRM alternatives would you recommend?',
      author: 'business_owner_2024',
      postUrl: 'https://reddit.com/r/smallbusiness/comments/demo6',
      leadScore: 7,
      metadata: {
        subreddit: 'smallbusiness',
        score: 34,
        numComments: 22,
        createdUtc: Math.floor(Date.now() / 1000) - 14400,
      },
      createdAt: new Date(Date.now() - 16 * 60 * 60 * 1000), // 16 hours ago
    },
    {
      keywordId: createdKeywords[1].id,
      platform: 'twitter',
      content: 'Managing projects across 3 different time zones is chaos. Need a project management tool that works well for distributed teams. Must have good notification system and time tracking. Any suggestions? #projectmanagement',
      author: 'global_pm',
      postUrl: 'https://twitter.com/global_pm/status/demo7',
      leadScore: 6,
      metadata: {
        authorId: '5555555555',
        authorName: 'Global PM',
        authorUsername: 'global_pm',
        authorVerified: false,
        authorFollowers: 890,
        publicMetrics: {
          retweet_count: 2,
          like_count: 8,
          reply_count: 5,
          quote_count: 0,
        },
      },
      createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000), // 20 hours ago
    },
  ]

  for (const leadData of demoLeads) {
    await prisma.lead.upsert({
      where: {
        keywordId_postUrl: {
          keywordId: leadData.keywordId,
          postUrl: leadData.postUrl,
        },
      },
      update: {},
      create: leadData,
    })
  }

  console.log('✅ Created demo leads:', demoLeads.length)

  // Create demo API keys (encrypted placeholders)
  const apiKeys = [
    {
      userId: demoUser.id,
      platform: 'openai',
      keyName: 'OpenAI API Key',
      keyValue: 'encrypted_demo_openai_key',
      isActive: true,
    },
    {
      userId: demoUser.id,
      platform: 'reddit',
      keyName: 'Reddit API Key',
      keyValue: 'encrypted_demo_reddit_key',
      isActive: true,
    },
    {
      userId: demoUser.id,
      platform: 'twitter',
      keyName: 'Twitter Bearer Token',
      keyValue: 'encrypted_demo_twitter_key',
      isActive: true,
    },
  ]

  for (const apiKeyData of apiKeys) {
    await prisma.apiKey.upsert({
      where: {
        userId_platform: {
          userId: apiKeyData.userId,
          platform: apiKeyData.platform,
        },
      },
      update: {},
      create: apiKeyData,
    })
  }

  console.log('✅ Created demo API keys:', apiKeys.length)

  console.log('🎉 Seeding completed successfully!')
  console.log('')
  console.log('Demo login credentials:')
  console.log('Email: demo@leadscout.com')
  console.log('Password: demo123456')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })