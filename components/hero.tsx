import Image from "next/image"
import Link from "next/link"
import {
  BriefcaseBusinessIcon,
  BuildingIcon,
  FlameIcon,
  MapPinIcon,
  SearchIcon,
  SparklesIcon,
} from "lucide-react"

import globeUrl from "@/app/images/globe.png"
import { Button } from "@/components/ui/button"

const trendingSearches = [
  { label: "Product Designer", query: "Product Designer" },
  { label: "AI Engineering", query: "AI Engineer" },
  { label: "DevOps Engineer", query: "DevOps Engineer" },
]

const stats = [
  { icon: BriefcaseBusinessIcon, value: "50K", label: "Active Jobs" },
  { icon: BuildingIcon, value: "12K", label: "Companies" },
  { icon: SearchIcon, value: "2M", label: "Job Seekers" },
  { icon: SparklesIcon, value: "97%", label: "Satisfaction Rate" },
]

function JobBadge() {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1.5 pr-3 backdrop-blur">
      <span className="grid size-5 place-items-center rounded-md bg-orange-500 text-white">
        <FlameIcon className="size-3" />
      </span>
      <span className="text-sm font-semibold text-white">50,000+</span>
      <span className="text-[11px] font-medium tracking-widest text-neutral-400 uppercase">
        New jobs this month
      </span>
    </div>
  )
}

function SearchBar({ className }: { className?: string }) {
  return (
    <form
      action="/jobs"
      className={`flex h-12 w-full max-w-2xl items-center gap-2 rounded-full border border-white/10 bg-white/5 py-2 pr-2 pl-4 backdrop-blur ${className}`}
    >
      <label className="flex min-w-0 flex-1 items-center gap-2">
        <SearchIcon className="size-4 shrink-0 text-neutral-400" />
        <input
          name="q"
          placeholder="Job title, skill or company"
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-neutral-500"
        />
      </label>
      <span className="h-5 w-px shrink-0 bg-white/10" aria-hidden />
      <label className="hidden min-w-0 flex-1 items-center gap-2 sm:flex">
        <MapPinIcon className="size-4 shrink-0 text-neutral-400" />
        <input
          name="location"
          placeholder="Location or Remote"
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-neutral-500"
        />
      </label>
      <Button
        type="submit"
        aria-label="Search jobs"
        className="size-9 shrink-0 rounded-xl bg-indigo-500 text-white hover:bg-indigo-400"
        size="icon"
      >
        <SearchIcon />
      </Button>
    </form>
  )
}

export function Hero() {
  return (
    <section className="relative isolate flex min-h-svh flex-col overflow-hidden bg-neutral-950 text-white">
      {/* Globe backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 top-[46%] sm:top-[52%]">
          <Image
            src={globeUrl}
            alt=""
            width={1440}
            height={1882}
            priority
            className="absolute top-0 left-1/2 w-[190%] max-w-none -translate-x-1/2 translate-y-[-55.4%] sm:w-[150%] lg:w-[145%]"
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center px-4 pt-16 text-center sm:pt-24">
        <JobBadge />

        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl md:text-6xl">
          Find Your Dream Job Today
        </h1>

        <p className="mt-4 max-w-lg text-sm text-balance text-neutral-400 sm:text-base">
          HireLoop connects top talent with world-class companies. Browse
          thousands of curated opportunities and land your next role — faster
        </p>

        <SearchBar className="mt-8" />

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-neutral-400 sm:text-sm">Trending:</span>
          {trendingSearches.map((item) => (
            <Link
              key={item.label}
              href={`/jobs?q=${encodeURIComponent(item.query)}`}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:bg-white/10 hover:text-white sm:text-sm"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-auto w-full pt-16">
          <p className="mx-auto max-w-md text-2xl font-semibold tracking-tight text-balance text-white sm:text-3xl md:text-4xl">
            Assisting over 15,000 job seekers
            <br />
            find their dream positions.
          </p>

          <dl className="mt-8 grid w-full grid-cols-2 gap-2.5 sm:mt-12 sm:grid-cols-4 sm:gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-black/50 p-4 text-left backdrop-blur-sm sm:p-5"
              >
                <stat.icon className="size-4.5 text-white/80" />
                <dd className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {stat.value}
                </dd>
                <dt className="mt-1 text-xs text-neutral-400 sm:text-sm">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
