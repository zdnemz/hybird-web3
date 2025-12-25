"use client";

import { useAuth } from "@/contexts/auth-context";
import { withAuth } from "@/hoc/withAuth";

function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <main className="flex min-h-screen w-full items-center justify-center">
      <div>
        <h1 className="text-center text-2xl font-semibold">Dashboard</h1>
        <p>Your wallet address is: {user}</p>
        <button
          className="bg-foreground text-background hover:bg-foreground/80 cursor-pointer rounded-lg px-4 py-1 transition-all"
          onClick={() => logout()}
        >
          disconnect
        </button>
      </div>
    </main>
  );
}

export default withAuth(DashboardPage);
