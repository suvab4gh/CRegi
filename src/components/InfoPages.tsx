import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Terminal, Shield, Zap, Globe, ArrowRight, Code, Mail, MessageSquare, Twitter } from 'lucide-react';

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
          <Card key={index} className="relative z-10 shadow-2xl transition-all duration-500 hover:translate-y-[-4px]">
            <CardContent className="pt-8 pb-8 px-8">
              <div className={`mb-6 p-4 rounded-3xl bg-${step.color}-500/10 backdrop-blur-md w-fit border border-white/5`}>
                {step.icon}
              </div>
              <h3 className="text-2xl font-display mb-2 tracking-tight">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
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
          <h2 className="text-5xl font-display mb-4 tracking-tight">Integrate CRegi.</h2>
          <p className="text-muted-foreground text-lg max-w-2xl">
            The CRegi protocol provides a seamless cross-chain payment abstracting layer. 
            Build high-fidelity merchant terminals or automated settlement systems.
          </p>
        </div>
        <Button variant="glass" className="rounded-full px-8 h-12 shadow-primary/20">
          <Code className="mr-2 h-4 w-4" /> SDK Repository
        </Button>
      </div>

      <div className="space-y-16">
        {/* Architecture Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-white/10"></div>
            <h3 className="text-sm font-mono uppercase tracking-[0.3em] text-muted-foreground whitespace-nowrap">The Architecture</h3>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h4 className="text-3xl font-display italic tracking-tight underline decoration-primary/30 underline-offset-8">Liquidity Pipeline</h4>
              <p className="text-muted-foreground leading-relaxed text-sm">
                CRegi utilizes a unique **"Route-then-Record"** pattern. 
                Liquidity flows through Circle's battle-tested CCTP stack on Solana, while the 
                settlement's proof-of-completion is written to our Avalanche registry.
              </p>
              <ul className="space-y-4 text-xs font-mono text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">01.</span>
                  <span>Solana Pay initiates the native USDC transfer (T+1s).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">02.</span>
                  <span>Circle CCTP attests to the burn/mint across chains.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold">03.</span>
                  <span>CRegi smart contract records metadata on Avalanche Fuji.</span>
                </li>
              </ul>
            </div>
            
            <Card className="bg-primary/5 border-primary/10 overflow-hidden group">
               <CardContent className="p-0 flex items-center justify-center min-h-[300px] relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)] animate-pulse"></div>
                  <div className="relative font-mono text-[9px] text-muted-foreground grid grid-cols-1 gap-4 w-full px-8">
                    <div className="p-3 border border-white/10 rounded-xl bg-white/5 flex gap-4 items-center group-hover:border-primary/40 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
                      <span>SOLANA INGRESS (PAYMENT)</span>
                    </div>
                    <div className="py-2 flex flex-col items-center gap-1">
                      <ArrowRight className="h-3 w-3 rotate-90 opacity-40" />
                      <span className="text-[8px] text-primary/40">CIRCLE CCTP ROUTING</span>
                      <ArrowRight className="h-3 w-3 rotate-90 opacity-40" />
                    </div>
                    <div className="p-3 border border-white/10 rounded-xl bg-white/5 flex gap-4 items-center group-hover:border-primary/40 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                      <span>AVALANCHE EGRESS (SETTLEMENT)</span>
                    </div>
                  </div>
               </CardContent>
            </Card>
          </div>
        </section>

        {/* API Implementation */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-display">Merchant Endpoints</h3>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>

          <div className="grid gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-primary font-bold bg-primary/10 px-3 py-1 rounded-full">POST /api/invoices</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest italic">Terminal Initialization</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Generates a unique reference key controlled by the merchant. The customer never sees this key, but the protocol uses it to index the payment.
              </p>
              <pre className="bg-black/40 border border-white/10 p-6 rounded-3xl font-mono text-xs overflow-x-auto text-muted-foreground liquid-glass">
{`{
  "itemName": "Single Estate Coffee",
  "amountUsdc": 5.00,
  "merchantId": "mer_85sj2..."
}

// Resulting Payload
{
  "id": "inv_99z...",
  "solanaReference": "8sj2L...99fD",
  "qrUrl": "solana:8sj2L..."
}`}
              </pre>
            </div>

            <div className="space-y-4 pt-8 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-primary font-bold bg-primary/10 px-3 py-1 rounded-full">POST /api/invoices/:id/verify</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest italic">Onchain Validation</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Call this endpoint once your frontend detects a transaction. It performs a rigorous server-side check against the Solana RPC to ensure the USDC transfer matches the invoice.
              </p>
            </div>
          </div>
        </section>

        {/* Contract Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-display">Settlement Core</h3>
            <div className="h-px flex-1 bg-white/10"></div>
          </div>

          <Card className="bg-white/[0.01] border-white/5 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                  <Shield className="h-6 w-6 text-red-400" />
                </div>
                <div className="space-y-4 flex-1">
                  <h4 className="text-xl font-display">CRegRegistry.sol</h4>
                  <p className="text-sm text-muted-foreground">
                    The settlement registry is deployed on Avalanche Fuji. It maintains a verifiable mapping of Solana payment references to high-chain transaction IDs.
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-4 mt-8">
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2">
                       <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Testnet Address (Fuji)</span>
                       <p className="text-[10px] font-mono whitespace-nowrap overflow-hidden text-ellipsis">0x71C7656EC7ab88b098defB751B7401B5f6d8976F</p>
                    </div>
                    <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2">
                       <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Settlement Logic</span>
                       <p className="text-[10px] font-mono">recordSettlement(bytes32 solRef, uint256 amt)</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="pt-20 text-center">
          <p className="text-muted-foreground text-sm max-w-lg mx-auto mb-8 font-mono italic">
            "We believe the best payment networks are invisible. Developers should focus on the experience, not the bridges."
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" className="rounded-full px-8">Read Full Whitepaper</Button>
            <Button variant="glass" className="rounded-full px-8">Join the DAO</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Contact() {
  return (
    <div className="container mx-auto px-6 py-20 max-w-5xl animate-fade-rise">
      <div className="text-center mb-20">
        <h2 className="text-6xl md:text-7xl font-display mb-6 tracking-tight">Get in touch.</h2>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Whether you're a merchant looking to transition onchain or a developer 
          building the next commerce giant, we're here to help.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10 items-stretch">
        <Card className="bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 group">
          <CardContent className="p-10 flex flex-col h-full">
            <div className="p-4 rounded-2xl bg-blue-500/10 w-fit mb-8 border border-blue-500/20 group-hover:scale-110 transition-transform duration-500">
              <MessageSquare className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-3xl font-display mb-4">Partnership Inquiries</h3>
            <p className="text-muted-foreground text-base mb-10 leading-relaxed">
              Integrate CRegi's cross-chain settlement logic into your existing 
              POS system, e-commerce platform, or wallet. Let's scale onchain payments together.
            </p>
            <div className="mt-auto">
              <Button 
                variant="outline" 
                className="w-full rounded-full font-mono text-[10px] uppercase tracking-[0.2em] h-14 group-hover:border-white/20 transition-all"
                render={<a href="mailto:partnerships@cregi.xyz" />}
              >
                Initiate Partnership
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 group">
          <CardContent className="p-10 flex flex-col h-full">
            <div className="p-4 rounded-2xl bg-purple-500/10 w-fit mb-8 border border-purple-500/20 group-hover:scale-110 transition-transform duration-500">
              <Twitter className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-3xl font-display mb-4">Community & Updates</h3>
            <p className="text-muted-foreground text-base mb-10 leading-relaxed">
              Stay synchronized with our latest protocol upgrades, chain integrations, 
              and merchant success stories on our social channels.
            </p>
            <div className="mt-auto">
              <Button 
                variant="outline" 
                className="w-full rounded-full font-mono text-[10px] uppercase tracking-[0.2em] h-14 group-hover:border-white/20 transition-all"
                render={<a href="https://twitter.com/CRegi_Protocol" target="_blank" rel="noreferrer" />}
              >
                Follow @CRegi_Protocol
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-20 p-16 rounded-[3rem] bg-white/[0.02] border border-white/10 text-center group relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div className="relative z-10">
          <div className="p-4 rounded-full bg-white/5 w-fit mx-auto mb-8 border border-white/10">
            <Mail className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-[10px] mb-4 tracking-[0.4em] uppercase font-mono">Direct Support Contact</p>
          <a 
            href="mailto:support@cregi.xyz" 
            className="text-4xl md:text-5xl font-display hover:text-muted-foreground hover:scale-[1.02] transition-all inline-block tracking-tighter"
          >
            support@cregi.xyz
          </a>
          <p className="text-muted-foreground/60 text-sm mt-8 max-w-sm mx-auto italic">
            Average response time: &lt; 2 hours for protocol partners.
          </p>
        </div>
      </div>
    </div>
  );
}
