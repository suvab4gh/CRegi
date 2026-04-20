import { CregiApp } from "@/components/cregi-app";
import { getRuntimeReadiness } from "@/lib/runtime-readiness";
import { listInvoices } from "@/lib/server/invoice-repository";

export const dynamic = "force-dynamic";

export default async function TerminalPage() {
  const [invoices, readiness] = await Promise.all([
    listInvoices(),
    getRuntimeReadiness()
  ]);

  return (
    <main>
      <CregiApp initialInvoices={invoices} readiness={readiness} />
    </main>
  );
}
