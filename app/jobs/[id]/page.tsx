"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  BanknoteIcon,
  BarChart3Icon,
  BookmarkIcon,
  BriefcaseBusinessIcon,
  Building2Icon,
  CheckCircle2Icon,
  ClockIcon,
  Code2Icon,
  HeartPulseIcon,
  LaptopIcon,
  MapPinIcon,
  PalmtreeIcon,
  ShieldCheckIcon,
  XIcon,
} from "lucide-react"

import { userSession } from "@/lib/auth-client"

interface JobDetails {
  _id: string
  title?: string
  jobTitle?: string
  company?: string
  companyName?: string
  location?: string
  type?: string
  jobType?: string
  department?: string
  experience?: string
  compensation?: string
  salary?: string
  salaryMin?: string | number
  salaryMax?: string | number
  description?: string
  responsibilities?: string[] | string
  requirements?: string[] | string
  skills?: string[]
  benefits?: string[]
  companySize?: string
  industry?: string
  companyWebsite?: string
  deadline?: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

function toArray(val?: string[] | string): string[] {
  if (!val) return []
  if (Array.isArray(val)) return val.filter(Boolean)
  return val
    .split("\n")
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean)
}

function formatCompensation(job: JobDetails): string {
  if (job.compensation) return job.compensation
  if (job.salary) return job.salary
  if (job.salaryMin && job.salaryMax) {
    return `$${job.salaryMin} - $${job.salaryMax}`
  }
  return "Negotiable"
}

