import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
})

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 49,
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    keywords: 10,
    features: [
      '10 tracked keywords',
      'Reddit & Twitter monitoring',
      'Email notifications',
      'Basic analytics',
      '7-day free trial'
    ]
  },
  pro: {
    name: 'Pro',
    price: 149,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    keywords: 50,
    features: [
      '50 tracked keywords',
      'Reddit & Twitter monitoring',
      'Real-time notifications',
      'Advanced analytics',
      'Export capabilities',
      'Priority support'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: 299,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    keywords: -1, // unlimited
    features: [
      'Unlimited keywords',
      'All platform monitoring',
      'Custom integrations',
      'Advanced AI scoring',
      'Dedicated support',
      'Custom reporting'
    ]
  }
}

export async function createCheckoutSession(
  userId: string,
  planType: keyof typeof PLANS,
  successUrl: string,
  cancelUrl: string
) {
  const plan = PLANS[planType]
  
  const session = await stripe.checkout.sessions.create({
    customer_email: undefined, // Will be filled by Stripe
    billing_address_collection: 'required',
    line_items: [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 7,
      metadata: {
        userId,
        planType,
      },
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  })

  return session
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}