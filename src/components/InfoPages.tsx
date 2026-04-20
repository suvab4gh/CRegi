import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Terminal, Shield, Zap, Globe, ArrowRight, Code } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      title: "Solana Checkout",
      description: "Merchants create an invoice. Customers scan a Solana Pay QR code and authorize a USDC transfer in seconds. High-speed, low-cost.",
      icon: <Zap className="h-6 w-6 text-purple-400" />,
      color: "purple"
    },
    {
      title: "Circle Routing",
      description: "Behind the scenes, we use Circle's infrastructure (CCTP or Gateway) to move the USDC from its Solana destination to the merchant's target chain.",
      icon: <Globe className="h-6 w-6 text-blue-400" />,
      color: "blue"
    },
    {
      title: "Avalanche Settlement",
      description: "The settlement is finalized on Avalanche. A permanent record of the payment, reference, and payout is written to the CReg registry contract.",
      icon: <Shield className="h-6 w-6 text-red-500" />,
      color: "red"
    }
  ];

  return (
    <div className="container mx-auto px-6 py-20 max-w-7xl animate-fade-rise">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-display mb-4">Invisible Infrastructure.</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          CReg abstracts away the complexity of bridging, gas tracking, and chain IDs.
          One scan, two chains, zero friction.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 relative">
        {steps.map((step, index) => (
          <Card key={index} className="liquid-glass border-white/5 relative z-10">
            <CardContent className="pt-8 pb-8 px-8">
              <div className={`mb-6 p-4 rounded-2xl bg-${step.color}-500/10 w-fit`}>
                {step.icon}
              </div>
              <h3 className="text-2xl font-display mb-4">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

       <div className="mt-24 text-center">
        <h3 className="text-3xl font-display mb-8 italic text-muted-foreground">The Experience</h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm font-mono tracking-widest text-muted-foreground">
          <span className="text-foreground">SCAN</span>
          <ArrowRight className="h-4 w-4" />
          <span className="text-foreground">PAY</span>
          <ArrowRight className="h-4 w-4 opacity-50" />
          <span>ROUTE</span>
          <ArrowRight className="h-4 w-4 opacity-30" />
          <span>SETTLE</span>
        </div>
      </div>
    </div>
  );
}

export function Developers() {
  return (
    <div className="container mx-auto px-6 py-20 max-w-5xl animate-fade-rise">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h2 className="text-5xl font-display mb-4">Integrate CRegi.</h2>
          <p className="text-muted-foreground text-lg">
            Build cross-chain terminal experiences using our merchant APIs.
          </p>
        </div>
        <Button variant="outline" className="liquid-glass rounded-full border-white/10">
          <Code className="mr-2 h-4 w-4" /> View SDK Docs
        </Button>
      </div>

      <div className="space-y-12">
        <div className="space-y-4">
          <h3 className="text-xl font-display text-muted-foreground">1. Creating an Invoice</h3>
          <p className="text-sm text-balance">
            Generate a unique payment reference and Solana Pay URL. Store the state in your merchant backend.
          </p>
          <pre className="bg-black/50 p-6 rounded-2xl border border-white/5 font-mono text-xs overflow-x-auto">
            {`POST /api/invoices
{
  "itemName": "Single Estate Coffee",
  "amountUsdc": 5.00,
  "merchantId": "mer_85sj2..."
}

// Response
{
  "id": "inv_99z...",
  "solanaReference": "8sj2L...99fD",
  "status": "created"
}`}
          </pre>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-display text-muted-foreground">2. Verification Logic</h3>
          <p className="text-sm text-balance">
            Listen for the transaction on Solana Devnet using the unique reference pubkey.
          </p>
          <pre className="bg-black/50 p-6 rounded-2xl border border-white/5 font-mono text-xs overflow-x-auto">
            {`import { findReference, validateTransfer } from '@solana/pay';

// Find the signature on-chain
const signatureInfo = await findReference(connection, reference);

// Validate transfer details
await validateTransfer(connection, signatureInfo.signature, {
  recipient: merchantWallet,
  amount: 5.00,
  splToken: USDC_MINT
});`}
          </pre>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <span className="text-[10px] uppercase tracking-tighter text-muted-foreground">Network</span>
              <p className="font-mono text-sm mt-1">Avalanche Fuji</p>
            </CardContent>
          </Card>
           <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <span className="text-[10px] uppercase tracking-tighter text-muted-foreground">Protocol</span>
              <p className="font-mono text-sm mt-1">Circle CCTP V2</p>
            </CardContent>
          </Card>
           <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <span className="text-[10px] uppercase tracking-tighter text-muted-foreground">SDK</span>
              <p className="font-mono text-sm mt-1">@solana/pay</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function Contact() {
  return (
    <div className="container mx-auto px-6 py-20 max-w-4xl animate-fade-rise">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-display mb-4">Connect with CRegi.</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          We're building the future of cross-chain commerce. Reach out to our team 
          for partnership inquiries or developer support.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="liquid-glass border-white/5">
          <CardContent className="p-8">
            <h3 className="text-xl font-display mb-4">Partnerships</h3>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Interested in integrating CRegi into your retail platform or stablecoin ecosystem?
            </p>
            <Button variant="outline" className="w-full rounded-full border-white/10 hover:bg-white/5">
              Contact Sales
            </Button>
          </CardContent>
        </Card>

        <Card className="liquid-glass border-white/5">
          <CardContent className="p-8">
            <h3 className="text-xl font-display mb-4">Twitter / X</h3>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Follow our progress and get real-time updates on our protocol development.
            </p>
            <Button variant="outline" className="w-full rounded-full border-white/10 hover:bg-white/5">
              Follow @CRegi
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-16 p-12 rounded-[2rem] bg-white/5 border border-white/10 text-center">
        <p className="text-muted-foreground text-sm mb-4 tracking-widest uppercase">Direct Support</p>
        <a href="mailto:support@cregi.xyz" className="text-3xl font-display hover:text-muted-foreground transition-colors">
          support@cregi.xyz
        </a>
      </div>
    </div>
  );
}
