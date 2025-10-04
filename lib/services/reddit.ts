interface RedditPost {
  id: string
  title: string
  selftext: string
  author: string
  permalink: string
  created_utc: number
  subreddit: string
  score: number
  num_comments: number
}

interface RedditSearchResponse {
  data: {
    children: Array<{
      data: RedditPost
    }>
  }
}

export class RedditService {
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor(
    private clientId: string,
    private clientSecret: string,
    private userAgent: string
  ) {}

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')
    
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': this.userAgent,
      },
      body: 'grant_type=client_credentials',
    })

    if (!response.ok) {
      throw new Error(`Failed to get Reddit access token: ${response.statusText}`)
    }

    const data = await response.json()
    this.accessToken = data.access_token
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000 // 1 minute buffer

    return this.accessToken
  }

  async searchPosts(
    keyword: string,
    timeFilter: 'hour' | 'day' | 'week' = 'hour',
    limit: number = 25
  ): Promise<RedditPost[]> {
    const token = await this.getAccessToken()
    
    const params = new URLSearchParams({
      q: keyword,
      type: 'link',
      sort: 'new',
      t: timeFilter,
      limit: limit.toString(),
    })

    const response = await fetch(`https://oauth.reddit.com/search?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': this.userAgent,
      },
    })

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.statusText}`)
    }

    const data: RedditSearchResponse = await response.json()
    return data.data.children.map(child => child.data)
  }

  async searchComments(
    keyword: string,
    timeFilter: 'hour' | 'day' | 'week' = 'hour',
    limit: number = 25
  ): Promise<any[]> {
    const token = await this.getAccessToken()
    
    const params = new URLSearchParams({
      q: keyword,
      type: 'comment',
      sort: 'new',
      t: timeFilter,
      limit: limit.toString(),
    })

    const response = await fetch(`https://oauth.reddit.com/search?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': this.userAgent,
      },
    })

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data.children.map((child: any) => child.data)
  }

  formatPostContent(post: RedditPost): string {
    const title = post.title || ''
    const content = post.selftext || ''
    return `${title}\n\n${content}`.trim()
  }

  getPostUrl(post: RedditPost): string {
    return `https://reddit.com${post.permalink}`
  }

  extractMetadata(post: RedditPost) {
    return {
      subreddit: post.subreddit,
      score: post.score,
      numComments: post.num_comments,
      createdUtc: post.created_utc,
    }
  }
}