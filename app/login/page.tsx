import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-light text-white tracking-[0.2em] uppercase">Sign In</h2>
          <p className="mt-2 text-sm text-neutral-400 font-light">Access your UNDRSKIN account</p>
        </div>
        
        <div className="space-y-4 mt-12">
          <form
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: "/account/profile" })
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-neutral-900 border border-neutral-800 text-sm text-white hover:bg-neutral-800 transition-colors uppercase tracking-widest"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </form>

          <form
            action={async () => {
              "use server"
              await signIn("apple", { redirectTo: "/account/profile" })
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-neutral-100 text-neutral-900 border border-neutral-100 hover:bg-white transition-colors text-sm uppercase tracking-widest font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.74 3.58-.79 1.69-.1 2.95.66 3.78 1.93-3.17 1.87-2.58 6.07.6 7.31-.69 1.6-1.5 3.04-2.9 4.67a12.87 12.87 0 0 1-1.07-1.15zM12.03 7.25c-.15-3.47 3.09-6.31 6.18-6.15.22 3.5-3.22 6.55-6.18 6.15z"/>
              </svg>
              Continue with Apple
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
