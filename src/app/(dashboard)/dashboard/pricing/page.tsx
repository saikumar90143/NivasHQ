import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { RazorpayCheckout } from '@/components/payments/RazorpayCheckout';
import { Check, X } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Pricing & Plans | NivasaHQ',
  description: 'Choose the perfect plan to grow your real estate business.',
};

export default async function PricingPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  // Fetch all active plans
  const plans = await db.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  // Check current user's subscription
  // First get the agent profile
  const agent = await db.agent.findUnique({
    where: { userId: session.user.id },
    include: {
      subscriptions: {
        where: { status: 'ACTIVE' },
        include: { plan: true },
      },
    },
  });

  const currentPlanId = agent?.subscriptions?.[0]?.planId;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 gradient-navy animate-fade-in text-foreground">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 stagger">
          <Badge variant="outline" className="mb-4 border-brand-gold text-brand-gold bg-brand-gold/10 px-4 py-1 animate-fade-in-up">
            PRICING
          </Badge>
          <h1 className="text-display-lg text-white mb-6 animate-fade-in-up">
            Simple, Transparent <span className="text-gradient-gold">Pricing</span>
          </h1>
          <p className="text-lg text-slate-300 animate-fade-in-up">
            Choose the plan that fits your business needs. Upgrade, downgrade, or cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto stagger">
          {plans.map((plan, index) => {
            const isPremium = plan.tier === 'PREMIUM';
            const isPro = plan.tier === 'PRO';
            const isCurrent = currentPlanId === plan.id;
            const features = plan.features as { included: string[]; excluded?: string[] };
            
            return (
              <div 
                key={plan.id}
                className={`relative rounded-2xl transition-all duration-300 shadow-card-hover animate-fade-in-up flex flex-col
                  ${isPremium 
                    ? 'glass-dark border-brand-gold/50 shadow-gold transform md:-translate-y-4' 
                    : 'glass border-slate-700 hover:border-slate-500'
                  }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {isPremium && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-gradient-to-r from-brand-gold to-brand-gold-light text-navy-950 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="p-8 flex-1">
                  <h3 className={`text-2xl font-bold mb-2 ${isPremium ? 'text-brand-gold' : 'text-white'}`}>
                    {plan.name}
                  </h3>
                  <p className="text-slate-400 text-sm mb-6 h-10">
                    {plan.description}
                  </p>
                  
                  <div className="mb-8 flex items-baseline text-white">
                    <span className="text-5xl font-extrabold tracking-tight">₹{Number(plan.priceMonthly) / 100}</span>
                    <span className="text-slate-400 ml-2 font-medium">/mo</span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {features?.included?.map((feature: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-brand-gold shrink-0 mr-3" />
                        <span className="text-slate-200 text-sm">{feature}</span>
                      </li>
                    ))}
                    {features?.excluded?.map((feature: string, i: number) => (
                      <li key={`ex-${i}`} className="flex items-start opacity-50">
                        <X className="h-5 w-5 text-slate-500 shrink-0 mr-3" />
                        <span className="text-slate-400 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-8 pt-0 mt-auto">
                  {isCurrent ? (
                    <button disabled className="w-full py-3 rounded-lg font-semibold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-not-allowed">
                      Current Plan
                    </button>
                  ) : plan.priceMonthly > 0 ? (
                    <RazorpayCheckout 
                      planId={plan.id}
                      planName={plan.name}
                      amount={Number(plan.priceMonthly)}
                      className={isPremium ? 'btn-gold py-6' : 'btn-primary py-6'}
                      buttonText={isPremium ? 'Get Premium' : 'Upgrade to Pro'}
                    />
                  ) : (
                    <button className="w-full py-3 rounded-lg font-semibold bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 transition-colors">
                      Get Started
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
