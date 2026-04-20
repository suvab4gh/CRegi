const navItems = ["Get Started", "Developers", "Features", "Resources"];

const videoUrl =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260217_030345_246c0224-10a4-422c-b324-070b7c0eceda.mp4";

export function CregiHero() {
  return (
    <section className="cregi-hero" aria-label="CREGI landing hero">
      <video
        className="cregi-hero-video"
        src={videoUrl}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />
      <div className="cregi-hero-overlay" aria-hidden="true" />

      <nav className="cregi-navbar" aria-label="Primary navigation">
        <div className="cregi-nav-left">
          <a className="cregi-logo" href="/" aria-label="CREGI home">
            CREGI
          </a>
          <div className="cregi-nav-links">
            {navItems.map((item) => (
              <a className="cregi-nav-link" href="#" key={item}>
                <span>{item}</span>
                <ChevronDown />
              </a>
            ))}
          </div>
        </div>

        <a className="cregi-button cregi-button-dark" href="#waitlist">
          <span>Join Waitlist</span>
        </a>
      </nav>

      <div className="cregi-hero-content">
        <div className="cregi-access-pill">
          <span className="cregi-pill-dot" aria-hidden="true" />
          <span className="cregi-muted">Early access available from</span>
          <span> May 1, 2026</span>
        </div>

        <div className="cregi-copy-stack">
          <h1>USDC Checkout at the Speed of Experience</h1>
          <p>
            CREGI lets merchants accept USDC on Solana, route settlement through
            Circle, and record clean receipts on Avalanche, without exposing
            customers to bridges, chain IDs, or crypto complexity.
          </p>
        </div>

        <a className="cregi-button cregi-button-light" href="#waitlist">
          <span>Join Waitlist</span>
        </a>
      </div>
    </section>
  );
}

function ChevronDown() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3.5 5.25L7 8.75L10.5 5.25"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
