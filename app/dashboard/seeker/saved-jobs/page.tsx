"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowRightIcon,
  BanknoteIcon,
  BookmarkIcon,
  BriefcaseBusinessIcon,
  ClockIcon,
  MapPinIcon,
  SearchIcon,
  Trash2Icon,
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

export default function SeekerSavedJobsPage() {
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [allJobs, setAllJobs] = useState<JobPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // localStorage থেকে বুকমার্ক করা জব আইডি লোড
  useEffect(() => {
    try {
      const stored = localStorage.getItem("hireloop_saved_jobs")
      if (stored) {
        const parsed = JSON.parse(stored)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSavedIds(Array.isArray(parsed) ? parsed : [])
      }
    } catch {
      setSavedIds([])
    }
  }, [])

  // ব্যাকএন্ড থেকে জব ডেটা ফেচ
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`${API_BASE}/jobs`)
        if (!res.ok) throw new Error("Failed to fetch jobs")
        const data = await res.json()
        setAllJobs(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
        setError(
          "Could not load saved jobs. Make sure your backend server is running."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  // শুধু বুকমার্ক করা জবগুলো ফিল্টার
  const savedJobs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return allJobs.filter((job) => {
      if (!savedIds.includes(job._id)) return false
      if (!q) return true

      const title = (job.title || job.jobTitle || "").toLowerCase()
      const company = (job.company || job.companyName || "").toLowerCase()
      const location = (job.location || "").toLowerCase()
      return title.includes(q) || company.includes(q) || location.includes(q)
    })
  }, [allJobs, savedIds, searchQuery])

  const handleRemoveBookmark = (id: string) => {
    const updated = savedIds.filter((item) => item !== id)
    setSavedIds(updated)
    try {
      localStorage.setItem("hireloop_saved_jobs", JSON.stringify(updated))
    } catch {
      // ignore
    }
  }

  const handleClearAll = () => {
    if (!window.confirm("Remove all saved jobs?")) return
    setSavedIds([])
    try {
      localStorage.setItem("hireloop_saved_jobs", JSON.stringify([]))
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1014] p-6 text-white sm:p-8">
      {/* Breadcrumb */}
      <div className="mb-2 flex items-center gap-2 text-xs font-medium">
        <span className="text-neutral-400">Candidate</span>
        <span className="text-neutral-600"></span>
        <span className="text-indigo-400">Saved Jobs</span>
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Saved Jobs
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Review jobs you bookmarked and apply whenever you're ready.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedJobs.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 text-xs font-semibold text-red-400 transition hover:bg-red-500/20"
            >
              <Trash2Icon className="size-3.5" />
              Clear All
            </button>
          )}

          <Link
            href="/jobs"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-violet-500"
          >
            <BriefcaseBusinessIcon className="size-4" />
            Browse Jobs
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-xs font-medium text-neutral-400">
          Showing{" "}
          <span className="font-semibold text-white">{savedJobs.length}</span>{" "}
          saved {savedJobs.length === 1 ? "job" : "jobs"}
        </p>

        <div className="relative w-full sm:w-72">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved jobs..."
            className="h-9 w-full rounded-xl border border-white/10 bg-[#14151b] pr-3.5 pl-10 text-xs text-white outline-none placeholder:text-neutral-500 focus:border-indigo-500/50"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-44 animate-pulse rounded-2xl border border-white/10 bg-[#14151b]"
            />
          ))}
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#14151b] p-12 text-center">
          <BookmarkIcon className="mx-auto size-10 text-neutral-600" />
          <h2 className="mt-4 text-base font-semibold text-white">
            No saved jobs yet
          </h2>
          <p className="mt-1 text-xs text-neutral-400">
            Click the bookmark icon on any job listing to save it here for
            later.
          </p>
          <Link
            href="/jobs"
            className="mt-5 inline-flex h-9 items-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-neutral-950 transition hover:bg-neutral-200"
          >
            Explore Jobs
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {savedJobs.map((job) => {
            const title = job.title || job.jobTitle || "Untitled Position"
            const company = job.company || job.companyName || "HireLoop Partner"
            const location = job.location || "Remote"
            const type = job.type || job.jobType || "Full-time"

            return (
              <div
                key={job._id}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#14151b] p-5 transition hover:border-white/20"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                        <BriefcaseBusinessIcon className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-white">
                          {title}
                        </h3>
                        <p className="truncate text-xs text-neutral-400">
                          {company}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveBookmark(job._id)}
                      title="Remove from saved"
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-indigo-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                    >
                      <BookmarkIcon className="size-4 fill-current" />
                    </button>
                  </div>

                  {/* Metadata */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-neutral-300">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-[#191a22] px-2.5 py-1">
                      <MapPinIcon className="size-3.5 text-neutral-400" />
                      {location}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-[#191a22] px-2.5 py-1">
                      <ClockIcon className="size-3.5 text-neutral-400" />
                      {type}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-[#191a22] px-2.5 py-1">
                      <BanknoteIcon className="size-3.5 text-neutral-400" />
                      {formatCompensation(job)}
                    </span>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-5 flex items-center justify-end border-t border-white/10 pt-4">
                  <Link
                    href={`/jobs/${job._id}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white px-4 text-xs font-semibold text-neutral-950 transition hover:bg-neutral-200"
                  >
                    View & Apply
                    <ArrowRightIcon className="size-3.5" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}