import { findSolanaPayment, PaymentNotFoundError } from "@/lib/solana/payments";
import {
  getInvoice,
  updateInvoice
} from "@/lib/server/invoice-repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 20;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const invoice = await getInvoice(id);

  if (!invoice) {
    return Response.json({ error: "Invoice not found." }, { status: 404 });
  }

  if (invoice.status !== "awaiting_payment") {
    return Response.json({ invoice });
  }

  const body = await safeJson(request);
  const demo = body.demo === true || process.env.CREGI_DEMO_MODE === "true";

  if (demo) {
    const updated = await updateInvoice(invoice.id, {
      status: "paid_on_solana",
      solanaTx: `demo_sol_${invoice.solanaReference.slice(0, 18)}`
    });
    return Response.json({ invoice: updated, mode: "demo" });
  }

  try {
    const payment = await findSolanaPayment(invoice);
    const updated = await updateInvoice(invoice.id, {
      status: "paid_on_solana",
      solanaTx: payment.signature
    });
    return Response.json({ invoice: updated, mode: "live" });
  } catch (error) {
    if (error instanceof PaymentNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }

    return Response.json(
      { error: error instanceof Error ? error.message : "Solana verification failed." },
      { status: 500 }
    );
  }
}

async function safeJson(request: Request) {
  try {
    return (await request.json()) as { demo?: boolean };
  } catch {
    return {};
  }
}
