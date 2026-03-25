export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0d2b5e] via-[#1a4080] to-[#1e5fa8] px-6 py-16 text-white">
      <div className="w-full max-w-sm flex flex-col items-center text-center gap-8">

        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-1">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4L28 10V22L16 28L4 22V10L16 4Z" fill="white" fillOpacity="0.9" />
              <path d="M16 8L24 12V20L16 24L8 20V12L16 8Z" fill="#1a4080" />
              <path d="M16 12L20 14V18L16 20L12 18V14L16 12Z" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight leading-tight">
            Welcome to{" "}
            <span className="whitespace-nowrap">Consumers PRO</span>
          </h1>
          <p className="text-base text-white/75 leading-relaxed">
            Your trusted partner for wholesale purchasing. Access exclusive pricing, manage your account, and grow your business with us.
          </p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <a
            href="https://www.ckbpro.com/portal"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="link-portal-login"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white text-[#1a4080] font-semibold text-base px-6 py-4 hover:bg-white/90 active:bg-white/80 transition-colors shadow-lg"
          >
            Log In to Your Portal
          </a>

          <a
            href="https://www.ckbpro.com/signup"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="link-wholesale-signup"
            className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-white/40 bg-white/10 text-white font-semibold text-base px-6 py-4 hover:bg-white/20 active:bg-white/25 transition-colors"
          >
            Sign Up for Wholesale PROgram
          </a>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <span className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-white/90">
            Wholesale Pricing
          </span>
          <span className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-white/90">
            Trusted Program
          </span>
          <span className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-white/90">
            Fast Access
          </span>
        </div>

      </div>
    </div>
  );
}
