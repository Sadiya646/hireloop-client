
"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MenuIcon } from "lucide-react"

import logoUrl from "@/app/images/logo.png"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

import {
  userSession,
  signOut,
} from "@/lib/auth-client"

const navLinks = [
  { href: "/jobs", label: "Browse Jobs" },
  { href: "/company", label: "Company" },
  { href: "/pricing", label: "Pricing" },
]

function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={className} aria-label="HireLoop home">
      <Image
        src={logoUrl}
        alt="HireLoop"
        priority
        className="h-8 w-auto"
      />
    </Link>
  )
}

function SignInLink({ className }: { className: string }) {
  return (
    <Link href="/sign-in" className={className}>
      Sign In
    </Link>
  )
}

function GetStartedButton({ className }: { className: string }) {
  return (
    <Button
      render={<Link href="/sign-up" />}
      className={className}
    >
      Get Started
    </Button>
  )
}

export function Navbar() {
  const router = useRouter()

  const { data: session, isPending } = userSession()

  const isLoggedIn = !!session?.user

  // Sign Out functionality
  const handleSignOut = async () => {
    const { error } = await signOut()

    if (error) {
      console.error("Sign out failed:", error.message)
      return
    }

    router.push("/sign-in")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 w-full p-3">
      <nav className="mx-auto flex h-13 max-w-6xl items-center justify-between rounded-2xl bg-neutral-950 px-4 text-white shadow-md ring-1 ring-white/10">

        {/* Logo */}
        <Logo className="shrink-0" />

        {/* Desktop Navbar */}
        <div className="hidden items-center gap-1 md:flex">

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}

          <Separator
            orientation="vertical"
            className="mx-2 h-5 bg-white/20"
          />

          {!isPending && (
            isLoggedIn ? (
              <>
                <span className="px-2 text-sm text-neutral-300">
                  {session.user.email}
                </span>

                <Button
                  onClick={handleSignOut}
                  className="h-8 bg-indigo-500 text-white hover:bg-indigo-400"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <SignInLink className="px-2 text-sm font-medium text-indigo-400 hover:text-indigo-300" />

                <GetStartedButton className="h-8 bg-indigo-500 text-white hover:bg-indigo-400" />
              </>
            )
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger
            render={
              <Button
                size="icon"
                aria-label="Open menu"
                className="bg-transparent text-white hover:bg-white/10 md:hidden"
              />
            }
          >
            <MenuIcon />
          </SheetTrigger>

          <SheetContent className="bg-neutral-950 text-white">

            <SheetTitle className="sr-only">
              Navigation menu
            </SheetTitle>

            {/* Mobile Logo and Links */}
            <div className="flex flex-col gap-1 p-4">

              <SheetClose
                render={
                  <Link
                    href="/"
                    aria-label="HireLoop home"
                    className="mb-2 shrink-0"
                  />
                }
              >
                <Image
                  src={logoUrl}
                  alt="HireLoop"
                  className="h-8 w-auto"
                />
              </SheetClose>

              {navLinks.map((link) => (
                <SheetClose
                  key={link.href}
                  render={
                    <Link
                      href={link.href}
                      className="rounded-lg px-3 py-2 text-sm text-neutral-300 hover:bg-white/10 hover:text-white"
                    />
                  }
                >
                  {link.label}
                </SheetClose>
              ))}

            </div>

            {/* Mobile Auth Actions */}
            <div className="mt-auto flex flex-col gap-3 border-t border-white/10 p-4">

              {!isPending && (
                isLoggedIn ? (
                  <>
                    <p className="text-center text-sm text-neutral-300">
                      Signed in as{" "}
                      <span className="font-medium text-white">
                        {session.user.email}
                      </span>
                    </p>

                    <SheetClose
                      render={
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full rounded-lg bg-indigo-500 px-3 py-2 text-center text-sm font-medium text-white hover:bg-indigo-400"
                        >
                          Sign Out
                        </button>
                      }
                    />
                  </>
                ) : (
                  <>
                    <SheetClose
                      render={
                        <Link
                          href="/sign-in"
                          className="rounded-lg px-3 py-2 text-center text-sm font-medium text-indigo-400 hover:bg-white/10"
                        />
                      }
                    >
                      Sign In
                    </SheetClose>

                    <SheetClose
                      render={
                        <Link
                          href="/sign-up"
                          className="rounded-lg bg-indigo-500 px-3 py-2 text-center text-sm font-medium text-white hover:bg-indigo-400"
                        />
                      }
                    >
                      Get Started
                    </SheetClose>
                  </>
                )
              )}

            </div>
          </SheetContent>
        </Sheet>

      </nav>
    </header>
  )
}
