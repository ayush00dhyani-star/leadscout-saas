interface TwitterTweet {
  id: string
  text: string
  author_id: string
  created_at: string
  public_metrics: {
    retweet_count: number
    like_count: number
    reply_count: number
    quote_count: number
  }
  context_annotations?: Array<{
    domain: {
      id: string
      name: string
      description: string
    }
    entity: {
      id: string
      name: string
      description: string
    }
  }>
}

interface TwitterUser {
  id: string
  name: string
  username: string
  verified: boolean
  public_metrics: {
    followers_count: number
    following_count: number
    tweet_count: number
  }
}

interface TwitterSearchResponse {
  data?: TwitterTweet[]
  includes?: {
    users?: TwitterUser[]
  }
  meta: {
    result_count: number
    next_token?: string
  }
}

export class TwitterService {
  constructor(private bearerToken: string) {}

  async searchTweets(
    query: string,
    maxResults: number = 10,
    sinceId?: string
  ): Promise<{ tweets: TwitterTweet[], users: TwitterUser[] }> {
    const params = new URLSearchParams({
      query: `${query} -is:retweet lang:en`,
      max_results: Math.min(maxResults, 100).toString(),
      'tweet.fields': 'created_at,author_id,public_metrics,context_annotations',
      'user.fields': 'name,username,verified,public_metrics',
      expansions: 'author_id',
    })

    if (sinceId) {
      params.append('since_id', sinceId)
    }

    const response = await fetch(`https://api.twitter.com/2/tweets/search/recent?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.bearerToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.statusText}`)
    }

    const data: TwitterSearchResponse = await response.json()
    
    return {
      tweets: data.data || [],
      users: data.includes?.users || [],
    }
  }

  async createFilteredStream(keywords: string[]): Promise<void> {
    // First, delete existing rules
    await this.deleteStreamRules()

    // Create new rules for keywords
    const rules = keywords.map((keyword, index) => ({
      value: `${keyword} -is:retweet lang:en`,
      tag: `keyword_${index}`,
    }))

    const response = await fetch('https://api.twitter.com/2/tweets/search/stream/rules', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.bearerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ add: rules }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create Twitter stream rules: ${response.statusText}`)
    }
  }

  private async deleteStreamRules(): Promise<void> {
    // Get existing rules
    const rulesResponse = await fetch('https://api.twitter.com/2/tweets/search/stream/rules', {
      headers: {
        'Authorization': `Bearer ${this.bearerToken}`,
      },
    })

    if (!rulesResponse.ok) {
      return // No existing rules
    }

    const rulesData = await rulesResponse.json()
    
    if (rulesData.data && rulesData.data.length > 0) {
      const ruleIds = rulesData.data.map((rule: any) => rule.id)
      
      await fetch('https://api.twitter.com/2/tweets/search/stream/rules', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ delete: { ids: ruleIds } }),
      })
    }
  }

  async connectToStream(onTweet: (tweet: TwitterTweet, user?: TwitterUser) => void): Promise<void> {
    const response = await fetch('https://api.twitter.com/2/tweets/search/stream?tweet.fields=created_at,author_id,public_metrics&user.fields=name,username,verified,public_metrics&expansions=author_id', {
      headers: {
        'Authorization': `Bearer ${this.bearerToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to connect to Twitter stream: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Failed to get stream reader')
    }

    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())

        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            
            if (data.data) {
              const user = data.includes?.users?.[0]
              onTweet(data.data, user)
            }
          } catch (error) {
            // Ignore JSON parse errors for heartbeat messages
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  getTweetUrl(tweet: TwitterTweet, username?: string): string {
    if (username) {
      return `https://twitter.com/${username}/status/${tweet.id}`
    }
    return `https://twitter.com/i/status/${tweet.id}`
  }

  extractMetadata(tweet: TwitterTweet, user?: TwitterUser) {
    return {
      authorId: tweet.author_id,
      authorName: user?.name,
      authorUsername: user?.username,
      authorVerified: user?.verified,
      authorFollowers: user?.public_metrics?.followers_count,
      publicMetrics: tweet.public_metrics,
      contextAnnotations: tweet.context_annotations,
    }
  }
}