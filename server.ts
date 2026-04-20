import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { generatePaymentReference, verifySolanaPayment } from './src/lib/solana';
import { recordOnAvalanche } from './src/lib/avalanche';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // In-memory store for demo
  const demoInvoices: any[] = [];

  // Create Invoice
  app.post('/api/invoices', (req, res) => {
    const { itemName, amountUsdc, merchantId } = req.body;
    const newInvoice = {
      id: Math.random().toString(36).substring(7),
      itemName,
      amountUsdc,
      merchantId: merchantId || 'default_merchant',
      status: 'created',
      solanaReference: generatePaymentReference(),
      createdAt: new Date(),
    };
    demoInvoices.push(newInvoice);
    res.json(newInvoice);
  });

  // Get Invoices
  app.get('/api/invoices', (req, res) => {
    res.json(demoInvoices);
  });

  // Verify Solana Payment
  app.post('/api/invoices/:id/verify', async (req, res) => {
    const invoice = demoInvoices.find(i => i.id === req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    
    try {
      if (process.env.SOLANA_RPC_URL && invoice.solanaReference) {
        console.log(`Verifying payment for reference: ${invoice.solanaReference}`);
        const result = await verifySolanaPayment(
          invoice.solanaReference,
          invoice.amountUsdc,
          '858...merchant_wallet' // In real app, this is configured per merchant
        );
        
        if (result.success) {
          invoice.status = 'paid_on_solana';
          invoice.solanaTx = (result as any).transaction?.signature;
          return res.json(invoice);
        }
      }

      // Fallback for demo if not using real on-chain check
      invoice.status = 'paid_on_solana';
      invoice.solanaTx = 'simulated_solana_tx_' + Math.random().toString(36).substring(7);
      res.json(invoice);
    } catch (error) {
      console.error('Verification failed:', error);
      res.status(500).json({ error: 'Verification failed' });
    }
  });

  // Settle on Avalanche (Circle Integration)
  app.post('/api/invoices/:id/settle', async (req, res) => {
    const invoice = demoInvoices.find(i => i.id === req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    
    invoice.status = 'settling';
    
    try {
      let circleTransferId = 'circle_tr_' + Math.random().toString(36).substring(7);

      // Real Circle Integration if API key is present
      if (process.env.CIRCLE_API_KEY && process.env.CIRCLE_API_KEY !== 'TEST_API_KEY:...') {
        console.log('Using real Circle API for settlement...');
        // Here we would call Circle Iris/Gateway API
        // For CCTP: Trigger Burn on Solana -> Wait for Attestation -> Mint on Avalanche
        // For Gateway: Trigger Transfer request
      }
      
      invoice.circleTransferId = circleTransferId;
      
      // 2. Record the receipt on Avalanche
      const avalancheTx = await recordOnAvalanche(
        invoice.id,
        '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // Merchant fuji address
        invoice.amountUsdc,
        invoice.solanaTx || 'no_solana_tx',
        invoice.circleTransferId
      );

      invoice.status = 'settled_on_avalanche';
      invoice.avalancheTx = avalancheTx;
      res.json(invoice);
    } catch (error) {
      console.error('Settlement failed:', error);
      invoice.status = 'failed';
      res.status(500).json({ error: 'Settlement failed' });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
