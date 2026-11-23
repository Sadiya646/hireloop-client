"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowUpRightIcon,
  BriefcaseBusinessIcon,
  CalendarCheckIcon,
  CheckCircle2Icon,
  MapPinIcon,
  PlusIcon,
  UsersIcon,
} from "lucide-react"

import { userSession } from "@/lib/auth-client"

interface JobPost {
  _id: string
  title: string
  department?: string
  company?: string
  location?: string
  type?: string
  applicantsCount?: number
  status?: string
  deadline?: string
}

interface RecentApplicant {
  id: string
  name: string
  role: string
  appliedAt: string
  status: "Pending" | "Shortlisted" | "Interview"
}

const MOCK_JOBS: JobPost[] = [
  {
    _id: "1",
    title: "Frontend Developer",
    department: "Engineering & Tech",
    location: "New York, USA",
    type: "Full-time",
    applicantsCount: 34,
    status: "Active",
    deadline: "2026-05-30",
  },
  {
    _id: "2",
    title: "Senior Product Designer",
    department: "Product & Design",
    location: "London, UK",
    type: "Full-time",
    applicantsCount: 19,
    status: "Active",
    deadline: "2026-06-14",
  },
  {
    _id: "3",
    title: "DevOps Specialist",
    department: "Engineering & Tech",
    location: "Berlin, Germany",
    type: "Contract",
    applicantsCount: 12,
    status: "Active",
    deadline: "2026-06-30",
  },
]

const MOCK_APPLICANTS: RecentApplicant[] = [
  {
    id: "a1",
    name: "Nadia Rahman",
    role: "Frontend Developer",
    appliedAt: "2 hours ago",
    status: "Shortlisted",
  },
  {
    id: "a2",
    name: "Tanvir Ahmed",
    role: "Senior Product Designer",
    appliedAt: "5 hours ago",
    status: "Pending",
  },
  {
    id: "a3",
    name: "Sadia Islam",
    role: "DevOps Specialist",
    appliedAt: "1 day ago",
    status: "Interview",
  },
  {
    id: "a4",
    name: "Farhan Kabir",
    role: "Frontend Developer",
    appliedAt: "2 days ago",
    status: "Pending",
  },
]

const applicantStatusStyle: Record<RecentApplicant["status"], string> = {
  Pending: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  Shortlisted: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  Interview: "border-indigo-500/20 bg-indigo-500/10 text-indigo-400",
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function RecruiterDashboard() {
  const { data: session } = userSession()
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [loading, setLoading] = useState(true)

  const recruiterName = session?.user?.name || "Recruiter"

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE}/jobs`)
        if (!res.ok) throw new Error("Failed to fetch jobs")
        const data = await res.json()
        setJobs(Array.isArray(data) && data.length > 0 ? data : MOCK_JOBS)
      } catch {
        setJobs(MOCK_JOBS)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const activeJobsCount = jobs.filter(
    (j) => !j.status || j.status.toLowerCase() === "active"
  ).length

  const totalApplicants = jobs.reduce(
    (sum, job) => sum + (job.applicantsCount || 0),
    0
  )

  const stats = [
    {
      label: "Active Job Posts",
      value: activeJobsCount,
      change: "+2 this month",
      icon: BriefcaseBusinessIcon,
      iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    },
    {
      label: "Total Applicants",
      value: totalApplicants || 65,
      change: "+14% vs last week",
      icon: UsersIcon,
      iconBg: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    },
    {
      label: "Shortlisted",
      value: 18,
      change: "Ready for review",
      icon: CheckCircle2Icon,
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      label: "Interviews Scheduled",
      value: 7,
      change: "3 upcoming today",
      icon: CalendarCheckIcon,
      iconBg: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    },
  ]

  return (
    <div className="min-h-screen bg-[#0f1014] p-6 text-white sm:p-8">
      {/* Breadcrumb */}
      <div className="mb-2 flex items-center gap-2 text-xs font-medium">
        <span className="text-neutral-400">Recruiter</span>
        <span className="text-neutral-600"></span>
        <span className="text-indigo-400">Dashboard Overview</span>
      </div>

      {/* Header Row */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Welcome back, {recruiterName.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Monitor your active job listings, track candidate pipelines, and
            manage hiring progress.
          </p>
        </div>

        <Link
          href="/dashboard/recruiter/jobs/post-job"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-violet-500"
        >
          <PlusIcon className="size-4" />
          New Job Post
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
              <span className="text-xs text-neutral-400">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Job Postings (2/3 width) */}
        <div className="rounded-2xl border border-white/10 bg-[#14151b] p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Recent Job Postings
              </h2>
              <p className="text-xs text-neutral-400">
                Your latest live roles and candidate counts
              </p>
            </div>
            <Link
              href="/dashboard/recruiter/jobs"
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300"
            >
              Manage All
              <ArrowUpRightIcon className="size-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-white/5">
            {loading ? (
              <p className="py-8 text-center text-sm text-neutral-400">
                Loading job postings...
              </p>
            ) : (
              jobs.slice(0, 5).map((job) => (
                <div
                  key={job._id}
                  className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                      <BriefcaseBusinessIcon className="size-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{job.title}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                        <span>{job.department || "General"}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPinIcon className="size-3 text-neutral-500" />
                          {job.location || "Remote"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-300">
                      <UsersIcon className="size-3.5" />
                      {job.applicantsCount ?? 0} Candidates
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                      <span className="size-1.5 rounded-full bg-emerald-400" />
                      {job.status || "Active"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Applicants (1/3 width) */}
        <div className="rounded-2xl border border-white/10 bg-[#14151b] p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Recent Applicants
              </h2>
              <p className="text-xs text-neutral-400">
                Latest candidate submissions
              </p>
            </div>
            <Link
              href="/dashboard/recruiter/jobs/applicants"
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300"
            >
              View All
              <ArrowUpRightIcon className="size-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {MOCK_APPLICANTS.map((applicant) => {
              const initials = applicant.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()

              return (
                <div
                  key={applicant.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#191a22] p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-sky-500 text-xs font-bold text-white">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        {applicant.name}
                      </p>
                      <p className="truncate text-xs text-neutral-400">
                        {applicant.role} • {applicant.appliedAt}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                      applicantStatusStyle[applicant.status]
                    }`}
                  >
                    {applicant.status}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}