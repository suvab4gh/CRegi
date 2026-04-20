import { recordAvalancheSettlement } from "@/lib/avalanche/settlement";
import { createCircleSettlementIntent } from "@/lib/circle/settlement";
import {
  getInvoice,
  updateInvoice
} from "@/lib/server/invoice-repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const invoice = await getInvoice(id);

  if (!invoice) {
    return Response.json({ error: "Invoice not found." }, { status: 404 });
  }

  if (invoice.status === "settled_on_avalanche") {
    return Response.json({ invoice });
  }

  if (invoice.status !== "paid_on_solana" && invoice.status !== "settling") {
    return Response.json(
      { error: "Invoice must be paid on Solana before settlement." },
      { status: 409 }
    );
  }

  const settling = await updateInvoice(invoice.id, { status: "settling" });

  try {
    const settlementSource = settling ?? invoice;
    const circle = await createCircleSettlementIntent(settlementSource);
    const avalanche = await recordAvalancheSettlement(settlementSource, circle);
    const settled = await updateInvoice(invoice.id, {
      status: "settled_on_avalanche",
      circleTransferId: circle.id,
      avalancheTx: avalanche.txHash
    });

    return Response.json({
      invoice: settled,
      circle,
      avalanche
    });
  } catch (error) {
    const failed = await updateInvoice(invoice.id, { status: "failed" });
    return Response.json(
      {
        invoice: failed,
        error: error instanceof Error ? error.message : "Settlement failed."
      },
      { status: 500 }
    );
  }
}
