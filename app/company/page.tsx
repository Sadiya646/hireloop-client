"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BriefcaseBusinessIcon,
  Building2Icon,
  CheckCircle2Icon,
  MapPinIcon,
  PlusIcon,
  SearchIcon,
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
  status?: string
}

interface CompanySummary {
  name: string
  industry: string
  locations: string[]
  openJobsCount: number
  jobTypes: string[]
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export default function CompanyPage() {
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIndustry, setSelectedIndustry] = useState("All")

  // ব্যাকএন্ড থেকে সব জব ফেচ করে কোম্পানি অনুযায়ী গ্রুপ করা হবে
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`${API_BASE}/jobs`)
        if (!res.ok) throw new Error("Failed to load companies")
        const data = await res.json()
        setJobs(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
        setError(
          "Could not load companies from the server. Make sure your backend is running."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  // জব ডেটা থেকে ইউনিক কোম্পানি লিস্ট তৈরি
  const companies = useMemo<CompanySummary[]>(() => {
    const map = new Map<string, CompanySummary>()

    jobs.forEach((job) => {
      const name = (job.company || job.companyName || "HireLoop Partner").trim()
      const key = name.toLowerCase()
      const industry = job.industry || job.department || "Technology & SaaS"
      const location = job.location || "Remote"
      const jobType = job.type || job.jobType || "Full-time"

      const existing = map.get(key)
      if (existing) {
        existing.openJobsCount += 1
        if (!existing.locations.includes(location)) {
          existing.locations.push(location)
        }
        if (!existing.jobTypes.includes(jobType)) {
          existing.jobTypes.push(jobType)
        }
      } else {
        map.set(key, {
          name,
          industry,
          locations: [location],
          openJobsCount: 1,
          jobTypes: [jobType],
        })
      }
    })

    return Array.from(map.values()).sort(
      (a, b) => b.openJobsCount - a.openJobsCount
    )
  }, [jobs])

  // ফিল্টারের জন্য ডাইনামিক ইন্ডাস্ট্রি লিস্ট
  const industries = useMemo(() => {
    const unique = new Set<string>(["All"])
    companies.forEach((c) => unique.add(c.industry))
    return Array.from(unique)
  }, [companies])

  // সার্চ ও ইন্ডাস্ট্রি ফিল্টার
  const filteredCompanies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return companies.filter((company) => {
      const matchesIndustry =
        selectedIndustry === "All" || company.industry === selectedIndustry
      const matchesSearch =
        !q ||
        company.name.toLowerCase().includes(q) ||
        company.industry.toLowerCase().includes(q) ||
        company.locations.some((loc) => loc.toLowerCase().includes(q))
      return matchesIndustry && matchesSearch
    })
  }, [companies, searchQuery, selectedIndustry])

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Back to Home */}
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-neutral-400 transition hover:bg-white/5 hover:text-white"
        >
          <ArrowLeftIcon className="size-4" />
          Back to Home
        </Link>

        {/* Page Header & Stats */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Top Hiring Companies
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              Discover verified employers actively hiring on HireLoop and
              explore their open roles.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-[#111216] px-4 py-2 text-xs text-neutral-400">
              Companies:{" "}
              <span className="font-semibold text-white">
                {companies.length}
              </span>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111216] px-4 py-2 text-xs text-neutral-400">
              Open Roles:{" "}
              <span className="font-semibold text-white">{jobs.length}</span>
            </div>
          </div>
        </div>

        {/* Search & Industry Filter Card */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-[#111216] p-4">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company name, industry, or location..."
              className="h-11 w-full rounded-xl border border-white/5 bg-[#18191f] pr-4 pl-11 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-white/20"
            />
          </div>

          {/* Industry Filter Pills */}
          {industries.length > 1 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
              {industries.map((ind) => (
                <button
                  key={ind}
                  type="button"
                  onClick={() => setSelectedIndustry(ind)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
                    selectedIndustry === ind
                      ? "bg-white text-neutral-950"
                      : "bg-[#18191f] text-neutral-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Companies Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-52 animate-pulse rounded-2xl border border-white/10 bg-[#111216]"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center text-sm text-red-300">
            {error}
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#111216] p-12 text-center">
            <Building2Icon className="mx-auto size-10 text-neutral-600" />
            <h2 className="mt-4 text-base font-semibold text-white">
              No companies found
            </h2>
            <p className="mt-1 text-xs text-neutral-400">
              Try adjusting your search or selecting a different industry.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCompanies.map((company) => (
              <div
                key={company.name}
                className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#111216] p-6 transition-colors hover:border-white/20 hover:bg-[#15161c]"
              >
                <div>
                  {/* Top Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#181920] text-neutral-200">
                      <Building2Icon className="size-5" />
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
                      <BriefcaseBusinessIcon className="size-3" />
                      {company.openJobsCount}{" "}
                      {company.openJobsCount === 1 ? "Open Job" : "Open Jobs"}
                    </span>
                  </div>

                  {/* Company Name & Verified */}
                  <div className="mt-4">
                    <h2 className="truncate text-lg font-semibold text-white">
                      {company.name}
                    </h2>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-400">
                      <CheckCircle2Icon className="size-3.5" />
                      Verified Employer
                    </p>
                  </div>

                  {/* Meta Info */}
                  <div className="mt-4 space-y-2 text-xs text-neutral-400">
                    <p className="truncate">{company.industry}</p>
                    <p className="flex items-center gap-1.5 truncate">
                      <MapPinIcon className="size-3.5 shrink-0 text-neutral-500" />
                      {company.locations.slice(0, 2).join(", ")}
                      {company.locations.length > 2 &&
                        ` +${company.locations.length - 2} more`}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-6 border-t border-white/10 pt-4">
                  <Link
                    href={`/jobs?q=${encodeURIComponent(company.name)}`}
                    className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#181920] text-xs font-semibold text-white transition hover:border-white/25 hover:bg-white hover:text-neutral-950"
                  >
                    View Open Positions
                    <ArrowRightIcon className="size-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Recruiter CTA Banner */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-[#111216] p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="text-lg font-semibold text-white sm:text-xl">
              Hiring for your team?
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              Post your open roles on HireLoop and connect with qualified
              candidates faster.
            </p>
          </div>

          <Link
            href="/dashboard/recruiter/jobs/post-job"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
          >
            <PlusIcon className="size-4" />
            Post a Job
          </Link>
        </div>
      </div>
    </main>
  )
}