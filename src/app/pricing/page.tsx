"use client"

import { useState } from "react"
import { Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "motion/react"
import { createSubscriptionOrder } from "@/actions/payment.actions"
import { toast } from "sonner"
import Script from "next/script"
export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      name: "Free",
      price: "₹0",
      description: "Perfect for getting started.",
      features: ["5 Property Listings", "Basic Analytics", "Standard Support", "Email Notifications"],
      action: "Sign Up for Free",
      popular: false,
      color: "from-slate-100 to-slate-200"
    },
    {
      name: "Pro Agent",
      price: "₹2,999",
      period: "/month",
      description: "Everything you need for a growing business.",
      features: ["50 Property Listings", "Priority Leads routing", "Advanced Analytics", "Verified Agent Badge", "WhatsApp Integration"],
      action: "Subscribe to Pro",
      popular: true,
      color: "from-indigo-500 to-purple-600"
    },
    {
      name: "Premium Builder",
      price: "₹9,999",
      period: "/month",
      description: "For large agencies and builders.",
      features: ["Unlimited Listings", "Featured Projects on Homepage", "Dedicated Account Manager", "Custom API Access", "CRM Integration"],
      action: "Contact Sales",
      popular: false,
      color: "from-slate-800 to-slate-900"
    }
  ]

  const handleSubscribe = async (planName: string) => {
    setLoading(planName);
    try {
      const result = await createSubscriptionOrder(planName);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      if (result.isFree) {
        toast.success("Successfully enrolled in the Free plan!");
        return;
      }

      const options = {
        key: result.key,
        amount: result.amount,
        currency: "INR",
        name: "NivasaHQ",
        description: `Subscription to ${planName}`,
        order_id: result.orderId,
        handler: function (response: any) {
          toast.success("Payment successful! Your subscription is active.");
          // In a real app, you might want to redirect to dashboard or verify the signature on client if needed
        },
        theme: {
          color: "#4f46e5"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error("Payment failed. Please try again.");
      });
      rzp.open();
    } catch (error) {
      toast.error("An error occurred during checkout.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="py-24 sm:py-32 bg-slate-950 min-h-screen text-slate-50 relative overflow-hidden">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      {/* Background Gradients */}
      <div className="absolute top-0 inset-x-0 h-full w-full overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-indigo-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-1/2 -right-1/2 w-full h-full bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="text-base font-semibold leading-7 text-indigo-400 tracking-widest uppercase">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Choose the right plan for you
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-slate-400">
            Whether you're an independent agent or a large developer, we have a plan that fits your needs.
          </p>
        </motion.div>
        
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <Card className={`relative flex flex-col justify-between h-full overflow-hidden border-0 ${plan.popular ? 'bg-slate-900/80 shadow-2xl shadow-indigo-500/20 ring-1 ring-indigo-500' : 'bg-slate-900/50 ring-1 ring-white/10'} backdrop-blur-xl transition-all duration-300 hover:-translate-y-2`}>
                
                {plan.popular && (
                  <div className="absolute top-0 right-0 -mr-8 mt-6 w-32 rotate-45 text-center text-xs font-bold py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg">
                    MOST POPULAR
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    {plan.name} {plan.popular && <Sparkles className="h-5 w-5 text-indigo-400" />}
                  </CardTitle>
                  <CardDescription className="text-slate-400">{plan.description}</CardDescription>
                  <div className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-5xl font-bold tracking-tight text-white">{plan.price}</span>
                    {plan.period && <span className="text-sm font-semibold leading-6 text-slate-400">{plan.period}</span>}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul role="list" className="mt-8 space-y-4 text-sm leading-6 text-slate-300">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3 items-center">
                        <Check className="h-5 w-5 flex-none text-indigo-400" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="mt-auto pt-8">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                    <Button 
                      className={`w-full py-6 text-base font-semibold border-0 ${plan.popular ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md'}`}
                      onClick={() => handleSubscribe(plan.name)}
                      disabled={loading === plan.name}
                    >
                      {loading === plan.name ? 'Processing...' : plan.action}
                    </Button>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
