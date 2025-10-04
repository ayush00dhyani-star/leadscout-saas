import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { RedditService } from '@/lib/services/reddit'
import { TwitterService } from '@/lib/services/twitter'
import { OpenAIService } from '@/lib/services/openai'

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting lead monitoring job...')

    // Get all active keywords
    const keywords = await db.keyword.findMany({
      where: { isActive: true },
      include: { user: true }
    })

    if (keywords.length === 0) {
      return NextResponse.json({ message: 'No active keywords to monitor' })
    }

    // Initialize services
    const redditService = new RedditService(
      process.env.REDDIT_CLIENT_ID!,
      process.env.REDDIT_CLIENT_SECRET!,
      process.env.REDDIT_USER_AGENT!
    )

    const twitterService = new TwitterService(
      process.env.TWITTER_BEARER_TOKEN!
    )

    const openaiService = new OpenAIService(
      process.env.OPENAI_API_KEY!
    )

    let totalLeadsProcessed = 0
    let totalLeadsSaved = 0

    // Process each keyword
    for (const keyword of keywords) {
      try {
        const leads: any[] = []

        // Search Reddit if platform is enabled
        if (keyword.platforms.includes('reddit')) {
          try {
            const redditPosts = await redditService.searchPosts(keyword.text, 'hour', 10)
            const redditComments = await redditService.searchComments(keyword.text, 'hour', 10)
            
            // Process Reddit posts
            for (const post of redditPosts) {
              const content = redditService.formatPostContent(post)
              if (content.length > 50) { // Filter out very short content
                leads.push({
                  platform: 'reddit',
                  content,
                  author: post.author,
                  postUrl: redditService.getPostUrl(post),
                  metadata: redditService.extractMetadata(post),
                  keywordId: keyword.id
                })
              }
            }

            // Process Reddit comments
            for (const comment of redditComments) {
              if (comment.body && comment.body.length > 50) {
                leads.push({
                  platform: 'reddit',
                  content: comment.body,
                  author: comment.author,
                  postUrl: `https://reddit.com${comment.permalink}`,
                  metadata: {
                    subreddit: comment.subreddit,
                    score: comment.score,
                    createdUtc: comment.created_utc,
                  },
                  keywordId: keyword.id
                })
              }
            }
          } catch (error) {
            console.error(`Reddit search error for keyword "${keyword.text}":`, error)
          }
        }

        // Search Twitter if platform is enabled
        if (keyword.platforms.includes('twitter')) {
          try {
            const { tweets, users } = await twitterService.searchTweets(keyword.text, 10)
            
            for (const tweet of tweets) {
              const user = users.find(u => u.id === tweet.author_id)
              if (tweet.text.length > 50) {
                leads.push({
                  platform: 'twitter',
                  content: tweet.text,
                  author: user?.username || tweet.author_id,
                  postUrl: twitterService.getTweetUrl(tweet, user?.username),
                  metadata: twitterService.extractMetadata(tweet, user),
                  keywordId: keyword.id
                })
              }
            }
          } catch (error) {
            console.error(`Twitter search error for keyword "${keyword.text}":`, error)
          }
        }

        totalLeadsProcessed += leads.length

        // Score leads with OpenAI
        if (leads.length > 0) {
          const scoringPromises = leads.map(async (lead) => {
            try {
              const { score, reasoning } = await openaiService.scoreLeadIntent(
                lead.content,
                lead.platform
              )

              // Only save leads with score >= 6
              if (score >= 6) {
                // Check if lead already exists (prevent duplicates)
                const existingLead = await db.lead.findFirst({
                  where: {
                    keywordId: lead.keywordId,
                    postUrl: lead.postUrl
                  }
                })

                if (!existingLead) {
                  await db.lead.create({
                    data: {
                      keywordId: lead.keywordId,
                      platform: lead.platform,
                      content: lead.content,
                      author: lead.author,
                      postUrl: lead.postUrl,
                      leadScore: score,
                      metadata: lead.metadata,
                      processed: false
                    }
                  })
                  totalLeadsSaved++

                  // Send notification for high-quality leads (score >= 8)
                  if (score >= 8) {
                    // TODO: Send email notification
                    console.log(`High-quality lead found for user ${keyword.user.email}: Score ${score}`)
                  }
                }
              }
            } catch (error) {
              console.error('Error scoring lead:', error)
            }
          })

          await Promise.allSettled(scoringPromises)
        }

        // Add small delay between keywords to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Error processing keyword "${keyword.text}":`, error)
      }
    }

    console.log(`Lead monitoring completed. Processed: ${totalLeadsProcessed}, Saved: ${totalLeadsSaved}`)

    return NextResponse.json({
      message: 'Lead monitoring completed',
      processed: totalLeadsProcessed,
      saved: totalLeadsSaved
    })
  } catch (error) {
    console.error('Lead monitoring job error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}