import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Search, BarChart3, Settings } from 'lucide-react'

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button className="w-full justify-start" asChild>
          <Link href="/dashboard/keywords">
            <Plus className="w-4 h-4 mr-2" />
            Add Keywords
          </Link>
        </Button>
        
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/dashboard/leads">
            <Search className="w-4 h-4 mr-2" />
            View All Leads
          </Link>
        </Button>
        
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/dashboard/analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            View Analytics
          </Link>
        </Button>
        
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/dashboard/api-keys">
            <Settings className="w-4 h-4 mr-2" />
            Setup API Keys
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}