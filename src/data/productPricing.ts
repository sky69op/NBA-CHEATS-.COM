export type ProductPlanId = 'weekly' | 'monthly' | 'lifetime' | 'onetime';

export interface ProductPlan {
  id: ProductPlanId;
  label: string;
  priceUsd: number;
  priceNote: string;
  /** Shown on the checkout card, and used as the preselected plan. */
  recommended?: boolean;
  badge?: string;
}

const monthlyPlan: ProductPlan = {
  id: 'monthly',
  label: 'Monthly',
  priceUsd: 35,
  priceNote: '30 days',
};

const lifetimeUtilityPlan: ProductPlan = {
  id: 'lifetime',
  label: 'Lifetime',
  priceUsd: 150,
  priceNote: 'Unlimited access',
  recommended: true,
};

const standardPlans: ProductPlan[] = [
  monthlyPlan,
  lifetimeUtilityPlan,
];

const hwidPlans: ProductPlan[] = [
  { ...monthlyPlan, priceUsd: 50 },
  lifetimeUtilityPlan,
];

/** Owner policy: HWID is $50 monthly; other products $35. All terms are 30 days / $150 lifetime. */
export function getProductPlans(productSlug: string): ProductPlan[] {
  return productSlug === 'hwid-spoofer' ? hwidPlans : standardPlans;
}

export function getFeaturedPlan(productSlug: string): ProductPlan | undefined {
  const plans = getProductPlans(productSlug);
  return plans.find((plan) => plan.recommended) ?? plans[0];
}

export function formatPlanPrice(usd: number): string {
  return `$${usd}`;
}

export function checkoutUrlWithPlan(baseUrl: string, planId: ProductPlanId): string {
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}plan=${planId}`;
}
