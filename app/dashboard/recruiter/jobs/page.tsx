"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  BriefcaseBusinessIcon,
  Building2Icon,
  CalendarDaysIcon,
  GlobeIcon,
  Loader2Icon,
  PlusIcon,
  Trash2Icon,
  UsersIcon,
  AlertTriangleIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteJob, getJobs } from "@/lib/actions/jobs"

type JobPost = {
  _id?: string
  id?: string
  title: string
  category?: string
  company: string
  location?: string
  isRemote?: boolean | string
  type: string
  minSalary?: string
  maxSalary?: string
  salary?: string
  applicantsCount?: number
  status?: "Active" | "Expired"
  deadline?: string
}

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState<JobPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for Delete Confirmation Dialog
  const [jobToDelete, setJobToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchAllJobs = async () => {
      try {
        setIsLoading(true)
        const response = await getJobs()
        const jobList = Array.isArray(response) ? response : response?.data || []
        setJobs(jobList)
      } catch (err) {
        console.error("Error fetching jobs:", err)
        setError("Could not load jobs. Make sure your backend server is running.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllJobs()
  }, [])

  const confirmDelete = async () => {
    if (!jobToDelete) return

    try {
      setIsDeleting(true)
      await deleteJob(jobToDelete)
      setJobs((prev) =>
        prev.filter((job) => (job._id || job.id) !== jobToDelete)
      )
      setJobToDelete(null)
    } catch (err) {
      console.error("Failed to delete job:", err)
      alert("Failed to delete job from server.")
    } finally {
      setIsDeleting(false)
    }
  }

  const formatCompensation = (job: JobPost) => {
    if (job.minSalary && job.maxSalary) {
      return `${job.minSalary} - ${job.maxSalary}`
    }
    if (job.minSalary) return job.minSalary
    if (job.salary) return job.salary
    return "Negotiable"
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12 text-white">
      {/* Top Header Banner */}
      <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="text-xs font-medium text-neutral-400">
            Manage Jobs <span className="mx-1.5 text-neutral-600">›</span>{" "}
            <span className="text-indigo-400">Job Listings & Postings</span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Manage Job Posts
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Review live listings, monitor applicants, and update job details across your organization.
          </p>
        </div>

        {/* New Job Post Button */}
        <Button
          render={<Link href="/dashboard/recruiter/post-job" />}
          className="h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:opacity-90"
        >
          <PlusIcon className="mr-1.5 size-4" />
          New Job Post
        </Button>
      </div>

      {/* Jobs Table Container */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#16171d] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
                <th className="py-4 pr-4 pl-6">Job Title & Dept</th>
                <th className="px-4 py-4">Company & Location</th>
                <th className="px-4 py-4">Type</th>
                <th className="px-4 py-4">Compensation</th>
                <th className="px-4 py-4">Applicants</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Deadline</th>
                <th className="py-4 pr-6 pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-neutral-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2Icon className="size-4 animate-spin text-indigo-400" />
                      <span>Loading your posted jobs...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-rose-400">
                    {error}
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-neutral-400">
                    No jobs posted yet. Click{" "}
                    <Link
                      href="/dashboard/recruiter/post-job"
                      className="font-medium text-indigo-400 underline"
                    >
                      New Job Post
                    </Link>{" "}
                    to publish your first job!
                  </td>
                </tr>
              ) : (
                jobs.map((job, index) => {
                  const jobId = job._id || job.id || String(index)
                  const isRemoteJob =
                    job.isRemote === true || job.isRemote === "true"
                  const jobStatus = job.status || "Active"

                  return (
                    <tr
                      key={jobId}
                      className="group transition-colors hover:bg-white/[0.03]"
                    >
                      {/* Job Title & Dept */}
                      <td className="py-4 pr-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
                            <BriefcaseBusinessIcon className="size-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-white transition-colors group-hover:text-indigo-400">
                              {job.title}
                            </div>
                            <div className="text-[11px] text-neutral-400">
                              {job.category || "General"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Company & Location */}
                      <td className="px-4 py-4">
                        <div className="font-medium text-neutral-200">
                          {job.company}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                          {isRemoteJob ? (
                            <GlobeIcon className="size-3 text-indigo-400" />
                          ) : (
                            <Building2Icon className="size-3 text-neutral-500" />
                          )}
                          <span>
                            {job.location || (isRemoteJob ? "Remote" : "On-site")}
                          </span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-4">
                        <span className="rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-medium text-neutral-300 ring-1 ring-white/10">
                          {job.type}
                        </span>
                      </td>

                      {/* Compensation */}
                      <td className="px-4 py-4 font-medium text-neutral-200">
                        {formatCompensation(job)}
                      </td>

                      {/* Applicants */}
                      <td className="px-4 py-4">
                        <div className="inline-flex items-center gap-1.5 font-medium text-indigo-300">
                          <UsersIcon className="size-3.5 text-indigo-400" />
                          <span>{job.applicantsCount ?? 0} Candidates</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            jobStatus === "Active"
                              ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30"
                              : "bg-neutral-800 text-neutral-400 ring-1 ring-white/10"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              jobStatus === "Active"
                                ? "animate-pulse bg-emerald-400"
                                : "bg-neutral-500"
                            }`}
                          />
                          {jobStatus}
                        </span>
                      </td>

                      {/* Deadline */}
                      <td className="px-4 py-4 text-neutral-300">
                        <div className="flex items-center gap-1.5">
                          <CalendarDaysIcon className="size-3.5 text-neutral-500" />
                          <span>{job.deadline || "No deadline"}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-6 pl-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            render={
                              <Link
                                href={`/dashboard/recruiter/edit-job/${jobId}`}
                              />
                            }
                            className="h-8 rounded-lg bg-indigo-500/10 px-3 text-[11px] font-medium text-indigo-300 ring-1 ring-indigo-500/30 hover:bg-indigo-500/20"
                          >
                            Update
                          </Button>
                          <button
                            type="button"
                            onClick={() => setJobToDelete(jobId)}
                            title="Delete Job"
                            className="grid size-8 place-items-center rounded-lg bg-white/5 text-neutral-400 ring-1 ring-white/10 transition-colors hover:bg-red-500/15 hover:text-red-400 hover:ring-red-500/30"
                          >
                            <Trash2Icon className="size-3.5" />
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

      {/* Modern Shadcn Alert Dialog for Deletion Confirmation */}
      <AlertDialog
        open={!!jobToDelete}
        onOpenChange={(open: boolean) => !open && setJobToDelete(null)}
      >
        <AlertDialogContent className="border border-white/10 bg-[#16171d] text-white rounded-2xl shadow-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-red-500/10 text-red-400 ring-1 ring-red-500/20">
                <AlertTriangleIcon className="size-5" />
              </div>
              <div>
                <AlertDialogTitle className="text-lg font-semibold text-white">
                  Delete Job Listing
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-neutral-400 mt-0.5">
                  Are you sure you want to delete this job post? This action cannot be undone and will permanently remove the listing from our servers.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="h-10 rounded-xl border-white/10 bg-white/5 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="h-10 rounded-xl bg-red-600 px-5 text-xs font-semibold text-white hover:bg-red-500 transition-colors disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Yes, Delete Listing"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}