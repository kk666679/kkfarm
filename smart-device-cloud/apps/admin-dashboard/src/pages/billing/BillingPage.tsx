import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageTitle } from '@/components/common/PageTitle';
import { useQuery } from '@tanstack/react-query';
import { cloudService } from '@/services/api';
import {
  CreditCard,
  DollarSign,
  Receipt,
  TrendingDown,
  Wallet,
  FileText,
  Loader2,
} from 'lucide-react';

export default function BillingPage() {
  const {
    data: summary,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['dashboard', 'billing'],
    queryFn: () => cloudService.getBillingSummary(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageTitle title="Billing" subtitle="Manage subscriptions, invoices, and payment methods" />
        <div className="flex items-center justify-center py-12 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading billing data...
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="space-y-6">
        <PageTitle title="Billing" subtitle="Manage subscriptions, invoices, and payment methods" />
        <div className="text-center py-12 text-red-400">
          Failed to load billing data: {(error as Error)?.message ?? 'Unknown error'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle title="Billing" subtitle="Manage subscriptions, invoices, and payment methods" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.plan}</div>
            <div className="text-xs text-slate-400">${summary.planPrice}/mo</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Next Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary.nextInvoice}</div>
            <div className="text-xs text-slate-400">Due at next billing cycle</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Usage This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.usagePercent}%</div>
            <div className="text-xs text-slate-400">of quota</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.paymentMethod}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-blue-400" />
                <div>
                  <div className="font-medium">{summary.paymentMethod}</div>
                  <div className="text-sm text-slate-400">Default payment method</div>
                </div>
              </div>
              <div className="text-green-400 text-sm">Default</div>
            </div>
            <Button variant="outline" className="mt-4">
              + Add Payment Method
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.usage.map(item => (
                <UsageRow
                  key={item.label}
                  icon={DollarSign}
                  label={item.label}
                  value={`$${item.value}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="pb-3">Invoice</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Description</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {summary.invoices.map(inv => (
                <InvoiceRow
                  key={inv.id}
                  id={inv.id}
                  date={inv.date}
                  desc={inv.description}
                  amount={`$${inv.amount}`}
                  status={inv.status}
                />
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function UsageRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-400" />
        <span className="text-sm text-slate-300">{label}</span>
      </div>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function InvoiceRow({
  id,
  date,
  desc,
  amount,
  status,
}: {
  id: string;
  date: string;
  desc: string;
  amount: string;
  status: string;
}) {
  return (
    <tr className="border-b border-slate-800 hover:bg-slate-800/50">
      <td className="py-3 font-medium">{id}</td>
      <td className="py-3 text-slate-400">{new Date(date).toLocaleDateString()}</td>
      <td className="py-3 text-slate-400">{desc}</td>
      <td className="py-3">{amount}</td>
      <td className="py-3">
        <span
          className={`px-2 py-0.5 text-xs rounded-full ${status === 'Paid' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}
        >
          {status}
        </span>
      </td>
      <td className="py-3">
        <Button variant="ghost" size="sm">
          <FileText className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}
