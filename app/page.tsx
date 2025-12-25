"use client";
import Link from "next/link";

export default function Dashboard() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center">
      <div>
        <Link href={"/connect"}>
          <button className="bg-foreground text-background hover:bg-foreground/80 cursor-pointer rounded-lg px-4 py-1 transition-all">
            Get Started
          </button>
        </Link>
      </div>
    </main>
  );
}
