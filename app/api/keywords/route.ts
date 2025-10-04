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

    const keywords = await db.keyword.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { leads: true }
        }
      }
    })

    return NextResponse.json({ keywords })
  } catch (error) {
    console.error('Error fetching keywords:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text, platforms } = await request.json()

    if (!text || !platforms || !Array.isArray(platforms)) {
      return NextResponse.json(
        { error: 'Text and platforms are required' },
        { status: 400 }
      )
    }

    if (platforms.length === 0) {
      return NextResponse.json(
        { error: 'At least one platform must be selected' },
        { status: 400 }
      )
    }

    // Check if keyword already exists for this user
    const existingKeyword = await db.keyword.findFirst({
      where: {
        userId: session.user.id,
        text: text.toLowerCase().trim()
      }
    })

    if (existingKeyword) {
      return NextResponse.json(
        { error: 'This keyword already exists' },
        { status: 400 }
      )
    }

    // Check user's plan limits
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { 
        subscription: true,
        keywords: { where: { isActive: true } }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check keyword limits based on plan
    const planLimits = {
      starter: 10,
      pro: 50,
      enterprise: -1 // unlimited
    }

    const currentPlan = user.subscription?.planType || 'starter'
    const limit = planLimits[currentPlan as keyof typeof planLimits]
    
    if (limit !== -1 && user.keywords.length >= limit) {
      return NextResponse.json(
        { error: `You've reached your plan's keyword limit (${limit})` },
        { status: 400 }
      )
    }

    const keyword = await db.keyword.create({
      data: {
        userId: session.user.id,
        text: text.toLowerCase().trim(),
        platforms,
        isActive: true
      }
    })

    return NextResponse.json({ keyword }, { status: 201 })
  } catch (error) {
    console.error('Error creating keyword:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}