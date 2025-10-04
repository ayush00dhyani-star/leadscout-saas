import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const platform = searchParams.get('platform')
    const minScore = searchParams.get('minScore')
    const maxScore = searchParams.get('maxScore')
    const keyword = searchParams.get('keyword')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      keyword: {
        userId: session.user.id
      }
    }

    if (platform) {
      where.platform = platform
    }

    if (minScore) {
      where.leadScore = { ...where.leadScore, gte: parseInt(minScore) }
    }

    if (maxScore) {
      where.leadScore = { ...where.leadScore, lte: parseInt(maxScore) }
    }

    if (keyword) {
      where.keyword = {
        ...where.keyword,
        text: {
          contains: keyword,
          mode: 'insensitive'
        }
      }
    }

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo)
      }
    }

    const [leads, total] = await Promise.all([
      db.lead.findMany({
        where,
        include: {
          keyword: {
            select: {
              text: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.lead.count({ where })
    ])

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { leadIds, processed } = await request.json()

    if (!Array.isArray(leadIds)) {
      return NextResponse.json(
        { error: 'leadIds must be an array' },
        { status: 400 }
      )
    }

    // Update leads (only user's own leads)
    await db.lead.updateMany({
      where: {
        id: { in: leadIds },
        keyword: {
          userId: session.user.id
        }
      },
      data: {
        processed: processed === true
      }
    })

    return NextResponse.json({ message: 'Leads updated successfully' })
  } catch (error) {
    console.error('Error updating leads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}