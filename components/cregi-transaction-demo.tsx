"use client";

import { useEffect, useMemo, useState } from "react";

const transactionSteps = [
  {
    label: "Solana checkout",
    chain: "Solana",
    title: "Customer pays 12.50 USDC",
    detail: "CREGI detects the invoice reference and validates amount, mint, and receiver.",
    proof: "sol_7sP9...R3xL"
  },
  {
    label: "Circle settlement",
    chain: "Circle",
    title: "USDC rail prepares settlement",
    detail: "Circle stays behind the API layer so the merchant sees only payment status.",
    proof: "gw_4f91c2...a83"
  },
  {
    label: "Avalanche receipt",
    chain: "Avalanche",
    title: "Merchant receipt recorded",
    detail: "Avalanche stores a clean invoice receipt for reconciliation and proof.",
    proof: "0x7d42...91b4"
  }
];

const videoUrl =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260217_030345_246c0224-10a4-422c-b324-070b7c0eceda.mp4";

export function CregiTransactionDemo() {
  const [activeStep, setActiveStep] = useState(0);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStep((current) =>
        current === transactionSteps.length - 1 ? current : current + 1
      );
    }, 1450);

    return () => window.clearInterval(timer);
  }, [runId]);

  const currentStep = transactionSteps[activeStep];
  const completedCount = activeStep + 1;

  const proofs = useMemo(
    () => transactionSteps.slice(0, completedCount),
    [completedCount]
  );

  function replayDemo() {
    setActiveStep(0);
    setRunId((current) => current + 1);
  }

  return (
    <section
      className="cregi-demo-section"
      id="demo-transaction"
      aria-label="CREGI demo transaction"
    >
      <video
        className="cregi-demo-video"
        src={videoUrl}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />
      <div className="cregi-demo-overlay" aria-hidden="true" />
      <div className="cregi-demo-glow" aria-hidden="true" />

      <div className="cregi-demo-copy">
        <p className="cregi-section-kicker">Demo transaction</p>
        <h2>One checkout. Three rails. No chain chores.</h2>
        <p>
          Follow a CREGI invoice from a Solana USDC payment to Circle-powered
          settlement readiness and an Avalanche merchant receipt.
        </p>

        <div className="cregi-demo-actions">
          <a className="cregi-button cregi-button-light" href="/terminal">
            <span>Open Terminal</span>
          </a>
          <button
            className="cregi-button cregi-button-dark"
            onClick={replayDemo}
            type="button"
          >
            <span>Replay demo</span>
          </button>
        </div>
      </div>

      <div className="cregi-demo-console">
        <div className="cregi-console-bar">
          <span>CREGI / TRANSACTION DEMO</span>
          <strong>{activeStep === 2 ? "SETTLED" : "LIVE"}</strong>
        </div>

        <div className="cregi-console-main">
          <div className="cregi-invoice-proof">
            <span>Invoice</span>
            <strong>12.50 USDC</strong>
            <p>Workshop merch pass</p>
          </div>

          <div className="cregi-route-line" aria-hidden="true">
            {transactionSteps.map((step, index) => (
              <span
                className={index <= activeStep ? "active" : ""}
                key={step.label}
              />
            ))}
          </div>

          <div className="cregi-active-state">
            <span>{currentStep.chain}</span>
            <h3>{currentStep.title}</h3>
            <p>{currentStep.detail}</p>
          </div>
        </div>

        <div className="cregi-step-list">
          {transactionSteps.map((step, index) => (
            <div
              className={`cregi-step-row ${index <= activeStep ? "active" : ""}`}
              key={step.label}
            >
              <div className="cregi-step-index">0{index + 1}</div>
              <div>
                <strong>{step.label}</strong>
                <span>{step.chain}</span>
              </div>
              <code>{index <= activeStep ? step.proof : "pending"}</code>
            </div>
          ))}
        </div>

        <div className="cregi-receipt-strip">
          <div>
            <span>Merchant record</span>
            <strong>{proofs.at(-1)?.proof ?? "pending"}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{activeStep === 2 ? "Ready for books" : "In progress"}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
