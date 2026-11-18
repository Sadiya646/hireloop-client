import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/app/components/DashboardSidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar": "#0b0b0e",
          "--sidebar-foreground": "#ffffff",
          "--sidebar-accent": "#1c1d24",
          "--sidebar-accent-foreground": "#ffffff",
          "--sidebar-border": "rgba(255,255,255,0.06)",
        } as React.CSSProperties
      }
    >
      <div className="flex min-h-svh w-full bg-[#111217] text-white">
        <DashboardSidebar />
        <SidebarInset className="flex flex-1 flex-col bg-[#111217]">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-white/[0.06] bg-[#111217]/80 px-4 backdrop-blur">
            <SidebarTrigger className="text-neutral-400 hover:bg-white/10 hover:text-white" />
            <span className="text-sm font-medium text-neutral-300">
              Admin / Dashboard
            </span>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}