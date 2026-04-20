"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { DEMO_AVALANCHE_MERCHANT } from "@/lib/constants";
import type { Invoice, InvoiceStatus, RuntimeReadiness } from "@/lib/types";

type CregiAppProps = {
  initialInvoices: Invoice[];
  readiness: RuntimeReadiness;
};

const statusLabels: Record<InvoiceStatus, string> = {
  awaiting_payment: "Awaiting payment",
  paid_on_solana: "Paid on Solana",
  settling: "Settling",
  settled_on_avalanche: "Settled",
  failed: "Failed"
};

const statusRank: Record<InvoiceStatus, number> = {
  awaiting_payment: 0,
  paid_on_solana: 1,
  settling: 1,
  settled_on_avalanche: 2,
  failed: 0
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  hour: "2-digit",
  minute: "2-digit",
  month: "short",
  day: "numeric"
});

const videoUrl =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260217_030345_246c0224-10a4-422c-b324-070b7c0eceda.mp4";

export function CregiApp({
  initialInvoices,
  readiness
}: CregiAppProps) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [selectedId, setSelectedId] = useState(initialInvoices[0]?.id ?? "");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [toast, setToast] = useState(readiness.notes[0] ?? "");
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [isSwitching, startSwitch] = useTransition();
  const [form, setForm] = useState({
    merchantName: "SCBC Coffee Bar",
    itemName: "Builder espresso tab",
    amountUsdc: "5.00",
    avalancheMerchantAddress: DEMO_AVALANCHE_MERCHANT
  });

  const selected = useMemo(
    () => invoices.find((invoice) => invoice.id === selectedId) ?? invoices[0] ?? null,
    [invoices, selectedId]
  );

  const upsertInvoice = useCallback((invoice: Invoice) => {
    setInvoices((current) => {
      const exists = current.some((item) => item.id === invoice.id);
      const next = exists
        ? current.map((item) => (item.id === invoice.id ? invoice : item))
        : [invoice, ...current];

      return next.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    });
    startSwitch(() => setSelectedId(invoice.id));
  }, []);

  const refreshInvoice = useCallback(
    async (id: string, announce = false) => {
      const response = await fetch(`/api/invoices/${id}`, { cache: "no-store" });
      const payload = (await response.json()) as { invoice?: Invoice; error?: string };

      if (!response.ok || !payload.invoice) {
        throw new Error(payload.error ?? "Could not refresh invoice.");
      }

      upsertInvoice(payload.invoice);
      if (announce) {
        setToast("Invoice refreshed from the server.");
      }
    },
    [upsertInvoice]
  );

  useEffect(() => {
    if (!selected?.solanaPaymentUrl) {
      return;
    }

    let active = true;
    setQrDataUrl("");

    async function renderQr() {
      const QRCode = await import("qrcode");
      const dataUrl = await QRCode.toDataURL(selected.solanaPaymentUrl, {
        width: 320,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#ffffff"
        }
      });

      if (active) {
        setQrDataUrl(dataUrl);
      }
    }

    renderQr().catch(() => {
      if (active) {
        setToast("QR rendering failed. The payment URL is still available in proof details.");
      }
    });

    return () => {
      active = false;
    };
  }, [selected?.solanaPaymentUrl]);

  useEffect(() => {
    if (!selected?.id) {
      return;
    }

    const interval = window.setInterval(() => {
      refreshInvoice(selected.id).catch(() => undefined);
    }, 4_000);

    return () => window.clearInterval(interval);
  }, [refreshInvoice, selected?.id]);

  async function handleCreateInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyAction("create");
    setToast("");

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form)
      });
      const payload = (await response.json()) as { invoice?: Invoice; error?: string };

      if (!response.ok || !payload.invoice) {
        throw new Error(payload.error ?? "Invoice creation failed.");
      }

      upsertInvoice(payload.invoice);
      setToast("Invoice created. The QR is ready for Solana USDC payment.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Invoice creation failed.");
    } finally {
      setBusyAction(null);
    }
  }

  async function verifyPayment(demo: boolean) {
    if (!selected) {
      return;
    }

    setBusyAction(demo ? "demo-pay" : "verify");
    setToast("");

    try {
      const response = await fetch(`/api/invoices/${selected.id}/verify-solana`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ demo })
      });
      const payload = (await response.json()) as { invoice?: Invoice; error?: string };

      if (!response.ok || !payload.invoice) {
        throw new Error(payload.error ?? "Payment not found yet.");
      }

      upsertInvoice(payload.invoice);
      setToast(
        demo
          ? "Demo payment marked as paid on Solana."
          : "Solana payment detected and validated."
      );
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Solana verification failed.");
    } finally {
      setBusyAction(null);
    }
  }

  async function settleInvoice() {
    if (!selected) {
      return;
    }

    setBusyAction("settle");
    setToast("Settlement started. Circle and Avalanche details stay behind the counter.");

    try {
      const response = await fetch(`/api/invoices/${selected.id}/settle`, {
        method: "POST"
      });
      const payload = (await response.json()) as { invoice?: Invoice; error?: string };

      if (!response.ok || !payload.invoice) {
        throw new Error(payload.error ?? "Settlement failed.");
      }

      upsertInvoice(payload.invoice);
      setToast("Merchant settlement recorded on the Avalanche side.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Settlement failed.");
      await refreshInvoice(selected.id).catch(() => undefined);
    } finally {
      setBusyAction(null);
    }
  }

  const readinessRows = [
    ["Database", readiness.database],
    ["Solana RPC", readiness.solana],
    ["Circle rail", readiness.circle],
    ["Avalanche", readiness.avalanche]
  ] as const;

  return (
    <div className="app-shell">
      <video
        className="terminal-video"
        src={videoUrl}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />
      <div className="terminal-overlay" aria-hidden="true" />
      <section className="terminal">
        <aside className="sidebar">
          <div className="brand-block">
            <p className="eyebrow">USDC point of sale</p>
            <h1 className="brand-title">
              CRE
              <span>GI</span>
            </h1>
            <p className="brand-copy">
              A merchant terminal where customers pay USDC on Solana and the
              merchant gets a clean Avalanche settlement record. No bridge UI,
              no chain vocabulary at checkout.
            </p>
          </div>

          <div className="rail-map" aria-label="Payment rail">
            <div className="rail-leg">
              <strong>Pay</strong>
              <span>Solana Pay QR with a unique invoice reference.</span>
            </div>
            <div className="rail-leg">
              <strong>Route</strong>
              <span>Circle adapter keeps Gateway or CCTP behind the API.</span>
            </div>
            <div className="rail-leg">
              <strong>Settle</strong>
              <span>Avalanche Fuji stores the merchant receipt.</span>
            </div>
          </div>
        </aside>

        <section className="workspace">
          <header className="topbar">
            <div>
              <h1>Merchant workspace</h1>
              <p>Issue invoices, detect Solana payment, and settle to Avalanche.</p>
            </div>
            <div className="status-pill" aria-live="polite">
              <span className="status-dot" />
              {readiness.database === "ready" ? "Vercel ready" : "Demo mode"}
            </div>
          </header>

          <div className="grid">
            <section className="panel">
              <div className="panel-label">
                <h2>New invoice</h2>
                <span>Terminal</span>
              </div>

              <form className="invoice-form" onSubmit={handleCreateInvoice}>
                <div className="field">
                  <label htmlFor="merchantName">Merchant</label>
                  <input
                    id="merchantName"
                    value={form.merchantName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        merchantName: event.target.value
                      }))
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="itemName">Item</label>
                  <input
                    id="itemName"
                    value={form.itemName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        itemName: event.target.value
                      }))
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="amountUsdc">Amount USDC</label>
                  <input
                    id="amountUsdc"
                    inputMode="decimal"
                    value={form.amountUsdc}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        amountUsdc: event.target.value
                      }))
                    }
                  />
                </div>

                <div className="field">
                  <label htmlFor="avalancheMerchantAddress">
                    Avalanche merchant address
                  </label>
                  <input
                    id="avalancheMerchantAddress"
                    value={form.avalancheMerchantAddress}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        avalancheMerchantAddress: event.target.value
                      }))
                    }
                  />
                </div>

                <button
                  className="primary-button"
                  disabled={busyAction === "create"}
                  type="submit"
                >
                  {busyAction === "create" ? "Creating" : "Create QR invoice"}
                </button>
              </form>

              <div className="panel-label">
                <h3>Recent invoices</h3>
                <span>{invoices.length}</span>
              </div>

              <div className="invoice-list">
                {invoices.length === 0 ? (
                  <div className="empty-state">
                    Create the first invoice to arm the payment terminal.
                  </div>
                ) : (
                  invoices.map((invoice) => (
                    <button
                      className={`invoice-row ${
                        selected?.id === invoice.id ? "active" : ""
                      }`}
                      key={invoice.id}
                      onClick={() => startSwitch(() => setSelectedId(invoice.id))}
                      type="button"
                    >
                      <span className="invoice-row-top">
                        <strong>{invoice.itemName}</strong>
                        <span className="amount">{invoice.amountUsdc}</span>
                      </span>
                      <span className="invoice-row-bottom">
                        <small>{dateFormatter.format(new Date(invoice.createdAt))}</small>
                        <span className={`badge ${invoice.status}`}>
                          {statusLabels[invoice.status]}
                        </span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </section>

            <section className="panel checkout-stage">
              {selected ? (
                <div className="checkout-card">
                  <div className="receipt-heading">
                    <p>{selected.merchantName}</p>
                    <h2>{selected.amountUsdc} USDC</h2>
                  </div>

                  <div className="qr-shell">
                    <div className="qr-box">
                      {qrDataUrl ? (
                        <img alt="Solana Pay invoice QR" src={qrDataUrl} />
                      ) : (
                        <div className="qr-placeholder" aria-hidden="true" />
                      )}
                    </div>
                    <div className="qr-copy">
                      <h3>{selected.itemName}</h3>
                      <p>
                        Scan with a Solana wallet. CREGI tracks the
                        reference, then settles the merchant side on Avalanche.
                      </p>
                      <div className="action-row">
                        <button
                          className="secondary-button"
                          disabled={
                            busyAction !== null ||
                            selected.status !== "awaiting_payment"
                          }
                          onClick={() => verifyPayment(false)}
                          type="button"
                        >
                          Verify payment
                        </button>
                        <button
                          className="ghost-button"
                          disabled={
                            busyAction !== null ||
                            selected.status !== "awaiting_payment"
                          }
                          onClick={() => verifyPayment(true)}
                          type="button"
                        >
                          Demo paid
                        </button>
                        <button
                          className="primary-button"
                          disabled={
                            busyAction !== null ||
                            (selected.status !== "paid_on_solana" &&
                              selected.status !== "settling")
                          }
                          onClick={settleInvoice}
                          type="button"
                        >
                          Settle merchant
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="timeline" aria-label="Invoice timeline">
                    {[
                      [
                        "Invoice armed",
                        "QR includes amount, USDC mint, merchant label, and reference."
                      ],
                      [
                        "Solana payment detected",
                        "The API validates the reference and expected USDC receiver."
                      ],
                      [
                        "Avalanche receipt recorded",
                        "Circle settlement ID and merchant receipt are stored together."
                      ]
                    ].map(([title, detail], index) => (
                      <div
                        className={`timeline-step ${
                          statusRank[selected.status] >= index ? "done" : ""
                        }`}
                        key={title}
                      >
                        <div>
                          <strong>{title}</strong>
                          <span>{detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {toast ? <div className="toast">{toast}</div> : null}
                  {isSwitching ? <div className="toast">Switching invoice...</div> : null}
                </div>
              ) : (
                <div className="empty-state">No invoice selected.</div>
              )}
            </section>

            <aside className="panel inspector">
              <div className="panel-label">
                <h2>Proof details</h2>
                <span>Status</span>
              </div>

              {selected ? (
                <div className="proof-stack">
                  <ProofRow label="Invoice ID" value={selected.id} />
                  <ProofRow label="Solana reference" value={selected.solanaReference} />
                  <ProofRow label="Solana receiver" value={selected.solanaRecipient} />
                  <ProofRow
                    label="Solana tx"
                    value={selected.solanaTx ?? "Waiting for payment"}
                  />
                  <ProofRow
                    label="Circle transfer"
                    value={selected.circleTransferId ?? "Not settled yet"}
                  />
                  <ProofRow
                    label="Avalanche tx"
                    value={selected.avalancheTx ?? "Not recorded yet"}
                  />
                  <ProofRow
                    label="Payment URL"
                    value={shorten(selected.solanaPaymentUrl, 84)}
                  />
                </div>
              ) : (
                <div className="empty-state">Select an invoice to inspect proofs.</div>
              )}

              <div className="readiness-list">
                {readinessRows.map(([label, mode]) => (
                  <div className="readiness-item" key={label}>
                    <span>{label}</span>
                    <strong className={`readiness-state ${mode}`}>{mode}</strong>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>
      </section>
    </div>
  );
}

function ProofRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="proof-row">
      <span>{label}</span>
      <code>{shorten(value)}</code>
    </div>
  );
}

function shorten(value: string, maxLength = 46) {
  if (value.length <= maxLength) {
    return value;
  }

  const head = Math.max(12, Math.floor(maxLength * 0.42));
  const tail = Math.max(8, Math.floor(maxLength * 0.28));
  return `${value.slice(0, head)}...${value.slice(-tail)}`;
}
