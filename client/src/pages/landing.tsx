import { LogIn, ShoppingBag } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="w-full px-6 py-5 flex items-center justify-center border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-gray-900">
            Consumers <span className="text-blue-600">PRO</span>
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 gap-12">
        <div className="text-center max-w-sm">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-3">
            Your wholesale advantage starts here.
          </h1>
          <p className="text-base text-gray-500">
            Access your account or join the Wholesale PROgram to unlock exclusive pricing and benefits.
          </p>
        </div>

        <div className="w-full max-w-sm flex flex-col gap-4">
          <a
            href="https://system.netsuite.com/pages/customerlogin.jsp"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="link-portal-login"
            className="flex items-center justify-center gap-3 w-full rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-base px-6 py-4 transition-colors shadow-sm"
          >
            <LogIn className="w-5 h-5 flex-shrink-0" />
            Log In to Portal
          </a>

          <Link
            href="/signup"
            data-testid="link-wholesale-signup"
            className="flex items-center justify-center gap-3 w-full rounded-xl border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100 font-semibold text-base px-6 py-4 transition-colors"
          >
            <ShoppingBag className="w-5 h-5 flex-shrink-0" />
            Sign Up for Wholesale PROgram
          </Link>
        </div>

        <div className="w-full max-w-sm grid grid-cols-3 gap-4 pt-4">
          <div className="flex flex-col items-center text-center gap-1">
            <span className="text-2xl font-bold text-blue-600">PRO</span>
            <span className="text-xs text-gray-500 leading-tight">Pricing</span>
          </div>
          <div className="flex flex-col items-center text-center gap-1">
            <span className="text-2xl font-bold text-blue-600">24/7</span>
            <span className="text-xs text-gray-500 leading-tight">Account Access</span>
          </div>
          <div className="flex flex-col items-center text-center gap-1">
            <span className="text-2xl font-bold text-blue-600">Net</span>
            <span className="text-xs text-gray-500 leading-tight">Terms Available</span>
          </div>
        </div>
      </main>

      <footer className="px-6 py-5 text-center text-xs text-gray-400 border-t border-gray-100">
        &copy; {new Date().getFullYear()} Consumers PRO. All rights reserved.
      </footer>
    </div>
  );
}
