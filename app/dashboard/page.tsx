import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LeadCard } from '@/components/dashboard/lead-card'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { QuickActions } from '@/components/dashboard/quick-actions'
import Link from 'next/link'
import { Plus, TrendingUp, Target, Search } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  // Fetch user data and recent leads
  const [user, keywords, recentLeads, stats] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true }
    }),
    db.keyword.findMany({
      where: { userId: session.user.id },
      take: 5,
      orderBy: { createdAt: 'desc' }
    }),
    db.lead.findMany({
      where: {
        keyword: {
          userId: session.user.id
        }
      },
      include: {
        keyword: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    // Get stats for the last 30 days
    db.lead.groupBy({
      by: ['leadScore'],
      where: {
        keyword: {
          userId: session.user.id
        },
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      _count: {
        id: true
      }
    })
  ])

  const totalLeads = stats.reduce((sum, stat) => sum + stat._count.id, 0)
  const highQualityLeads = stats
    .filter(stat => stat.leadScore >= 8)
    .reduce((sum, stat) => sum + stat._count.id, 0)
  const mediumQualityLeads = stats
    .filter(stat => stat.leadScore >= 6 && stat.leadScore < 8)
    .reduce((sum, stat) => sum + stat._count.id, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your lead generation
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button asChild>
            <Link href="/dashboard/keywords">
              <Plus className="w-4 h-4 mr-2" />
              Add Keywords
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards 
        totalLeads={totalLeads}
        highQualityLeads={highQualityLeads}
        mediumQualityLeads={mediumQualityLeads}
        activeKeywords={keywords.filter(k => k.isActive).length}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Leads</CardTitle>
                <CardDescription>
                  Latest high-quality leads from your monitored keywords
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/leads">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentLeads.length > 0 ? (
                <div className="space-y-4">
                  {recentLeads.slice(0, 5).map((lead) => (
                    <LeadCard key={lead.id} lead={lead} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No leads yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Add some keywords to start monitoring for leads
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/keywords">
                      <Search className="w-4 h-4 mr-2" />
                      Add Keywords
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActions />

          {/* Active Keywords */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Keywords</CardTitle>
              <CardDescription>
                Your currently monitored keywords
              </CardDescription>
            </CardHeader>
            <CardContent>
              {keywords.length > 0 ? (
                <div className="space-y-3">
                  {keywords.map((keyword) => (
                    <div key={keyword.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {keyword.text}
                        </p>
                        <div className="flex space-x-1 mt-1">
                          {keyword.platforms.map((platform) => (
                            <Badge key={platform} variant="secondary" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center">
                        {keyword.isActive ? (
                          <Badge variant="success" className="text-xs">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Paused</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                    <Link href="/dashboard/keywords">Manage Keywords</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600 mb-3">
                    No keywords added yet
                  </p>
                  <Button size="sm" asChild>
                    <Link href="/dashboard/keywords">Add Keywords</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}