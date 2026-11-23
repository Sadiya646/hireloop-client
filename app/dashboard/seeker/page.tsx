"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowUpRightIcon,
  BriefcaseBusinessIcon,
  CalendarCheckIcon,
  CheckCircle2Icon,
  ClockIcon,
  FileTextIcon,
  MapPinIcon,
} from "lucide-react"

import { userSession } from "@/lib/auth-client"

type ApplicationStatus = "Pending" | "Shortlisted" | "Interview" | "Rejected"

interface Application {
  _id: string
  jobId: string
  jobTitle: string
  company: string
  location?: string
  appliedDate: string
  status: ApplicationStatus
}

interface JobPost {
  _id: string
  title: string
  company?: string
  location?: string
  type?: string
  compensation?: string
}

const statusStyles: Record<ApplicationStatus, string> = {
  Pending: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  Shortlisted: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  Interview: "border-indigo-500/20 bg-indigo-500/10 text-indigo-400",
  Rejected: "border-red-500/20 bg-red-500/10 text-red-400",
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function SeekerDashboard() {
  const { data: session } = userSession()
  const [applications, setApplications] = useState<Application[]>([])
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [loading, setLoading] = useState(true)

  const seekerName = session?.user?.name || "Candidate"

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const email = session?.user?.email
        const appUrl = email
          ? `${API_BASE}/applications?email=${encodeURIComponent(email)}`
          : `${API_BASE}/applications`

        const [appRes, jobRes] = await Promise.allSettled([
          fetch(appUrl),
          fetch(`${API_BASE}/jobs`),
        ])

        if (appRes.status === "fulfilled" && appRes.value.ok) {
          const appData = await appRes.value.json()
          if (Array.isArray(appData)) setApplications(appData)
        }

        if (jobRes.status === "fulfilled" && jobRes.value.ok) {
          const jobData = await jobRes.value.json()
          if (Array.isArray(jobData)) setJobs(jobData)
        }
      } catch (error) {
        console.error("Failed to load seeker dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [session?.user?.email])

  const totalApplied = applications.length
  const pendingCount = applications.filter((a) => a.status === "Pending").length
  const shortlistedCount = applications.filter(
    (a) => a.status === "Shortlisted"
  ).length
  const interviewCount = applications.filter(
    (a) => a.status === "Interview"
  ).length

  const stats = [
    {
      label: "Total Applications",
      value: totalApplied,
      sub: "All submitted roles",
      icon: FileTextIcon,
      iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    },
    {
      label: "Pending Review",
      value: pendingCount,
      sub: "Awaiting response",
      icon: ClockIcon,
      iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    {
      label: "Shortlisted",
      value: shortlistedCount,
      sub: "Moved forward",
      icon: CheckCircle2Icon,
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      label: "Interviews",
      value: interviewCount,
      sub: "Scheduled stages",
      icon: CalendarCheckIcon,
      iconBg: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    },
  ]

  return (
    <div className="min-h-screen bg-[#0f1014] p-6 text-white sm:p-8">
      {/* Breadcrumb */}
      <div className="mb-2 flex items-center gap-2 text-xs font-medium">
        <span className="text-neutral-400">Candidate</span>
        <span className="text-neutral-600"></span>
        <span className="text-indigo-400">Dashboard Overview</span>
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Welcome back, {seekerName.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Track your job applications, interview updates, and explore new
            opportunities.
          </p>
        </div>

        <Link
          href="/jobs"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-violet-500"
        >
          <BriefcaseBusinessIcon className="size-4" />
          Browse Jobs
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/10 bg-[#14151b] p-5 transition-colors hover:border-white/15"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-400">
                {stat.label}
              </span>
              <div
                className={`flex size-9 items-center justify-center rounded-xl border ${stat.iconBg}`}
              >
                <stat.icon className="size-4" />
              </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <p className="text-3xl font-bold tracking-tight text-white">
                {stat.value}
              </p>
              <span className="text-xs text-neutral-400">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Applications (2/3 width) */}
        <div className="rounded-2xl border border-white/10 bg-[#14151b] p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Recent Applications
              </h2>
              <p className="text-xs text-neutral-400">
                Status of your latest submitted job applications
              </p>
            </div>
            <Link
              href="/dashboard/seeker/applications"
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300"
            >
              View All
              <ArrowUpRightIcon className="size-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-white/5">
            {loading ? (
              <p className="py-10 text-center text-sm text-neutral-400">
                Loading your applications...
              </p>
            ) : applications.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-neutral-400">
                  You haven't applied to any jobs yet.
                </p>
                <Link
                  href="/jobs"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Explore open positions
                  <ArrowUpRightIcon className="size-3.5" />
                </Link>
              </div>
            ) : (
              applications.slice(0, 5).map((app) => (
                <div
                  key={app._id}
                  className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                      <BriefcaseBusinessIcon className="size-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{app.jobTitle}</p>
                      <p className="mt-0.5 text-xs text-neutral-400">
                        {app.company} • Applied {app.appliedDate}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${
                      statusStyles[app.status] || statusStyles.Pending
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Latest Open Jobs (1/3 width) */}
        <div className="rounded-2xl border border-white/10 bg-[#14151b] p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Latest Open Jobs
              </h2>
              <p className="text-xs text-neutral-400">
                Fresh roles posted on HireLoop
              </p>
            </div>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300"
            >
              See All
              <ArrowUpRightIcon className="size-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              <p className="py-8 text-center text-sm text-neutral-400">
                Loading jobs...
              </p>
            ) : jobs.length === 0 ? (
              <p className="py-8 text-center text-sm text-neutral-400">
                No jobs available right now.
              </p>
            ) : (
              jobs.slice(0, 4).map((job) => (
                <Link
                  key={job._id}
                  href={`/jobs/${job._id}`}
                  className="block rounded-xl border border-white/5 bg-[#191a22] p-3.5 transition hover:border-indigo-500/30 hover:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-white">{job.title}</p>
                    {job.type && (
                      <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-neutral-300">
                        {job.type}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-neutral-400">
                    {job.company || "HireLoop Partner"}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400">
                    <span className="inline-flex items-center gap-1">
                      <MapPinIcon className="size-3 text-neutral-500" />
                      {job.location || "Remote"}
                    </span>
                    {job.compensation && (
                      <span className="font-medium text-indigo-300">
                        {job.compensation}
                      </span>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}