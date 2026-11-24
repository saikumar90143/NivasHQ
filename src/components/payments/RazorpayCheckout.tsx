'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface RazorpayCheckoutProps {
  planId: string;
  planName: string;
  amount: number;
  buttonText?: string;
  className?: string;
}

export function RazorpayCheckout({
  planId,
  planName,
  amount,
  buttonText = 'Subscribe Now',
  className,
}: RazorpayCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      // 1. Load Razorpay Script
      const res = await loadRazorpayScript();

      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setIsLoading(false);
        return;
      }

      // 2. Create Order
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await orderResponse.json();

      // 3. Handle Mock Flow Gracefully
      if (orderData.isMock || orderData.orderId.startsWith('mock_')) {
        toast.info('Simulating payment (Mock mode)');
        const verifyResponse = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId,
            razorpay_order_id: orderData.orderId,
            isMock: true,
          }),
        });

        if (verifyResponse.ok) {
          toast.success(`Successfully subscribed to ${planName}!`);
          router.push('/dashboard/billing');
          router.refresh();
        } else {
          toast.error('Mock payment verification failed.');
        }
        setIsLoading(false);
        return;
      }

      // 4. Initialize Razorpay Checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'NivasaHQ',
        description: `Subscription for ${planName}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                planId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              toast.success(`Successfully subscribed to ${planName}!`);
              router.push('/dashboard/billing');
              router.refresh();
            } else {
              toast.error('Payment verification failed.');
            }
          } catch (err) {
            toast.error('Payment verification error.');
          }
        },
        prefill: {
          name: orderData.user?.name || '',
          email: orderData.user?.email || '',
        },
        theme: {
          color: '#c9932a', // Brand Gold
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on('payment.failed', function (response: any) {
        toast.error(response.error.description || 'Payment failed');
      });
      paymentObject.open();

    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading}
      className={`w-full ${className}`}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
      {isLoading ? 'Processing...' : buttonText}
    </Button>
  );
}
