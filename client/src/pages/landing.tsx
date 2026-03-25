import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="w-full px-5 py-4 flex items-center justify-between border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg tracking-tight">
            Consumers <span className="text-primary">PRO</span>
          </span>
        </div>
        <a
          href="https://www.ckbpro.com/portal"
          className="text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          Portal Login
        </a>
      </header>
      <main className="flex-1 flex flex-col">
        <section className="flex-1 flex flex-col items-center justify-center text-center px-5 py-16 gap-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-sm">
            Welcome to<br />
            <span className="whitespace-nowrap"><span className="text-primary">Consumers</span> <span className="text-foreground">PRO</span></span>
          </h1>

          <p className="text-muted-foreground text-base leading-relaxed max-w-xs">
            Your trusted partner for wholesale purchasing. Access exclusive pricing, manage your account, and grow your business with us.
          </p>

          <div className="flex flex-col w-full max-w-xs gap-3 pt-2">
            <a
              href="https://www.ckbpro.com/portal"
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3.5 px-6 rounded-xl text-sm shadow-sm hover:opacity-90 active:scale-[.98] transition-all"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
              Log In to Your Portal
            </a>

            <Link
              href="/signup"
              className="w-full inline-flex items-center justify-center gap-2 bg-card border border-border text-foreground font-semibold py-3.5 px-6 rounded-xl text-sm shadow-sm hover:bg-secondary active:scale-[.98] transition-all"
            >
              <svg
                className="w-4 h-4 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Sign Up for Wholesale PROgram
            </Link>
          </div>
        </section>

        <section className="px-5 pb-12">
          <div className="max-w-sm mx-auto grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-1.5 bg-card border border-border rounded-2xl p-4 text-center">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                  />
                </svg>
              </div>
              <p className="text-[11px] font-medium text-muted-foreground leading-tight">Wholesale Pricing</p>
            </div>

            <div className="flex flex-col items-center gap-1.5 bg-card border border-border rounded-2xl p-4 text-center">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
              </div>
              <p className="text-[11px] font-medium text-muted-foreground leading-tight">Trusted Program</p>
            </div>

            <div className="flex flex-col items-center gap-1.5 bg-card border border-border rounded-2xl p-4 text-center">
              <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
              </div>
              <p className="text-[11px] font-medium text-muted-foreground leading-tight">Fast Access</p>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-border bg-card px-5 py-5 text-center">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Consumers PRO. All rights reserved.
        </p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Terms of Service
          </a>
          <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </a>
        </div>
      </footer>
    </div>
  );
}
