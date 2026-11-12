import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

import logoUrl from "@/app/images/logo.png"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-muted/40 px-4 py-10">
      <Link href="/" className="mb-8 shrink-0" aria-label="HireLoop home">
        <Image src={logoUrl} alt="HireLoop" priority className="h-10 w-auto" />
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm">
        {children}
      </div>
    </main>
  )
}
