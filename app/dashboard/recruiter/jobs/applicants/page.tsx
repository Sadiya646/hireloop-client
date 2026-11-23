"use client"

import React, { useEffect, useState } from "react"
import {
  CalendarIcon,
  ExternalLinkIcon,
  FileTextIcon,
  MailIcon,
  SearchIcon,
} from "lucide-react"

type ApplicantStatus = "Pending" | "Shortlisted" | "Interview" | "Rejected"

interface Applicant {
  _id: string
  candidateName: string
  candidateEmail: string
  jobTitle: string
  department: string
  appliedDate: string
  resumeUrl: string
  status: ApplicantStatus
}

// ব্যাকএন্ড রেডি না থাকা পর্যন্ত UI দেখার জন্য ডেমো ডেটা
const MOCK_APPLICANTS: Applicant[] = [
  {
    _id: "app-101",
    candidateName: "Nadia Rahman",
    candidateEmail: "nadia.rahman@example.com",
    jobTitle: "Frontend Developer",
    department: "Engineering & Tech",
    appliedDate: "2026-11-22",
    resumeUrl: "https://example.com/resume/nadia",
    status: "Shortlisted",
  },
  {
    _id: "app-102",
    candidateName: "Tanvir Ahmed",
    candidateEmail: "tanvir.ahmed@example.com",
    jobTitle: "Senior Product Designer",
    department: "Product & Design",
    appliedDate: "2026-11-21",
    resumeUrl: "https://example.com/resume/tanvir",
    status: "Pending",
  },
  {
    _id: "app-103",
    candidateName: "Sadia Islam",
    candidateEmail: "sadia.islam@example.com",
    jobTitle: "DevOps Specialist",
    department: "Engineering & Tech",
    appliedDate: "2026-11-19",
    resumeUrl: "https://example.com/resume/sadia",
    status: "Interview",
  },
  {
    _id: "app-104",
    candidateName: "Farhan Kabir",
    candidateEmail: "farhan.kabir@example.com",
    jobTitle: "Frontend Developer",
    department: "Engineering & Tech",
    appliedDate: "2026-11-17",
    resumeUrl: "https://example.com/resume/farhan",
    status: "Rejected",
  },
]

const statusStyles: Record<ApplicantStatus, { badge: string; dot: string }> = {
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function RecruiterApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE}/applications`)
        if (!res.ok) throw new Error("Failed to fetch applicants")
        const data = await res.json()
        setApplicants(
          Array.isArray(data) && data.length > 0 ? data : MOCK_APPLICANTS
        )
      } catch {
        setApplicants(MOCK_APPLICANTS)
      } finally {
        setLoading(false)
      }
    }

    fetchApplicants()
  }, [])

  const handleStatusChange = async (id: string, newStatus: ApplicantStatus) => {
    // UI-তে সাথে সাথে আপডেট
    setApplicants((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, status: newStatus } : item
      )
    )

    try {
      await fetch(`${API_BASE}/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
    } catch (error) {
      console.error("Failed to update status:", error)
    }
  }

  const filteredApplicants = applicants.filter((item) => {
    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      item.candidateName.toLowerCase().includes(q) ||
      item.candidateEmail.toLowerCase().includes(q) ||
      item.jobTitle.toLowerCase().includes(q)
    return matchesStatus && matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#0f1014] p-6 text-white sm:p-8">
      {/* Breadcrumb */}
      <div className="mb-2 flex items-center gap-2 text-xs font-medium">
        <span className="text-neutral-400">Applicants</span>
        <span className="text-neutral-600"></span>
        <span className="text-indigo-400">Candidate Submissions</span>
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Manage Applicants
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Review candidate profiles, inspect resumes, and update hiring
            stages.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#14151b] px-4 py-2 text-xs text-neutral-300">
          Total Candidates:{" "}
          <span className="font-semibold text-white">{applicants.length}</span>
        </div>
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

        <div className="relative w-full sm:w-72">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate, email or job..."
            className="h-9 w-full rounded-lg border border-white/10 bg-[#16171d] pr-3 pl-9 text-xs text-white outline-none placeholder:text-neutral-500 focus:border-indigo-500/50"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#14151b]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
                <th className="px-6 py-4">Candidate</th>
                <th className="px-6 py-4">Applied Role</th>
                <th className="px-6 py-4">Applied Date</th>
                <th className="px-6 py-4">Resume</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Update Stage</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-neutral-400"
                  >
                    Loading applicants...
                  </td>
                </tr>
              ) : filteredApplicants.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-neutral-400"
                  >
                    No applicants match your current filter.
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((applicant) => {
                  const style =
                    statusStyles[applicant.status] || statusStyles.Pending
                  const initials = applicant.candidateName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()

                  return (
                    <tr
                      key={applicant._id}
                      className="transition-colors hover:bg-white/[0.02]"
                    >
                      {/* Candidate */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-sky-500 text-xs font-bold text-white">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {applicant.candidateName}
                            </p>
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-400">
                              <MailIcon className="size-3 text-neutral-500" />
                              {applicant.candidateEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Applied Role */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-neutral-200">
                          {applicant.jobTitle}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {applicant.department}
                        </p>
                      </td>

                      {/* Applied Date */}
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-xs text-neutral-300">
                          <CalendarIcon className="size-3.5 text-neutral-500" />
                          {applicant.appliedDate}
                        </span>
                      </td>

                      {/* Resume */}
                      <td className="px-6 py-4">
                        <a
                          href={applicant.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300 transition hover:bg-indigo-500/20"
                        >
                          <FileTextIcon className="size-3.5" />
                          View CV
                          <ExternalLinkIcon className="size-3" />
                        </a>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${style.badge}`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${style.dot}`}
                          />
                          {applicant.status}
                        </span>
                      </td>

                      {/* Update Stage Dropdown */}
                      <td className="px-6 py-4 text-right">
                        <select
                          value={applicant.status}
                          onChange={(e) =>
                            handleStatusChange(
                              applicant._id,
                              e.target.value as ApplicantStatus
                            )
                          }
                          aria-label={`Update status for ${applicant.candidateName}`}
                          className="h-8 rounded-lg border border-white/10 bg-[#1c1d24] px-2.5 text-xs font-medium text-neutral-200 outline-none focus:border-indigo-500"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Interview">Interview</option>
                          <option value="Rejected">Rejected</option>
                        </select>
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