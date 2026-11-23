"use client"

import React, { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  ArrowLeftIcon,
  BanknoteIcon,
  BookmarkIcon,
  BriefcaseBusinessIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  SearchIcon,
  ZapIcon,
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
  compensation?: string
  salary?: string
  salaryMin?: string | number
  salaryMax?: string | number
  deadline?: string
  status?: string
  createdAt?: string
  companyLogo?: string
}

const JOB_TYPE_OPTIONS = ["Full-time", "Part-time", "Contract", "Freelance"]
const JOBS_PER_PAGE = 6
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

function extractMaxSalary(job: JobPost): number {
  if (job.salaryMax) return Number(job.salaryMax) || 0
  const raw = job.compensation || job.salary || ""
  const matches = raw.match(/\d[\d,]*/g)
  if (!matches || matches.length === 0) return 0
  const nums = matches.map((n) => Number(n.replace(/,/g, "")) || 0)
  return Math.max(...nums)
}

function formatCompensation(job: JobPost): string {
  if (job.compensation) return job.compensation
  if (job.salary) return job.salary
  if (job.salaryMin && job.salaryMax) {
    return `$${job.salaryMin} - $${job.salaryMax}`
  }
  return "Negotiable"
}

function JobsPageContent() {
  const searchParams = useSearchParams()

  const [jobs, setJobs] = useState<JobPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "")
  const [appliedSearch, setAppliedSearch] = useState(
    searchParams.get("q") || ""
  )
  const [locationParam, setLocationParam] = useState(
    searchParams.get("location") || ""
  )

  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "salary">("recent")
  const [currentPage, setCurrentPage] = useState(1)
  const [savedIds, setSavedIds] = useState<string[]>([])

  // URL প্যারামিটার চেঞ্জ হলে সিঙ্ক করবে
  useEffect(() => {
    const q = searchParams.get("q") || ""
    const loc = searchParams.get("location") || ""
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchInput(q)
    setAppliedSearch(q)
    setLocationParam(loc)
    setCurrentPage(1)
  }, [searchParams])

  // বুকমার্ক করা জব লোড
  useEffect(() => {
    try {
      const stored = localStorage.getItem("hireloop_saved_jobs")
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setSavedIds(JSON.parse(stored))
    } catch {
      // ignore storage errors
    }
  }, [])

  // ব্যাকএন্ড থেকে রিয়েল জব ফেচ
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`${API_BASE}/jobs`)
        if (!res.ok) throw new Error("Failed to fetch jobs from server")
        const data = await res.json()
        setJobs(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
        setError(
          "Could not load jobs from the backend. Please make sure your server is running."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  // প্রতিটি Job Type-এর ডাইনামিক কাউন্ট
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    JOB_TYPE_OPTIONS.forEach((opt) => {
      counts[opt] = jobs.filter((job) => {
        const jobType = (job.type || job.jobType || "").toLowerCase()
        return jobType === opt.toLowerCase()
      }).length
    })
    return counts
  }, [jobs])

  // ফিল্টার ও সর্ট করা জব লিস্ট
  const filteredJobs = useMemo(() => {
    const q = appliedSearch.trim().toLowerCase()
    const loc = locationParam.trim().toLowerCase()

    const filtered = jobs.filter((job) => {
      const title = (job.title || job.jobTitle || "").toLowerCase()
      const company = (job.company || job.companyName || "").toLowerCase()
      const dept = (job.department || "").toLowerCase()
      const location = (job.location || "").toLowerCase()
      const type = (job.type || job.jobType || "").toLowerCase()

      const matchesSearch =
        !q ||
        title.includes(q) ||
        company.includes(q) ||
        dept.includes(q) ||
        location.includes(q)

      const matchesLocation = !loc || location.includes(loc)

      const matchesType =
        selectedTypes.length === 0 ||
        selectedTypes.some((t) => t.toLowerCase() === type)

      return matchesSearch && matchesLocation && matchesType
    })

    return [...filtered].sort((a, b) => {
      if (sortBy === "salary") {
        return extractMaxSalary(b) - extractMaxSalary(a)
      }
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      if (sortBy === "oldest") return dateA - dateB
      return dateB - dateA
    })
  }, [jobs, appliedSearch, locationParam, selectedTypes, sortBy])

  // পেজিনেশন হিসাব
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / JOBS_PER_PAGE))
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * JOBS_PER_PAGE,
    currentPage * JOBS_PER_PAGE
  )

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setAppliedSearch(searchInput)
    setCurrentPage(1)
  }

  const toggleJobType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type]
    )
    setCurrentPage(1)
  }

  const toggleBookmark = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    setSavedIds((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
      try {
        localStorage.setItem("hireloop_saved_jobs", JSON.stringify(updated))
      } catch {
        // ignore storage errors
      }
      return updated
    })
  }

  return (
    <main className="min-h-screen bg-[#09090b] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Back to Home Button */}
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-neutral-400 transition hover:bg-white/5 hover:text-white"
        >
          <ArrowLeftIcon className="size-4" />
          Back to Home
        </Link>

        {/* Top Search Bar Card */}
        <form
          onSubmit={handleSearchSubmit}
          className="mb-8 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#111216] p-3 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                if (e.target.value === "") {
                  setAppliedSearch("")
                  setCurrentPage(1)
                }
              }}
              placeholder="Search by job title, keywords..."
              className="h-11 w-full rounded-xl border border-white/5 bg-[#18191f] pr-4 pl-11 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-white/20"
            />
          </div>

          <button
            type="submit"
            className="h-11 shrink-0 rounded-xl bg-white px-6 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
          >
            Search Jobs
          </button>
        </form>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Left Sidebar: Filters */}
          <aside className="rounded-2xl border border-white/10 bg-[#111216] p-5 lg:col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Filters</h2>
              {selectedTypes.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTypes([])
                    setCurrentPage(1)
                  }}
                  className="text-xs text-neutral-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="mt-5">
              <h3 className="mb-3 text-xs font-semibold text-neutral-300">
                Job Type
              </h3>

              <div className="space-y-3">
                {JOB_TYPE_OPTIONS.map((type) => {
                  const checked = selectedTypes.includes(type)
                  return (
                    <label
                      key={type}
                      onClick={() => toggleJobType(type)}
                      className="flex cursor-pointer items-center justify-between text-sm select-none"
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`flex size-4 items-center justify-center rounded border transition ${
                            checked
                              ? "border-white bg-white text-black"
                              : "border-white/20 bg-[#18191f]"
                          }`}
                        >
                          {checked && (
                            <CheckIcon className="size-3 stroke-[3]" />
                          )}
                        </span>
                        <span
                          className={
                            checked
                              ? "font-medium text-white"
                              : "text-neutral-400"
                          }
                        >
                          {type}
                        </span>
                      </span>

                      <span className="text-xs text-neutral-500">
                        {typeCounts[type] ?? 0}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          </aside>

          {/* Right Main Area: Results + Cards + Pagination */}
          <section className="lg:col-span-9">
            {/* Results Header & Sort */}
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <h1 className="text-base font-semibold text-white sm:text-lg">
                Found {filteredJobs.length} Professional{" "}
                {filteredJobs.length === 1 ? "Job" : "Jobs"}
              </h1>

              <div className="flex items-center gap-2.5 text-xs text-neutral-400">
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as "recent" | "oldest" | "salary")
                    setCurrentPage(1)
                  }}
                  aria-label="Sort jobs"
                  className="h-9 rounded-lg border border-white/10 bg-[#111216] px-3 text-xs font-medium text-neutral-200 outline-none focus:border-white/25"
                >
                  <option value="recent">Most Recent</option>
                  <option value="salary">Salary: High to Low</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            {/* Job Cards List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-32 animate-pulse rounded-2xl border border-white/10 bg-[#111216]"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center text-sm text-red-300">
                {error}
              </div>
            ) : paginatedJobs.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#111216] p-12 text-center">
                <BriefcaseBusinessIcon className="mx-auto size-10 text-neutral-600" />
                <p className="mt-4 text-base font-semibold text-white">
                  No jobs found
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  Try another keyword or remove active filters.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedJobs.map((job) => {
                  const title = job.title || job.jobTitle || "Untitled Position"
                  const company =
                    job.company || job.companyName || "HireLoop Partner"
                  const location = job.location || "Remote"
                  const type = job.type || job.jobType || "Full-time"
                  const isSaved = savedIds.includes(job._id)
                  const isActive =
                    !job.status || job.status.toLowerCase() === "active"

                  return (
                    <Link
                      key={job._id}
                      href={`/jobs/${job._id}`}
                      className="group relative flex items-start gap-4 rounded-2xl border border-white/10 bg-[#111216] p-5 transition-colors hover:border-white/20 hover:bg-[#15161c]"
                    >
                      {/* Square Company Icon Box */}
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#181920] text-neutral-300 sm:size-13">
                        <BriefcaseBusinessIcon className="size-5 text-neutral-300" />
                      </div>

                      {/* Job Details */}
                      <div className="min-w-0 flex-1 pr-8">
                        <h2 className="truncate text-base font-semibold text-white transition-colors group-hover:text-neutral-200 sm:text-lg">
                          {title}
                        </h2>
                        <p className="mt-0.5 truncate text-xs text-neutral-400 sm:text-sm">
                          {company} • {location}
                        </p>

                        {/* Metadata Pills */}
                        <div className="mt-3.5 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-[#181920] px-2.5 py-1 text-xs font-medium text-neutral-300">
                            <BanknoteIcon className="size-3.5 text-neutral-400" />
                            {formatCompensation(job)}
                          </span>

                          <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-[#181920] px-2.5 py-1 text-xs font-medium text-neutral-300">
                            <ClockIcon className="size-3.5 text-neutral-400" />
                            {type}
                          </span>

                          {isActive && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                              <ZapIcon className="size-3" />
                              Easy Apply
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bookmark Icon */}
                      <button
                        type="button"
                        onClick={(e) => toggleBookmark(e, job._id)}
                        aria-label={isSaved ? "Remove bookmark" : "Save job"}
                        className={`absolute top-5 right-5 flex size-8 items-center justify-center rounded-lg transition ${
                          isSaved
                            ? "text-white"
                            : "text-neutral-500 hover:bg-white/5 hover:text-neutral-300"
                        }`}
                      >
                        <BookmarkIcon
                          className={`size-4 ${isSaved ? "fill-white" : ""}`}
                        />
                      </button>
                    </Link>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {!loading && filteredJobs.length > 0 && (
              <div className="mt-8 flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                  className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-[#111216] text-neutral-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeftIcon className="size-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`flex size-8 items-center justify-center rounded-lg text-xs font-semibold transition ${
                        currentPage === page
                          ? "bg-white text-neutral-950"
                          : "border border-white/10 bg-[#111216] text-neutral-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  aria-label="Next page"
                  className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-[#111216] text-neutral-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRightIcon className="size-4" />
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-sm text-neutral-400">
          Loading jobs...
        </div>
      }
    >
      <JobsPageContent />
    </Suspense>
  )
}