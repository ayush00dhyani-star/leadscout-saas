import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils'
import { Activity, Plus, Target, Search } from 'lucide-react'

// Mock data for recent activity
const recentActivities = [
  {
    id: 1,
    type: 'lead_found',
    description: 'New high-quality lead found',
    keyword: 'CRM alternative',
    score: 9,
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
  },
  {
    id: 2,
    type: 'keyword_added',
    description: 'Added new keyword',
    keyword: 'project management tool',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
  {
    id: 3,
    type: 'lead_found',
    description: 'Medium quality lead found',
    keyword: 'email marketing software',
    score: 7,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 4,
    type: 'monitoring_started',
    description: 'Started monitoring new platform',
    keyword: 'Twitter',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
]

export function RecentActivity() {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lead_found':
        return <Target className="w-4 h-4 text-green-600" />
      case 'keyword_added':
        return <Plus className="w-4 h-4 text-blue-600" />
      case 'monitoring_started':
        return <Search className="w-4 h-4 text-purple-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'lead_found':
        return 'bg-green-50 border-green-200'
      case 'keyword_added':
        return 'bg-blue-50 border-blue-200'
      case 'monitoring_started':
        return 'bg-purple-50 border-purple-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`p-2 rounded-full border ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.description}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {activity.keyword}
                  </Badge>
                  {activity.score && (
                    <Badge 
                      variant={activity.score >= 8 ? 'default' : 'warning'} 
                      className="text-xs"
                    >
                      Score: {activity.score}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatRelativeTime(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}