import React from "react"
import { DashboardSidebar } from "@/app/components/DashboardSidebar" // তোমার ফাইল পাথ অনুযায়ী ঠিক করে নিও
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#0f1014] text-white">
        {/* বামপাশের সাইডবার */}
        <DashboardSidebar />

        {/* ডানপাশের মেইন কন্টেন্ট */}
        <SidebarInset className="flex flex-1 flex-col bg-[#0f1014]">
          {/* উপরের টপ বার (তোমার স্ক্রিনশটের মতো) */}
          <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/10 bg-[#0b0b0e] px-4">
            <SidebarTrigger className="text-neutral-300 hover:bg-white/10 hover:text-white" />
            <span className="text-sm font-medium text-neutral-300">
              Dashboard
            </span>
          </header>

          {/* প্রতিটি পেজের (admin, recruiter, seeker) কন্টেন্ট এখানে লোড হবে */}
          <main className="flex-1">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}