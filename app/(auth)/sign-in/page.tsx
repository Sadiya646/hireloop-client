"use client"

import Link from "next/link"
import type { FormEvent } from "react"

import { Button } from "@/components/ui/button"

const inputClasses =
  "h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

// TODO: wire up real auth (better-auth). For now this only collects the form data.
export default function SignInPage() {
    
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()


    const data = Object.fromEntries(new FormData(event.currentTarget))
    console.log("Sign in:", data)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your HireLoop account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClasses}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Link
              href="/sign-in"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className={inputClasses}
          />
        </div>

        <Button
          type="submit"
          className="mt-1 h-9 w-full bg-indigo-500 text-white hover:bg-indigo-400"
        >
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-indigo-500 hover:text-indigo-400"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}
