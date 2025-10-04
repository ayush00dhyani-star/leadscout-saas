import OpenAI from 'openai'

export class OpenAIService {
  private openai: OpenAI

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey,
    })
  }

  async scoreLeadIntent(content: string, platform: string): Promise<{
    score: number
    reasoning: string
  }> {
    try {
      const prompt = `Rate this ${platform} post as a B2B sales lead from 1-10 based on buying intent, urgency, budget indicators, and decision-maker language.

Post content:
"${content}"

Consider these factors:
- Buying intent keywords (looking for, need, want, seeking, shopping for, etc.)
- Urgency indicators (ASAP, urgent, deadline, soon, etc.)
- Budget mentions (budget, price, cost, affordable, expensive, etc.)
- Decision-maker language (I need, we're looking, our company, etc.)
- Problem statements indicating pain points
- Comparison requests (vs, alternative, better than, etc.)

Respond with only a number (1-10) followed by a brief 10-word reasoning.
Format: "Score: X - Brief reasoning here"`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert B2B sales lead qualifier. Rate social media posts for buying intent on a scale of 1-10.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.3,
      })

      const result = response.choices[0]?.message?.content?.trim() || ''
      
      // Parse the response
      const scoreMatch = result.match(/Score:\s*(\d+)/)
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 1
      
      const reasoningMatch = result.match(/Score:\s*\d+\s*-\s*(.+)/)
      const reasoning = reasoningMatch ? reasoningMatch[1].trim() : 'Unable to analyze content'

      return {
        score: Math.max(1, Math.min(10, score)), // Ensure score is between 1-10
        reasoning
      }
    } catch (error) {
      console.error('OpenAI scoring error:', error)
      return {
        score: 1,
        reasoning: 'Error analyzing content'
      }
    }
  }

  async batchScoreLeads(leads: Array<{
    content: string
    platform: string
  }>): Promise<Array<{
    score: number
    reasoning: string
  }>> {
    // Process leads in batches to avoid rate limits
    const batchSize = 5
    const results: Array<{ score: number; reasoning: string }> = []

    for (let i = 0; i < leads.length; i += batchSize) {
      const batch = leads.slice(i, i + batchSize)
      
      const batchPromises = batch.map(lead => 
        this.scoreLeadIntent(lead.content, lead.platform)
      )

      const batchResults = await Promise.allSettled(batchPromises)
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          results.push({
            score: 1,
            reasoning: 'Error processing lead'
          })
        }
      })

      // Add delay between batches to respect rate limits
      if (i + batchSize < leads.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return results
  }

  async generateKeywordSuggestions(businessDescription: string): Promise<string[]> {
    try {
      const prompt = `Based on this business description, suggest 10 relevant keywords to monitor for B2B lead generation on social media:

Business: "${businessDescription}"

Generate keywords that potential customers might use when expressing buying intent, such as:
- "looking for [solution]"
- "need [service]"
- "[problem] solution"
- "alternative to [competitor]"
- "[industry] software"

Return only the keywords, one per line, without quotes or numbering.`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a B2B marketing expert specializing in lead generation keyword research.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      })

      const result = response.choices[0]?.message?.content?.trim() || ''
      
      return result
        .split('\n')
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0)
        .slice(0, 10)
    } catch (error) {
      console.error('OpenAI keyword generation error:', error)
      return []
    }
  }
}