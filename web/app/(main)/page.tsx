"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const session = useSession();
  const router = useRouter();
  useEffect(() => {
    if (session) {
      if (session.data) {
        router.push("/dashboard");
      } else {
        router.push("/api/auth/login");
      }
    }
  }, [session, router]);
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      Loading
    </div>
  );
}
