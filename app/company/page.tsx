"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  BriefcaseBusinessIcon,
  Building2Icon,
  CheckCircle2Icon,
  MapPinIcon,
  SearchIcon,
} from "lucide-react"

interface JobPost {
  _id: string
  company?: string
  companyName?: string
  location?: string
  type?: string
  jobType?: string
  department?: string
  industry?: string
}

interface CompanySummary {
  name: string
  industry: string
  locations: string[]
  openJobsCount: number
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export default function CompanyPage() {
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

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

  // ব্যাকএন্ডের জব ডেটা থেকে ইউনিক কোম্পানি লিস্ট তৈরি
  const companies = useMemo<CompanySummary[]>(() => {
    const map = new Map<string, CompanySummary>()

    jobs.forEach((job) => {
      const name = (job.company || job.companyName || "HireLoop Partner").trim()
      const key = name.toLowerCase()
      const industry = job.industry || job.department || "Technology & SaaS"
      const location = job.location || "Remote"

      const existing = map.get(key)
      if (existing) {
        existing.openJobsCount += 1
        if (!existing.locations.includes(location)) {
          existing.locations.push(location)
        }
      } else {
        map.set(key, {
          name,
          industry,
          locations: [location],
          openJobsCount: 1,
        })
      }
    })

    return Array.from(map.values()).sort(
      (a, b) => b.openJobsCount - a.openJobsCount
    )
  }, [jobs])

  const filteredCompanies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return companies
    return companies.filter(
      (company) =>
        company.name.toLowerCase().includes(q) ||
        company.industry.toLowerCase().includes(q) ||
        company.locations.some((loc) => loc.toLowerCase().includes(q))
    )
  }, [companies, searchQuery])

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

        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Companies
            </h1>
            <p className="mt-1.5 text-sm text-neutral-400">
              Click on any company card to view details and open roles.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies..."
              className="h-10 w-full rounded-xl border border-white/10 bg-[#111216] pr-4 pl-10 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-white/25"
            />
          </div>
        </div>

        {/* Company Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-44 animate-pulse rounded-2xl border border-white/10 bg-[#111216]"
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
              Try searching with a different company name or location.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCompanies.map((company) => (
              <Link
                key={company.name}
                href={`/company/${encodeURIComponent(company.name)}`}
                className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#111216] p-6 transition-all hover:border-white/25 hover:bg-[#15161c]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#181920] text-neutral-200">
                      <Building2Icon className="size-5" />
                    </div>

                    <ArrowUpRightIcon className="size-4 text-neutral-500 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
                  </div>

                  <h2 className="mt-4 truncate text-lg font-semibold text-white">
                    {company.name}
                  </h2>

                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-400">
                    <CheckCircle2Icon className="size-3.5" />
                    Verified Employer
                  </p>

                  <p className="mt-3 truncate text-xs text-neutral-400">
                    {company.industry}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs">
                  <span className="flex items-center gap-1.5 truncate text-neutral-400">
                    <MapPinIcon className="size-3.5 shrink-0 text-neutral-500" />
                    <span className="truncate">{company.locations[0]}</span>
                  </span>

                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 font-medium text-emerald-400">
                    <BriefcaseBusinessIcon className="size-3" />
                    {company.openJobsCount}{" "}
                    {company.openJobsCount === 1 ? "Job" : "Jobs"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}