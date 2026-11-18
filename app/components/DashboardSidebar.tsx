"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BriefcaseBusinessIcon,
  Building2Icon,
  CreditCardIcon,
  FileTextIcon,
  LayoutGridIcon,
  LogOutIcon,
  PlusCircleIcon,
  SettingsIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import logoUrl from "@/app/images/logo.png"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { signOut, userSession } from "@/lib/auth-client"

type NavItem = {
  title: string
  url: string
  icon: LucideIcon
}

type Role = "seeker" | "recruiter" | "admin"

const roleBasePaths: Record<Role, string> = {
  admin: "/dashboard/admin",
  recruiter: "/dashboard/recruiter",
  seeker: "/dashboard/seeker",
}

const roleSubtitles: Record<Role, { consoleName: string; roleTitle: string }> = {
  admin: { consoleName: "Admin Console", roleTitle: "Super Admin" },
  recruiter: { consoleName: "Recruiter Console", roleTitle: "Hiring Manager" },
  seeker: { consoleName: "Candidate Console", roleTitle: "Job Seeker" },
}

const menuItemsByRole: Record<Role, NavItem[]> = {
  admin: [
    { title: "Dashboard", url: "/dashboard/admin", icon: LayoutGridIcon },
    { title: "Users", url: "/dashboard/admin/users", icon: UsersIcon },
    { title: "Companies", url: "/dashboard/admin/companies", icon: Building2Icon },
    { title: "Jobs", url: "/dashboard/admin/jobs", icon: BriefcaseBusinessIcon },
    { title: "Payments", url: "/dashboard/admin/payments", icon: CreditCardIcon },
    { title: "Settings", url: "/dashboard/admin/settings", icon: SettingsIcon },
  ],
  recruiter: [
    { title: "Dashboard", url: "/dashboard/recruiter", icon: LayoutGridIcon },
    { title: "Post a Job", url: "/dashboard/recruiter/jobs/post-job", icon: PlusCircleIcon },
    { title: "Manage Jobs", url: "/dashboard/recruiter/jobs", icon: BriefcaseBusinessIcon },
    { title: "Applicants", url: "/dashboard/recruiter/applicants", icon: UsersIcon },
    { title: "Settings", url: "/dashboard/recruiter/settings", icon: SettingsIcon },
  ],
  seeker: [
    { title: "Dashboard", url: "/dashboard/seeker", icon: LayoutGridIcon },
    { title: "Browse Jobs", url: "/jobs", icon: BriefcaseBusinessIcon },
    { title: "Applications", url: "/dashboard/seeker/applications", icon: FileTextIcon },
    { title: "Settings", url: "/dashboard/seeker/settings", icon: SettingsIcon },
  ],
}

export function DashboardSidebar() {
  const { data: session } = userSession()
  const pathname = usePathname()
  const router = useRouter()

  const getActiveRole = (): Role => {
    if (pathname.startsWith("/dashboard/admin")) return "admin"
    if (pathname.startsWith("/dashboard/recruiter")) return "recruiter"
    if (pathname.startsWith("/dashboard/seeker")) return "seeker"
    return ((session?.user as { role?: Role })?.role ?? "admin") as Role
  }

  const userRole = getActiveRole()
  const navItems = menuItemsByRole[userRole]
  const basePath = roleBasePaths[userRole]
  const { consoleName, roleTitle } = roleSubtitles[userRole]

  const userName = session?.user?.name || "Alex Rivera"
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const isActive = (url: string) =>
    url === "/" || url === basePath
      ? pathname === url
      : pathname === url || pathname.startsWith(`${url}/`)

  const handleSignOut = async () => {
    await signOut()
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <Sidebar
      collapsible="icon"
      style={
        {
          "--sidebar": "#0b0b0e",
          "--sidebar-foreground": "#ffffff",
          "--sidebar-accent": "#1c1d24",
          "--sidebar-accent-foreground": "#ffffff",
          "--sidebar-border": "rgba(255,255,255,0.08)",
        } as React.CSSProperties
      }
      className="border-r border-white/10 bg-[#0b0b0e]! text-white! **:data-[sidebar=sidebar]:bg-[#0b0b0e]! **:data-[sidebar=sidebar]:text-white!"
    >
      {/* Top Header: Clean Properly Sized Logo + Subtitle */}
      <SidebarHeader className="bg-[#0b0b0e]! px-5 pt-6 pb-4">
        <Link
          href="/"
          aria-label="HireLoop home"
          className="flex flex-col items-start gap-1.5 transition-opacity hover:opacity-90"
        >
          {/* Logo exactly sized like Navbar so it never stretches or distorts */}
          <Image
            src={logoUrl}
            alt="HireLoop"
            priority
            className="h-8 w-auto object-contain"
          />
          <span className="pl-0.5 text-xs font-medium tracking-wide text-neutral-400 group-data-[collapsible=icon]:hidden">
            {consoleName}
          </span>
        </Link>
      </SidebarHeader>

      {/* Navigation Links */}
      <SidebarContent className="bg-[#0b0b0e]! px-3 py-2">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {navItems.map((item) => {
                const active = isActive(item.url)

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.title}
                      render={<Link href={item.url} />}
                      className={`relative flex h-10 items-center gap-3 rounded-lg px-3.5 text-sm font-medium transition-all ${
                        active
                          ? "bg-[#1c1d24]! text-white! shadow-sm"
                          : "bg-transparent! text-neutral-400! hover:bg-white/5! hover:text-white!"
                      }`}
                    >
                      {/* Left Blue/Indigo Active Bar */}
                      {active && (
                        <span className="absolute top-1.5 bottom-1.5 left-0 w-1 rounded-r-full bg-indigo-500" />
                      )}
                      <item.icon
                        className={`size-4 shrink-0 ${
                          active ? "text-indigo-400" : "text-neutral-400"
                        }`}
                      />
                      <span className="truncate">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Bottom Profile Card + Sign Out Button */}
      <SidebarFooter className="bg-[#0b0b0e]! p-3">
        <div className="flex items-center justify-between gap-2.5 rounded-xl border border-white/8 bg-[#16171d] p-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-tr from-indigo-600 to-sky-500 text-xs font-bold text-white shadow-sm">
              {userInitials}
            </div>

            <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate text-xs font-semibold text-white">
                {userName}
              </span>
              <span className="truncate text-[11px] text-neutral-400">
                {roleTitle}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            title="Sign Out"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-red-500/15 hover:text-red-400 group-data-[collapsible=icon]:hidden"
          >
            <LogOutIcon className="size-4" />
          </button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}