import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, QrCode, RefreshCw, Send, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

interface Invoice {
  id: string;
  itemName: string;
  amountUsdc: number;
  status: 'created' | 'awaiting_payment' | 'paid_on_solana' | 'settling' | 'settled_on_avalanche' | 'failed';
  solanaReference: string;
  createdAt: string;
  avalancheTx?: string;
}

export function MerchantDashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const [newItem, setNewItem] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices');
      const data = await res.json();
      setInvoices(data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    const interval = setInterval(fetchInvoices, 5000);
    return () => clearInterval(interval);
  }, []);

  const createInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem || !newAmount) return;

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemName: newItem, amountUsdc: parseFloat(newAmount) }),
      });
      const data = await res.json();
      setInvoices([data, ...invoices]);
      setIsModalOpen(false);
      setNewItem('');
      setNewAmount('');
      toast.success('Invoice created successfully');
    } catch (error) {
      toast.error('Failed to create invoice');
    }
  };

  const openCheckout = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    // Real Solana Pay URL format: solana:recipient?amount=...&reference=...&label=...
    const solanaUrl = `solana:858...merchant_wallet?amount=${invoice.amountUsdc}&reference=${invoice.solanaReference}&label=ChainRegister`;
    try {
      const url = await QRCode.toDataURL(solanaUrl);
      setQrCodeUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  const simulatePayment = async (id: string) => {
    try {
      await fetch(`/api/invoices/${id}/verify`, { method: 'POST' });
      toast.info('Payment detected on Solana!');
      fetchInvoices();
    } catch (error) {
      toast.error('Simulation failed');
    }
  };

  const simulateSettlement = async (id: string) => {
    try {
      await fetch(`/api/invoices/${id}/settle`, { method: 'POST' });
      toast.success('Settlement triggered to Avalanche (Circle Gateway)');
      fetchInvoices();
    } catch (error) {
      toast.error('Settlement failed');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'created': return <Badge variant="secondary">Awaiting</Badge>;
      case 'awaiting_payment': return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">Awaiting Pay</Badge>;
      case 'paid_on_solana': return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Paid (Solana)</Badge>;
      case 'settling': return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 animate-pulse">Settling...</Badge>;
      case 'settled_on_avalanche': return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Settled (Avalanche)</Badge>;
      default: return <Badge variant="destructive">Failed</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl animate-fade-rise">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-display mb-2">Merchant Terminal</h2>
          <p className="text-muted-foreground">Manage your invoices and track cross-chain settlements.</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger render={<Button className="liquid-glass rounded-full px-8 h-12" />}>
            <div className="flex items-center">
              <Plus className="mr-2 h-4 w-4" /> New Invoice
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] liquid-glass text-foreground border-white/10">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display">Create Invoice</DialogTitle>
              <DialogDescription>
                Enter the details for the new USDC request.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createInvoice} className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="item" className="text-sm font-medium">Item Name</Label>
                <Input 
                  id="item" 
                  placeholder="e.g. Ethiopia Yirgacheffe Coffee" 
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  className="bg-white/5 border-white/10 h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount" className="text-sm font-medium">Amount (USDC)</Label>
                <div className="relative">
                   <Input 
                    id="amount" 
                    type="number" 
                    placeholder="0.00" 
                    step="0.01"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="bg-white/5 border-white/10 h-11 pr-16"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">USDC</div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90 h-11 rounded-xl">
                  Generate Terminal Link
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="liquid-glass border-white/5 overflow-hidden">
            <CardHeader className="border-b border-white/5 pb-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-display">Invoice History</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => fetchInvoices()} className="text-muted-foreground">
                  <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-white/[0.02]">
                  <TableRow className="border-white/5">
                    <TableHead className="w-[120px]">Date</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                        No invoices found. Create one to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => (
                      <TableRow key={invoice.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">{invoice.itemName}</TableCell>
                        <TableCell className="font-mono">${invoice.amountUsdc.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                             {invoice.status === 'created' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => openCheckout(invoice)}
                                className="h-8 rounded-full border-white/10 hover:bg-white/10"
                              >
                                <QrCode className="mr-2 h-3 w-3" /> Terminal
                              </Button>
                            )}
                            {invoice.status === 'paid_on_solana' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => simulateSettlement(invoice.id)}
                                className="h-8 rounded-full border-white/10 hover:bg-white/10 text-yellow-400 hover:text-yellow-300"
                              >
                                <RefreshCw className="mr-2 h-3 w-3" /> Settle
                              </Button>
                            )}
                            {invoice.status === 'settled_on_avalanche' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 rounded-full text-green-400"
                                render={<a href={`https://testnet.snowtrace.io/tx/${invoice.avalancheTx}`} target="_blank" rel="noreferrer" />}
                              >
                                <div className="flex items-center">
                                  <CheckCircle2 className="mr-2 h-3 w-3" /> Receipt
                                </div>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="liquid-glass border-white/5">
            <CardHeader>
              <CardTitle className="text-xl font-display">Terminal Preview</CardTitle>
              <CardDescription>Scan with a Solana wallet to pay.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-6">
              {selectedInvoice ? (
                <div className="w-full space-y-6">
                  <div className="bg-white p-4 rounded-3xl mx-auto w-fit">
                    {qrCodeUrl && (
                      <img src={qrCodeUrl} alt="Solana Pay QR" className="w-48 h-48" />
                    )}
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-mono">${selectedInvoice.amountUsdc.toFixed(2)} <span className="text-sm font-sans text-muted-foreground">USDC</span></p>
                    <p className="text-sm text-muted-foreground mt-1">{selectedInvoice.itemName}</p>
                  </div>

                  <div className="flex flex-col gap-3">
                     <Button 
                      variant="outline" 
                      className="w-full rounded-xl border-white/10 h-11"
                      onClick={() => simulatePayment(selectedInvoice.id)}
                    >
                      Simulate Solana Pay Success
                    </Button>
                    <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest px-4">
                      Protocol: Solana Pay (Reference Check)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground text-center">
                  <QrCode className="h-12 w-12 mb-4 opacity-20" />
                  <p>Select an invoice to<br />show the terminal QR.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="liquid-glass border-white/5 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg font-display">Chain Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Solana Devnet</span>
                <Badge variant="outline" className="text-[10px] h-4 bg-green-500/10 text-green-400 border-green-500/20">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Circle Iris (CCTP)</span>
                <Badge variant="outline" className="text-[10px] h-4 bg-green-500/10 text-green-400 border-green-500/20">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Avalanche Fuji</span>
                <Badge variant="outline" className="text-[10px] h-4 bg-green-500/10 text-green-400 border-green-500/20">Operational</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
