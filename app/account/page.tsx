import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-light text-white tracking-[0.2em] uppercase">Account Overview</h1>
          <p className="mt-4 text-sm text-neutral-400 font-light">
            Welcome back, {session.user.name || session.user.email}
          </p>
        </div>

        <div className="p-8 border border-neutral-800 bg-neutral-900/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm uppercase tracking-widest text-white font-normal mb-2">Profile Details</h3>
              <p className="text-xs text-neutral-400 mb-4">{session.user.email}</p>
              <a href="/account/profile" className="text-[11px] uppercase tracking-widest text-neutral-300 hover:text-white underline underline-offset-4">
                Edit Delivery Details
              </a>
            </div>
            
            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="px-6 py-2.5 text-[11px] tracking-widest uppercase border border-neutral-600 text-white hover:bg-white hover:text-black transition-all"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
