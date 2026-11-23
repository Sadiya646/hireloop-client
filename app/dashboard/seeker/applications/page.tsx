"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import {
  BriefcaseBusinessIcon,
  Building2Icon,
  CalendarIcon,
  ExternalLinkIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react"

import { userSession } from "@/lib/auth-client"

type ApplicationStatus = "Pending" | "Shortlisted" | "Interview" | "Rejected"

interface Application {
  _id: string
  jobId: string
  jobTitle: string
  department?: string
  company: string
  location?: string
  jobType?: string
  compensation?: string
  appliedDate: string
  status: ApplicationStatus
}

const statusStyles: Record<ApplicationStatus, { badge: string; dot: string }> =
  {
    Pending: {
      badge: "border-amber-500/20 bg-amber-500/10 text-amber-400",
      dot: "bg-amber-400",
    },
    Shortlisted: {
      badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
      dot: "bg-emerald-400",
    },
    Interview: {
      badge: "border-indigo-500/20 bg-indigo-500/10 text-indigo-400",
      dot: "bg-indigo-400",
    },
    Rejected: {
      badge: "border-red-500/20 bg-red-500/10 text-red-400",
      dot: "bg-red-400",
    },
  }

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export default function SeekerApplicationsPage() {
  const { data: session, isPending } = userSession()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (isPending) return

    const email = session?.user?.email
    if (!email) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setApplications([])
      setLoading(false)
      return
    }

    const fetchApplications = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(
          `${API_BASE}/applications?email=${encodeURIComponent(email)}`
        )
        if (!res.ok) throw new Error("Failed to fetch applications")

        const data = await res.json()
        setApplications(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error(err)
        setError(
          "Could not load your applications. Please make sure the backend server is running."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [session?.user?.email, isPending])

  const handleWithdraw = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to withdraw this application?"
    )
    if (!confirmed) return

    const previous = applications
    setApplications((prev) => prev.filter((app) => app._id !== id))

    try {
      const res = await fetch(`${API_BASE}/applications/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Delete failed")
    } catch (err) {
      console.error("Failed to withdraw application:", err)
      setApplications(previous)
      alert("Could not withdraw application. Please try again.")
    }
  }

  const filteredApplications = applications.filter((app) => {
    const matchesStatus =
      statusFilter === "All" || app.status === statusFilter
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch =
      !q ||
      app.jobTitle?.toLowerCase().includes(q) ||
      app.company?.toLowerCase().includes(q)
    return matchesStatus && matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#0f1014] p-6 text-white sm:p-8">
      {/* Breadcrumb */}
      <div className="mb-2 flex items-center gap-2 text-xs font-medium">
        <span className="text-neutral-400">Applications</span>
        <span className="text-neutral-600"></span>
        <span className="text-indigo-400">My Job Applications</span>
      </div>

      {/* Header Row */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            My Applications
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Track your submitted applications, interview stages, and recruiter
            responses.
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

      {/* Filter Tabs & Search */}
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          {["All", "Pending", "Shortlisted", "Interview", "Rejected"].map(
            (tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === tab
                    ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40"
                    : "bg-[#16171d] text-neutral-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>

        <div className="relative w-full sm:w-64">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search job or company..."
            className="h-9 w-full rounded-lg border border-white/10 bg-[#16171d] pr-3 pl-9 text-xs text-white outline-none placeholder:text-neutral-500 focus:border-indigo-500/50"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#14151b]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
                <th className="px-6 py-4">Job Title & Dept</th>
                <th className="px-6 py-4">Company & Location</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Compensation</th>
                <th className="px-6 py-4">Applied On</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-neutral-400"
                  >
                    Loading your applications...
                  </td>
                </tr>
              ) : filteredApplications.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-neutral-400"
                  >
                    No applications found.{" "}
                    <Link
                      href="/jobs"
                      className="text-indigo-400 underline hover:text-indigo-300"
                    >
                      Explore open roles
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => {
                  const style =
                    statusStyles[app.status] || statusStyles.Pending

                  return (
                    <tr
                      key={app._id}
                      className="transition-colors hover:bg-white/[0.02]"
                    >
                      {/* Job Title & Dept */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                            <BriefcaseBusinessIcon className="size-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {app.jobTitle}
                            </p>
                            <p className="text-xs text-neutral-400">
                              {app.department || "General"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Company & Location */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-neutral-200">
                          {app.company}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-400">
                          <Building2Icon className="size-3 text-neutral-500" />
                          {app.location || "Remote"}
                        </p>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-neutral-200">
                          {app.jobType || "Full-time"}
                        </span>
                      </td>

                      {/* Compensation */}
                      <td className="px-6 py-4 font-medium text-neutral-200">
                        {app.compensation || "Negotiable"}
                      </td>

                      {/* Applied Date */}
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-xs text-neutral-300">
                          <CalendarIcon className="size-3.5 text-neutral-500" />
                          {app.appliedDate}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${style.badge}`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${style.dot}`}
                          />
                          {app.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/jobs/${app.jobId}`}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 text-xs font-medium text-indigo-300 transition hover:bg-indigo-500/20"
                          >
                            View
                            <ExternalLinkIcon className="size-3" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleWithdraw(app._id)}
                            title="Withdraw application"
                            className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-neutral-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                          >
                            <Trash2Icon className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}