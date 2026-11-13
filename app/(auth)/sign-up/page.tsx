"use client"

import Link from "next/link"
import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

const inputClasses =
  "h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

// role is a better-auth additionalField on the user (see lib/auth.ts) and is
// sent as part of the signUp.email payload below.
export default function SignUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    const formData = new FormData(event.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const role = formData.get("role") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    setLoading(true)
    try {
      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
        role,
        callbackURL: "/",
      })
      if (error) {
        setError(error.message || "Something went wrong. Please try again.")
        return
      }
      router.push("/")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Join HireLoop and start your next role
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Jane Doe"
            className={inputClasses}
          />
        </div>

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

        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-sm font-medium">I am a</legend>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "seeker", label: "Job Seeker" },
              { value: "recruiter", label: "Recruiter" },
              { value: "admin", label: "Admin" },
            ].map((role) => (
              <label
                key={role.value}
                className="flex cursor-pointer items-center justify-center rounded-lg border border-border px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground has-checked:border-indigo-500 has-checked:bg-indigo-500/10 has-checked:text-indigo-500 has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
              >
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  defaultChecked={role.value === "seeker"}
                  className="sr-only"
                />
                {role.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className={inputClasses}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            placeholder="••••••••"
            className={inputClasses}
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="mt-1 h-9 w-full bg-indigo-500 text-white hover:bg-indigo-400"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-indigo-500 hover:text-indigo-400"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
