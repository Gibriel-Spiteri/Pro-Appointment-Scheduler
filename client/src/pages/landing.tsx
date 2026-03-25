import { Monitor, ShieldCheck, Zap, LogIn, Plus } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f0f0f0]">
      <header className="bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
        <span className="text-lg font-bold text-gray-900 whitespace-nowrap">
          Consumers <span className="text-blue-600">PRO</span>
        </span>
        <a
          href="https://www.ckbpro.com/portal"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="link-portal-login-header"
          className="text-blue-600 text-sm font-medium hover:underline"
        >
          Portal Login
        </a>
      </header>

      <main className="flex-1 flex flex-col">
        <div className="bg-white mx-0 mt-0 px-6 pt-16 pb-12 flex flex-col items-center text-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              Welcome to
            </h1>
            <h2 className="text-3xl font-bold leading-tight">
              <span className="text-blue-600">Consumers</span>{" "}
              <span className="text-gray-900">PRO</span>
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed max-w-[260px] mt-2">
              Your trusted partner for wholesale purchasing. Access exclusive pricing, manage your account, and grow your business with us.
            </p>
          </div>

          <div className="w-full flex flex-col gap-3 mt-2">
            <a
              href="https://www.ckbpro.com/portal"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-portal-login"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm px-5 py-3.5 transition-colors"
            >
              <LogIn className="w-4 h-4 flex-shrink-0" />
              Log In to Your Portal
            </a>

            <a
              href="https://www.ckbpro.com/signup"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-wholesale-signup"
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800 font-semibold text-sm px-5 py-3.5 transition-colors"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              Sign Up for Wholesale PROgram
            </a>
          </div>
        </div>

        <div className="flex-1 px-4 pt-10 pb-8">
          <div className="grid grid-cols-3 gap-3">
            <div
              data-testid="card-wholesale-pricing"
              className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center gap-2 p-4 text-center"
            >
              <Monitor className="w-6 h-6 text-blue-500" />
              <span className="text-xs text-gray-600 font-medium leading-tight">Wholesale Pricing</span>
            </div>
            <div
              data-testid="card-trusted-program"
              className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center gap-2 p-4 text-center"
            >
              <ShieldCheck className="w-6 h-6 text-blue-500" />
              <span className="text-xs text-gray-600 font-medium leading-tight">Trusted Program</span>
            </div>
            <div
              data-testid="card-fast-access"
              className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center gap-2 p-4 text-center"
            >
              <Zap className="w-6 h-6 text-blue-500" />
              <span className="text-xs text-gray-600 font-medium leading-tight">Fast Access</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 px-5 py-5 text-center">
        <p className="text-xs text-gray-500 mb-2">
          &copy; {new Date().getFullYear()} Consumers PRO. All rights reserved.
        </p>
        <div className="flex items-center justify-center gap-4">
          <a href="#" className="text-xs text-gray-500 hover:text-gray-700">Privacy Policy</a>
          <a href="#" className="text-xs text-gray-500 hover:text-gray-700">Terms of Service</a>
          <a href="#" className="text-xs text-gray-500 hover:text-gray-700">Contact</a>
        </div>
      </footer>
    </div>
  );
}
