"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BanknoteIcon,
  BriefcaseBusinessIcon,
  Building2Icon,
  CheckCircle2Icon,
  ClockIcon,
  GlobeIcon,
  MapPinIcon,
  UsersIcon,
} from "lucide-react"

interface JobPost {
  _id: string
  title?: string
  jobTitle?: string
  company?: string
  companyName?: string
  location?: string
  type?: string
  jobType?: string
  department?: string
  industry?: string
  companySize?: string
  companyWebsite?: string
  compensation?: string
  salary?: string
  salaryMin?: string | number
  salaryMax?: string | number
  deadline?: string
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

function formatCompensation(job: JobPost): string {
  if (job.compensation) return job.compensation
  if (job.salary) return job.salary
  if (job.salaryMin && job.salaryMax) {
    return `$${job.salaryMin} - $${job.salaryMax}`
  }
  return "Negotiable"
}

export default function CompanyDetailsPage() {
  const params = useParams()
  const rawName = params?.name as string
  const companyName = rawName ? decodeURIComponent(rawName) : ""

  const [companyJobs, setCompanyJobs] = useState<JobPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!companyName) return

    const fetchCompanyJobs = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`${API_BASE}/jobs`)
        if (!res.ok) throw new Error("Failed to fetch company details")
        const data: JobPost[] = await res.json()

        const matched = Array.isArray(data)
          ? data.filter((job) => {
              const name = (
                job.company ||
                job.companyName ||
                "HireLoop Partner"
              ).trim()
              return name.toLowerCase() === companyName.toLowerCase()
            })
          : []

        setCompanyJobs(matched)
      } catch (err) {
        console.error(err)
        setError("Could not load company details from the server.")
      } finally {
        setLoading(false)
      }
    }

    fetchCompanyJobs()
  }, [companyName])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#09090b] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="h-32 animate-pulse rounded-2xl border border-white/10 bg-[#111216]" />
          <div className="h-64 animate-pulse rounded-2xl border border-white/10 bg-[#111216]" />
        </div>
      </main>
    )
  }

  if (error || companyJobs.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] px-4 text-center text-white">
        <Building2Icon className="size-12 text-neutral-600" />
        <h1 className="mt-4 text-xl font-semibold">Company Not Found</h1>
        <p className="mt-2 text-sm text-neutral-400">
          {error || "No active details or jobs found for this company."}
        </p>
        <Link
          href="/company"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
        >
          <ArrowLeftIcon className="size-4" />
          Back to Companies
        </Link>
      </main>
    )
  }

  const firstJob = companyJobs[0]
  const industry =
    firstJob.industry || firstJob.department || "Technology & SaaS"
  const companySize = firstJob.companySize || "50 - 250 Employees"
  const website = firstJob.companyWebsite
  const locations = Array.from(
    new Set(companyJobs.map((j) => j.location || "Remote"))
  )

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Back Button */}
        <Link
          href="/company"
          className="mb-4 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-neutral-400 transition hover:bg-white/5 hover:text-white"
        >
          <ArrowLeftIcon className="size-4" />
          Back to Companies
        </Link>

        {/* Company Header Card */}
        <div className="mb-6 flex flex-col justify-between gap-5 rounded-2xl border border-white/10 bg-[#111216] p-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex size-15 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#181920] text-white">
              <Building2Icon className="size-7 text-neutral-200" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {companyName}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-neutral-400 sm:text-sm">
                <span>{industry}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <CheckCircle2Icon className="size-3.5" />
                  Verified Employer
                </span>
              </div>
            </div>
          </div>

          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
            >
              <GlobeIcon className="size-4" />
              Visit Website
            </a>
          )}
        </div>

        {/* Company Overview Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#111216] p-5">
            <UsersIcon className="size-4 text-neutral-400" />
            <p className="mt-3 text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
              Company Size
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {companySize}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111216] p-5">
            <MapPinIcon className="size-4 text-neutral-400" />
            <p className="mt-3 text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
              Locations
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {locations.join(", ")}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#111216] p-5">
            <BriefcaseBusinessIcon className="size-4 text-neutral-400" />
            <p className="mt-3 text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
              Open Positions
            </p>
            <p className="mt-1 text-sm font-semibold text-emerald-400">
              {companyJobs.length}{" "}
              {companyJobs.length === 1 ? "Active Role" : "Active Roles"}
            </p>
          </div>
        </div>

        {/* About Company */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-[#111216] p-6">
          <h2 className="text-lg font-semibold text-white">
            About {companyName}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">
            {companyName} is a verified employer in the {industry} sector,
            currently hiring across {locations.join(", ")}. Explore their open
            positions below and click any role to view full requirements and
            apply directly.
          </p>
        </div>

        {/* Open Positions at this Company */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">
            Open Positions at {companyName} ({companyJobs.length})
          </h2>

          <div className="space-y-3">
            {companyJobs.map((job) => {
              const title = job.title || job.jobTitle || "Untitled Position"
              const type = job.type || job.jobType || "Full-time"
              const location = job.location || "Remote"

              return (
                <Link
                  key={job._id}
                  href={`/jobs/${job._id}`}
                  className="group flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-[#111216] p-5 transition hover:border-white/25 hover:bg-[#15161c] sm:flex-row sm:items-center"
                >
                  <div>
                    <h3 className="text-base font-semibold text-white group-hover:text-neutral-200">
                      {title}
                    </h3>
                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-neutral-300">
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-[#181920] px-2.5 py-1">
                        <MapPinIcon className="size-3.5 text-neutral-400" />
                        {location}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-[#181920] px-2.5 py-1">
                        <ClockIcon className="size-3.5 text-neutral-400" />
                        {type}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-[#181920] px-2.5 py-1">
                        <BanknoteIcon className="size-3.5 text-neutral-400" />
                        {formatCompensation(job)}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-white px-4 text-xs font-semibold text-neutral-950 transition group-hover:bg-neutral-200">
                    View Job
                    <ArrowRightIcon className="size-3.5" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}