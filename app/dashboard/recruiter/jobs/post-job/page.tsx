"use client"

import { useState, type FormEvent } from "react"
import {
  BriefcaseBusinessIcon,
  Building2Icon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  CoinsIcon,
  GlobeIcon,
  LayersIcon,
  MapPinIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { createJob } from "@/lib/actions/jobs"

const fieldClasses =
  "h-11 w-full rounded-xl border border-white/10 bg-[#121318] px-3.5 pl-10 text-sm text-white outline-none transition-all placeholder:text-neutral-500 focus-visible:border-indigo-500 focus-visible:ring-3 focus-visible:ring-indigo-500/20"

const labelClasses =
  "flex flex-col gap-2 text-xs font-semibold tracking-wide text-neutral-300 uppercase"

type JobData = Record<string, string>

const jobTypes = ["Full-time", "Part-time", "Contract", "Internship"]

export default function PostJobPage() {
  const [selectedType, setSelectedType] = useState("Full-time")
  const [isRemote, setIsRemote] = useState(false)
  const [submittedData, setSubmittedData] = useState<JobData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(event.currentTarget)
      formData.set("type", selectedType)
      formData.set("isRemote", String(isRemote))

      // Backend API-te fetch/POST request pathano
      const result = await createJob(formData)
      console.log("Job created successfully on backend:", result)

      // UI-te preview data set kora
      const data = Object.fromEntries(formData) as JobData
      setSubmittedData(data)
    } catch (error) {
      console.error("Error posting job:", error)
      alert("Failed to publish job. Please check your backend connection.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12 text-white">
      {/* Top Header Banner */}
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="text-xs font-medium text-neutral-400">
            Manage Jobs <span className="mx-1.5 text-neutral-600">›</span>{" "}
            <span className="text-indigo-400">Create New Listing</span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Post a New Job
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Fill in the position specifications to attract qualified talent across our network.
          </p>
        </div>
      </div>

      {/* Main Form */}
      <form
        id="job-post-form"
        onSubmit={handleSubmit}
        className="space-y-8 rounded-2xl border border-white/10 bg-[#16171d] p-6 sm:p-8 shadow-xl"
      >
        {/* Section 1: Basic Information */}
        <div className="space-y-5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-2 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20" />
            <h2 className="text-sm font-bold tracking-wider text-white uppercase">
              1. Basic Information
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className={`${labelClasses} sm:col-span-2`}>
              Job Title <span className="text-indigo-400">*</span>
              <div className="relative">
                <BriefcaseBusinessIcon className="absolute top-3.5 left-3 size-4 text-neutral-500" />
                <input
                  name="title"
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Engineer"
                  className={fieldClasses}
                />
              </div>
            </label>

            <label className={labelClasses}>
              Company Name <span className="text-indigo-400">*</span>
              <div className="relative">
                <Building2Icon className="absolute top-3.5 left-3 size-4 text-neutral-500" />
                <input
                  name="company"
                  type="text"
                  required
                  placeholder="e.g. HirePulse Network"
                  className={fieldClasses}
                />
              </div>
            </label>

            <label className={labelClasses}>
              Job Category <span className="text-indigo-400">*</span>
              <div className="relative">
                <LayersIcon className="absolute top-3.5 left-3 size-4 text-neutral-500" />
                <select
                  name="category"
                  className={`${fieldClasses} appearance-none cursor-pointer`}
                >
                  <option value="Engineering & Tech">Engineering & Tech</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="Marketing & Growth">Marketing & Growth</option>
                  <option value="Customer Support">Customer Support</option>
                </select>
              </div>
            </label>

            <div className={`sm:col-span-2 ${labelClasses}`}>
              Job Type <span className="text-indigo-400">*</span>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {jobTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`flex h-11 items-center justify-center rounded-xl border text-xs font-medium transition-all ${
                      selectedType === type
                        ? "border-indigo-500 bg-indigo-500/15 text-white shadow-sm ring-1 ring-indigo-500/30"
                        : "border-white/10 bg-[#121318] text-neutral-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10" />

        {/* Section 2: Location, Compensation & Timeline */}
        <div className="space-y-5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-2 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20" />
            <h2 className="text-sm font-bold tracking-wider text-white uppercase">
              2. Location, Compensation & Timeline
            </h2>
          </div>

          {/* Remote Toggle Box */}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#121318] p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <GlobeIcon className="size-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">
                  Remote Work Allowed (isRemote)
                </div>
                <div className="text-[11px] text-neutral-400">
                  Enable worldwide or distributed candidate applications
                </div>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isRemote}
              onClick={() => setIsRemote(!isRemote)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isRemote ? "bg-indigo-600" : "bg-neutral-800"
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out ${
                  isRemote ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className={labelClasses}>
              Job Location (location)
              <div className="relative">
                <MapPinIcon className="absolute top-3.5 left-3 size-4 text-neutral-500" />
                <input
                  name="location"
                  type="text"
                  placeholder="e.g. New York, USA or Remote"
                  className={fieldClasses}
                />
              </div>
            </label>

            <label className={labelClasses}>
              Application Deadline (deadline)
              <div className="relative">
                <CalendarDaysIcon className="absolute top-3.5 left-3 size-4 text-neutral-500" />
                <input
                  name="deadline"
                  type="date"
                  className={fieldClasses}
                />
              </div>
            </label>

            <label className={labelClasses}>
              Min Salary / Rate ($)
              <div className="relative">
                <CoinsIcon className="absolute top-3.5 left-3 size-4 text-neutral-500" />
                <input
                  name="minSalary"
                  type="text"
                  placeholder="e.g. $90,000"
                  className={fieldClasses}
                />
              </div>
            </label>

            <label className={labelClasses}>
              Max Salary / Rate ($)
              <div className="relative">
                <CoinsIcon className="absolute top-3.5 left-3 size-4 text-neutral-500" />
                <input
                  name="maxSalary"
                  type="text"
                  placeholder="e.g. $120,000"
                  className={fieldClasses}
                />
              </div>
            </label>
          </div>
        </div>

        <div className="border-t border-white/10" />

        {/* Section 3: Responsibilities & Requirements */}
        <div className="space-y-5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-2 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20" />
            <h2 className="text-sm font-bold tracking-wider text-white uppercase">
              3. Responsibilities & Requirements
            </h2>
          </div>

          <label className={labelClasses}>
            Key Responsibilities <span className="text-indigo-400">*</span>
            <textarea
              name="description"
              rows={4}
              required
              placeholder="Showcase your commitment to delivering exceptional user interfaces and digital experiences..."
              className="w-full rounded-xl border border-white/10 bg-[#121318] p-3.5 text-sm text-white outline-none transition-all placeholder:text-neutral-500 focus-visible:border-indigo-500 focus-visible:ring-3 focus-visible:ring-indigo-500/20 resize-y leading-relaxed"
            />
          </label>

          <label className={labelClasses}>
            Qualifications & Requirements <span className="text-indigo-400">*</span>
            <textarea
              name="requirements"
              rows={4}
              required
              placeholder="• 3+ years of experience with React, TypeScript...
- Solid understanding of DOM performance..."
              className="w-full rounded-xl border border-white/10 bg-[#121318] p-3.5 text-sm text-white outline-none transition-all placeholder:text-neutral-500 focus-visible:border-indigo-500 focus-visible:ring-3 focus-visible:ring-indigo-500/20 resize-y leading-relaxed"
            />
          </label>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Publishing Job..." : "Publish Job Listing →"}
          </Button>
        </div>
      </form>

      {/* Submission Success Preview Box */}
      {submittedData && (
        <section className="space-y-4 rounded-2xl border border-emerald-500/30 bg-[#16171d] p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2Icon className="size-5" />
            <h2 className="text-base font-semibold text-white">
              Job Listing Successfully Published & Sent to Backend!
            </h2>
          </div>
          <p className="text-xs text-neutral-400">
            Here is the submitted data payload that was sent via fetch:
          </p>
          <dl className="grid gap-x-6 gap-y-2 rounded-xl border border-white/10 bg-[#121318] p-4 sm:grid-cols-2 text-xs">
            {Object.entries(submittedData).map(([key, value]) => (
              <div key={key} className="flex gap-3 border-b border-white/5 py-2">
                <dt className="w-32 font-semibold text-indigo-400">{key}:</dt>
                <dd className="min-w-0 flex-1 break-words text-neutral-200">
                  {String(value)}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  )
}