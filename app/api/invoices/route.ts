import { z } from "zod";
import { DEMO_AVALANCHE_MERCHANT } from "@/lib/constants";
import {
  createInvoice,
  listInvoices
} from "@/lib/server/invoice-repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const createInvoiceSchema = z.object({
  merchantName: z.string().trim().min(2).max(80),
  itemName: z.string().trim().min(2).max(120),
  amountUsdc: z.string().trim().regex(/^\d+(\.\d{1,6})?$/),
  avalancheMerchantAddress: z
    .string()
    .trim()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .default(DEMO_AVALANCHE_MERCHANT)
});

export async function GET() {
  return Response.json({ invoices: await listInvoices() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createInvoiceSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        error: "Invalid invoice payload.",
        issues: parsed.error.flatten().fieldErrors
      },
      { status: 400 }
    );
  }

  const invoice = await createInvoice(parsed.data);
  return Response.json({ invoice }, { status: 201 });
}