export default function JobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = userSession()
  const jobId = params?.id as string

  const [job, setJob] = useState<JobDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  // Apply Modal & Applied Status State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [resumeUrl, setResumeUrl] = useState("")
  const [coverNote, setCoverNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [appliedSuccess, setAppliedSuccess] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)

  // ব্যাকএন্ড থেকে নির্দিষ্ট জবের ডেটা ফেচ
  useEffect(() => {
    if (!jobId) return

    const fetchJobDetails = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`${API_BASE}/jobs/${jobId}`)
        if (!res.ok) throw new Error("Job not found")
        const data = await res.json()
        setJob(data)
      } catch (err) {
        console.error(err)
        setError("Could not load this job post. It may have been removed.")
      } finally {
        setLoading(false)
      }
    }

    fetchJobDetails()
  }, [jobId])

  // ইউজার আগে থেকেই এই জবে অ্যাপ্লাই করেছে কি না চেক
  useEffect(() => {
    if (!jobId || !session?.user?.email) return

    const checkAlreadyApplied = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/applications?email=${encodeURIComponent(
            session.user.email
          )}`
        )
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data)) {
          const found = data.some(
            (app: { jobId?: string }) => app.jobId === jobId
          )
          setHasApplied(found)
        }
      } catch {
        // ignore
      }
    }

    checkAlreadyApplied()
  }, [jobId, session?.user?.email])

  // বুকমার্ক চেক
  useEffect(() => {
    try {
      const stored = localStorage.getItem("hireloop_saved_jobs")
      if (stored && jobId) {
        const list: string[] = JSON.parse(stored)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsSaved(list.includes(jobId))
      }
    } catch {
      // ignore
    }
  }, [jobId])

  const toggleBookmark = () => {
    try {
      const stored = localStorage.getItem("hireloop_saved_jobs")
      const list: string[] = stored ? JSON.parse(stored) : []
      const updated = list.includes(jobId)
        ? list.filter((id) => id !== jobId)
        : [...list, jobId]
      localStorage.setItem("hireloop_saved_jobs", JSON.stringify(updated))
      setIsSaved(updated.includes(jobId))
    } catch {
      // ignore
    }
  }

  const handleOpenApply = () => {
    if (hasApplied) return
    if (!session?.user) {
      router.push("/sign-in")
      return
    }
    setIsModalOpen(true)
  }

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!job || !session?.user || hasApplied) return

    try {
      setSubmitting(true)
      const payload = {
        jobId: job._id,
        jobTitle: job.title || job.jobTitle || "Untitled Position",
        department: job.department || "General",
        company: job.company || job.companyName || "HireLoop Partner",
        location: job.location || "Remote",
        jobType: job.type || job.jobType || "Full-time",
        compensation: formatCompensation(job),
        candidateName: session.user.name || "Candidate",
        candidateEmail: session.user.email,
        resumeUrl,
        coverNote,
        appliedDate: new Date().toISOString().split("T")[0],
        status: "Pending",
      }

      const res = await fetch(`${API_BASE}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.status === 409) {
        setHasApplied(true)
        setIsModalOpen(false)
        return
      }

      if (!res.ok) throw new Error("Failed to submit application")

      setHasApplied(true)
      setAppliedSuccess(true)
      setTimeout(() => {
        setIsModalOpen(false)
        setAppliedSuccess(false)
        setResumeUrl("")
        setCoverNote("")
      }, 1400)
    } catch (err) {
      console.error(err)
      alert(
        "Could not submit application. Make sure /applications API is running."
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#09090b] px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="h-28 animate-pulse rounded-2xl border border-white/10 bg-[#111216]" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-24 animate-pulse rounded-2xl border border-white/10 bg-[#111216]"
                  />
                ))}
              </div>
              <div className="h-96 animate-pulse rounded-2xl border border-white/10 bg-[#111216]" />
            </div>
            <div className="h-80 animate-pulse rounded-2xl border border-white/10 bg-[#111216] lg:col-span-4" />
          </div>
        </div>
      </main>
    )
  }

  if (error || !job) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] px-4 text-center text-white">
        <BriefcaseBusinessIcon className="size-12 text-neutral-600" />
        <h1 className="mt-4 text-xl font-semibold">Job Not Found</h1>
        <p className="mt-2 text-sm text-neutral-400">
          {error || "This job listing is no longer available."}
        </p>
        <Link
          href="/jobs"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
        >
          <ArrowLeftIcon className="size-4" />
          Back to Jobs
        </Link>
      </main>
    )
  }

  const title = job.title || job.jobTitle || "Untitled Position"
  const company = job.company || job.companyName || "HireLoop Partner"
  const location = job.location || "Remote"
  const jobType = job.type || job.jobType || "Full-time"
  const experience = job.experience || "2+ Years"
  const salary = formatCompensation(job)

  const responsibilities = toArray(job.responsibilities)
  const requirements = toArray(job.requirements)
  const skills =
    job.skills && job.skills.length > 0
      ? job.skills
      : [job.department || "Core Skills", jobType, "Team Collaboration"]

  const benefits =
    job.benefits && job.benefits.length > 0
      ? job.benefits
      : [
          "Full Health & Dental",
          "Competitive Compensation",
          "Latest Hardware Stipend",
          "Flexible PTO",
        ]

  const benefitIcons = [
    HeartPulseIcon,
    ShieldCheckIcon,
    LaptopIcon,
    PalmtreeIcon,
  ]

  return (

    
    <main className="min-h-screen bg-[#09090b] px-4 py-8 text-white sm:px-6 lg:px-8">

<div className="mx-auto max-w-6xl">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-neutral-400 transition hover:bg-white/5 hover:text-white"
        >
          <ArrowLeftIcon className="size-4" />
          Back
        </button>
        </div>


      <div className="mx-auto max-w-6xl">
        {/* Top Job Header Card */}
        <div className="mb-6 flex flex-col justify-between gap-5 rounded-2xl border border-white/10 bg-[#111216] p-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#181920] text-white">
              <BriefcaseBusinessIcon className="size-6 text-neutral-200" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {title}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-neutral-400">
                <span className="font-medium text-neutral-300">{company}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                  <CheckCircle2Icon className="size-3.5" />
                  Verified Employer
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleBookmark}
              aria-label={isSaved ? "Remove bookmark" : "Save job"}
              className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-[#181920] text-neutral-300 transition hover:border-white/20 hover:text-white"
            >
              <BookmarkIcon
                className={`size-4 ${isSaved ? "fill-white text-white" : ""}`}
              />
            </button>

            <button
              type="button"
              onClick={handleOpenApply}
              disabled={hasApplied}
              className={`h-10 rounded-xl px-6 text-sm font-semibold transition ${
                hasApplied
                  ? "cursor-not-allowed border border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                  : "bg-white text-neutral-950 hover:bg-neutral-200"
              }`}
            >
              {hasApplied ? "Already Applied" : "Apply Now"}
            </button>
          </div>
        </div>

        {/* Two-Column Content */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Left Column (8 cols) */}
          <div className="space-y-6 lg:col-span-8">
            {/* 4 Info Stat Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-[#111216] p-4">
                <BanknoteIcon className="size-4 text-neutral-400" />
                <p className="mt-3 text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
                  Salary Range
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {salary}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111216] p-4">
                <MapPinIcon className="size-4 text-neutral-400" />
                <p className="mt-3 text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
                  Location
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {location}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111216] p-4">
                <ClockIcon className="size-4 text-neutral-400" />
                <p className="mt-3 text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
                  Job Type
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {jobType}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#111216] p-4">
                <BarChart3Icon className="size-4 text-neutral-400" />
                <p className="mt-3 text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
                  Experience
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {experience}
                </p>
              </div>
            </div>

            {/* Main Job Details Card */}
            <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#111216] p-6 sm:p-8">
              {/* Job Description */}
              <section className="pb-7">
                <h2 className="text-lg font-semibold text-white">
                  Job Description
                </h2>
                <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-neutral-400">
                  {job.description ||
                    `We are looking for a talented ${title} to join ${company}. You will collaborate with cross-functional teams to build high-impact products and deliver exceptional user experiences.`}
                </p>
              </section>

              {/* Responsibilities */}
              <section className="py-7">
                <h2 className="text-lg font-semibold text-white">
                  Responsibilities
                </h2>
                <ul className="mt-3 list-disc space-y-2.5 pl-5 text-sm leading-relaxed text-neutral-400 marker:text-neutral-600">
                  {responsibilities.length > 0 ? (
                    responsibilities.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))
                  ) : (
                    <>
                      <li>
                        Lead end-to-end execution of key features from concept
                        to production.
                      </li>
                      <li>
                        Collaborate with engineering, product, and design teams
                        to deliver reliable solutions.
                      </li>
                      <li>
                        Maintain high quality standards, documentation, and best
                        practices across the codebase.
                      </li>
                    </>
                  )}
                </ul>
              </section>

              {/* Requirements */}
              <section className="py-7">
                <h2 className="text-lg font-semibold text-white">
                  Requirements
                </h2>

                {/* Skill Tags */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#181920] px-3 py-1.5 text-xs font-medium text-neutral-300"
                    >
                      <Code2Icon className="size-3.5 text-neutral-400" />
                      {skill}
                    </span>
                  ))}
                </div>

                {requirements.length > 0 && (
                  <ul className="mt-4 list-disc space-y-2.5 pl-5 text-sm leading-relaxed text-neutral-400 marker:text-neutral-600">
                    {requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                )}
              </section>

              {/* Benefits */}
              <section className="pt-7">
                <h2 className="text-lg font-semibold text-white">Benefits</h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {benefits.map((benefit, idx) => {
                    const Icon = benefitIcons[idx % benefitIcons.length]
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#181920] text-neutral-300">
                          <Icon className="size-4" />
                        </div>
                        <span className="text-sm font-medium text-neutral-200">
                          {benefit}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </section>
            </div>
          </div>

          {/* Right Column: Company Overview (4 cols) */}
          <aside className="rounded-2xl border border-white/10 bg-[#111216] p-6 lg:col-span-4">
            <h2 className="text-base font-semibold text-white">
              Company Overview
            </h2>

            {/* Subtle Dark Workspace Visual */}
            <div className="mt-4 flex h-40 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#181a24] via-[#12131a] to-[#0a0b0e]">
              <div className="flex flex-col items-center gap-2 text-neutral-500">
                <Building2Icon className="size-9 text-neutral-400" />
                <span className="text-xs font-medium text-neutral-400">
                  {company}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-3.5 text-xs">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="font-semibold tracking-wider text-neutral-500 uppercase">
                  Size
                </span>
                <span className="font-medium text-neutral-200">
                  {job.companySize || "50 - 250 Employees"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="font-semibold tracking-wider text-neutral-500 uppercase">
                  Industry
                </span>
                <span className="font-medium text-neutral-200">
                  {job.industry || job.department || "Technology / SaaS"}
                </span>
              </div>

              {job.deadline && (
                <div className="flex items-center justify-between pb-1">
                  <span className="font-semibold tracking-wider text-neutral-500 uppercase">
                    Deadline
                  </span>
                  <span className="font-medium text-neutral-200">
                    {job.deadline}
                  </span>
                </div>
              )}
            </div>

            <a
              href={job.companyWebsite || "#"}
              target={job.companyWebsite ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="mt-5 flex h-10 w-full items-center justify-center rounded-xl border border-white/10 bg-[#181920] text-xs font-semibold text-neutral-200 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              Visit Website
            </a>
          </aside>
        </div>
      </div>

      {/* Apply Now Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111216] p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Apply for {title}</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-white/10 hover:text-white"
              >
                <XIcon className="size-4" />
              </button>
            </div>

            {appliedSuccess ? (
              <div className="py-8 text-center">
                <CheckCircle2Icon className="mx-auto size-10 text-emerald-400" />
                <p className="mt-3 text-sm font-semibold text-white">
                  Application Submitted!
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  You can track your status in your dashboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="mt-5 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-neutral-300">
                    Resume / Portfolio Link
                  </label>
                  <input
                    type="url"
                    required
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    placeholder="https://drive.google.com/your-resume"
                    className="h-10 w-full rounded-xl border border-white/10 bg-[#181920] px-3.5 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-neutral-300">
                    Short Note (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Why are you a great fit for this role?"
                    className="w-full rounded-xl border border-white/10 bg-[#181920] p-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-white/30"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="h-10 rounded-xl border border-white/10 px-4 text-xs font-medium text-neutral-300 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-10 rounded-xl bg-white px-5 text-xs font-semibold text-neutral-950 transition hover:bg-neutral-200 disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  )
}