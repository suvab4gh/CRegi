import { getInvoice } from "@/lib/server/invoice-repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const invoice = await getInvoice(id);

  if (!invoice) {
    return Response.json({ error: "Invoice not found." }, { status: 404 });
  }

  return Response.json({
    receipt: {
      id: invoice.id,
      merchant: invoice.merchantName,
      item: invoice.itemName,
      amount: `${invoice.amountUsdc} USDC`,
      status: invoice.status,
      solanaTx: invoice.solanaTx,
      circleTransferId: invoice.circleTransferId,
      avalancheTx: invoice.avalancheTx,
      issuedAt: invoice.updatedAt
    }
  });
}
