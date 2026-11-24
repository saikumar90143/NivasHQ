import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, CreditCard, Download, ExternalLink, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Billing & Subscriptions | NivasaHQ',
  description: 'Manage your billing and payment history.',
};

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  // Fetch agent and billing data
  const agent = await db.agent.findUnique({
    where: { userId: session.user.id },
    include: {
      subscriptions: {
        where: { status: 'ACTIVE' },
        include: { plan: true },
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        include: { invoices: true },
        take: 20, // Limit to last 20 payments
      },
    },
  });

  if (!agent) {
    // If user is not an agent yet, maybe they need to complete onboarding
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Billing</h1>
        <p>Please complete your agent profile first.</p>
      </div>
    );
  }

  const activeSubscription = agent.subscriptions[0];
  const payments = agent.payments;

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-fade-in text-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 stagger">
        <div className="animate-fade-in-up">
          <h1 className="text-display-lg text-foreground tracking-tight mb-2">Billing & Subscription</h1>
          <p className="text-muted-foreground text-lg">Manage your plan, payment methods, and invoices.</p>
        </div>
        <div className="mt-4 sm:mt-0 animate-fade-in-up">
          <Button className="btn-gold shadow-gold">
            <Link href="/dashboard/pricing">Change Plan</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger">
        {/* Active Plan Card */}
        <Card className="md:col-span-2 glass-light shadow-card-hover border-border animate-fade-in-up">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">Current Plan</CardTitle>
                <CardDescription className="text-base mt-1">Your active subscription details</CardDescription>
              </div>
              {activeSubscription?.status === 'ACTIVE' ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1">
                  <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Active
                </Badge>
              ) : (
                <Badge variant="outline" className="text-slate-500 px-3 py-1">
                  No Active Plan
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {activeSubscription ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-border">
                  <div className="h-12 w-12 rounded-full bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="h-6 w-6 text-brand-gold" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground">{activeSubscription.plan.name}</h3>
                    <p className="text-muted-foreground text-sm flex items-center mt-1">
                      <CalendarDays className="w-4 h-4 mr-1 opacity-70" />
                      Renews on {activeSubscription.currentPeriodEnd ? format(new Date(activeSubscription.currentPeriodEnd), 'PPP') : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">
                      ₹{Number(activeSubscription.plan.priceMonthly) / 100}
                      <span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You are currently on the Free tier.</p>
                <Button className="btn-primary">
                  <Link href="/dashboard/pricing">Upgrade Now</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Summary Card */}
        <Card className="glass-light shadow-card-hover border-border animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="text-xl">Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Total Payments</span>
              <span className="font-semibold">{payments.length}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-muted-foreground">Lifetime Value</span>
              <span className="font-semibold text-brand-gold">
                ₹{payments.filter(p => p.status === 'CAPTURED').reduce((acc, curr) => acc + Number(curr.amount) / 100, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Last Payment</span>
              <span className="font-semibold">
                {payments[0] ? format(new Date(payments[0].createdAt), 'MMM d, yyyy') : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment History Table */}
      <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <h2 className="text-2xl font-bold mb-6 font-heading">Payment History</h2>
        
        <Card className="glass shadow-card border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No payment history found.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <TableCell className="font-medium text-slate-600 dark:text-slate-300">
                      {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{payment.description || 'Subscription Payment'}</span>
                      <br/>
                      <span className="text-xs text-muted-foreground font-mono mt-1 block">ID: {payment.razorpayOrderId}</span>
                    </TableCell>
                    <TableCell className="font-semibold text-brand-gold">
                      ₹{(Number(payment.amount) / 100).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={payment.status === 'CAPTURED' ? 'default' : payment.status === 'FAILED' ? 'destructive' : 'secondary'}
                        className={payment.status === 'CAPTURED' ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' : ''}
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.invoices && payment.invoices[0]?.pdfUrl ? (
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <a href={payment.invoices[0].pdfUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            PDF
                          </a>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not available</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
