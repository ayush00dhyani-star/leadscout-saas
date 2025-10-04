import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatRelativeTime, truncateText, getPlatformIcon } from '@/lib/utils'
import { ExternalLink, User } from 'lucide-react'
import Link from 'next/link'

interface Lead {
  id: string
  platform: string
  content: string
  author: string
  postUrl: string
  leadScore: number
  createdAt: Date
  keyword: {
    text: string
  }
}

interface LeadCardProps {
  lead: Lead
}

export function LeadCard({ lead }: LeadCardProps) {
  const getScoreVariant = (score: number) => {
    if (score >= 8) return 'default'
    if (score >= 6) return 'warning'
    return 'secondary'
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-700 bg-green-50 border-green-200'
    if (score >= 6) return 'text-yellow-700 bg-yellow-50 border-yellow-200'
    return 'text-gray-700 bg-gray-50 border-gray-200'
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getPlatformIcon(lead.platform)}</span>
            <Badge variant="outline" className="text-xs">
              {lead.keyword.text}
            </Badge>
            <Badge className={`text-xs border ${getScoreColor(lead.leadScore)}`}>
              Score: {lead.leadScore}
            </Badge>
          </div>
          <span className="text-xs text-gray-500">
            {formatRelativeTime(lead.createdAt)}
          </span>
        </div>

        <div className="mb-3">
          <p className="text-sm text-gray-900 leading-relaxed">
            {truncateText(lead.content, 200)}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <User className="w-3 h-3" />
            <span>@{lead.author}</span>
            <span>•</span>
            <span className="capitalize">{lead.platform}</span>
          </div>
          
          <Button size="sm" variant="outline" asChild>
            <Link href={lead.postUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3 h-3 mr-1" />
              View Post
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}