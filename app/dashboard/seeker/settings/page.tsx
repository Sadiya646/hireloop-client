"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BellIcon,
  CameraIcon,
  CheckCircle2Icon,
  FileTextIcon,
  Loader2Icon,
  LogOutIcon,
  MapPinIcon,
  PhoneIcon,
  SaveIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react"

import { signOut, userSession } from "@/lib/auth-client"

interface SeekerProfile {
  name: string
  avatar: string
  phone: string
  location: string
  headline: string
  resumeUrl: string
  bio: string
  openToWork: boolean
  emailAlerts: boolean
  remoteOnly: boolean
}

const DEFAULT_PROFILE: SeekerProfile = {
  name: "",
  avatar: "",
  phone: "",
  location: "",
  headline: "",
  resumeUrl: "",
  bio: "",
  openToWork: true,
  emailAlerts: true,
  remoteOnly: false,
}

const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY

export default function SeekerSettingsPage() {
  const router = useRouter()
  const { data: session } = userSession()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const userEmail = session?.user?.email || ""
  const storageKey = userEmail
    ? `hireloop_seeker_settings_${userEmail}`
    : "hireloop_seeker_settings"

  const [profile, setProfile] = useState<SeekerProfile>(DEFAULT_PROFILE)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [savedMessage, setSavedMessage] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)

  // সেশন ও লোকাল স্টোরেজ থেকে সেভ করা ডেটা লোড
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProfile({
          ...DEFAULT_PROFILE,
          ...parsed,
          name: parsed.name || session?.user?.name || "",
          avatar: parsed.avatar || session?.user?.image || "",
        })
      } else {
        setProfile((prev) => ({
          ...prev,
          name: session?.user?.name || "",
          avatar: session?.user?.image || "",
        }))
      }
    } catch {
      // ignore storage errors
    }
  }, [storageKey, session?.user?.name, session?.user?.image])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleToggle = (key: "openToWork" | "emailAlerts" | "remoteOnly") => {
    setProfile((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // ImgBB-তে ইমেজ আপলোড
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageError(null)

    if (!IMGBB_API_KEY) {
      setImageError("ImgBB API key is missing in .env.local")
      return
    }

    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image file (JPG, PNG, WEBP).")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image size must be under 5MB.")
      return
    }

    try {
      setUploadingImage(true)
      const formData = new FormData()
      formData.append("image", file)

      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formData,
        }
      )

      const data = await res.json()

      if (!res.ok || !data?.success) {
        throw new Error(data?.error?.message || "Image upload failed")
      }

      const imageUrl = data.data.display_url || data.data.url
      setProfile((prev) => ({ ...prev, avatar: imageUrl }))
    } catch (err) {
      console.error("ImgBB upload error:", err)
      setImageError("Failed to upload image. Please try again.")
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveImage = () => {
    setProfile((prev) => ({ ...prev, avatar: "" }))
    setImageError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      localStorage.setItem(storageKey, JSON.stringify(profile))
      setSavedMessage(true)
      setTimeout(() => setSavedMessage(false), 2500)
    } catch (error) {
      console.error("Failed to save settings:", error)
      setImageError("Could not save settings.")
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/sign-in")
    router.refresh()
  }

  const initials = (profile.name || session?.user?.name || "JS")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-screen bg-[#0f1014] p-6 text-white sm:p-8">
      {/* Breadcrumb */}
      <div className="mb-2 flex items-center gap-2 text-xs font-medium">
        <span className="text-neutral-400">Candidate</span>
        <span className="text-neutral-600"></span>
        <span className="text-indigo-400">Account Settings</span>
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Settings
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Manage your candidate profile, photo, default resume link, and job
            alert preferences.
          </p>
        </div>

        {savedMessage && (
          <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-400">
            <CheckCircle2Icon className="size-4" />
            Changes saved successfully
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="max-w-4xl space-y-6">
        {/* Profile Card */}
        <section className="rounded-2xl border border-white/10 bg-[#14151b] p-6">
          {/* Avatar Upload Row */}
          <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name || "Profile"}
                    className={`size-16 rounded-full border border-white/15 object-cover ${
                      uploadingImage ? "opacity-50" : ""
                    }`}
                  />
                ) : (
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-sky-500 text-lg font-bold text-white">
                    {initials}
                  </div>
                )}

                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  title="Change profile photo"
                  className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border border-[#14151b] bg-indigo-500 text-white shadow transition hover:bg-indigo-400 disabled:opacity-60"
                >
                  {uploadingImage ? (
                    <Loader2Icon className="size-3.5 animate-spin" />
                  ) : (
                    <CameraIcon className="size-3.5" />
                  )}
                </button>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Profile Information
                </h2>
                <p className="text-xs text-neutral-400">
                  {uploadingImage
                    ? "Uploading image to ImgBB..."
                    : "JPG, PNG or WEBP. Max size 5MB."}
                </p>
                {imageError && (
                  <p className="mt-1 text-xs text-red-400">{imageError}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <button
                type="button"
                disabled={uploadingImage}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-[#191a22] px-3.5 text-xs font-medium text-neutral-200 transition hover:border-white/20 hover:bg-white/10 disabled:opacity-50"
              >
                {uploadingImage ? (
                  <>
                    <Loader2Icon className="size-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CameraIcon className="size-3.5" />
                    Upload Photo
                  </>
                )}
              </button>

              {profile.avatar && !uploadingImage && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
                >
                  <Trash2Icon className="size-3.5" />
                  Remove
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Full Name */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-300">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="h-10 w-full rounded-xl border border-white/10 bg-[#191a22] pr-3.5 pl-10 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-300">
                Email Address
              </label>
              <input
                type="email"
                value={userEmail}
                disabled
                className="h-10 w-full cursor-not-allowed rounded-xl border border-white/10 bg-[#111217] px-3.5 text-sm text-neutral-400 outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-300">
                Phone Number
              </label>
              <div className="relative">
                <PhoneIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-500" />
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="+880 1XXX-XXXXXX"
                  className="h-10 w-full rounded-xl border border-white/10 bg-[#191a22] pr-3.5 pl-10 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-300">
                Location
              </label>
              <div className="relative">
                <MapPinIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  name="location"
                  value={profile.location}
                  onChange={handleChange}
                  placeholder="Dhaka, Bangladesh"
                  className="h-10 w-full rounded-xl border border-white/10 bg-[#191a22] pr-3.5 pl-10 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Professional Headline */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-300">
                Professional Headline
              </label>
              <input
                type="text"
                name="headline"
                value={profile.headline}
                onChange={handleChange}
                placeholder="e.g. Full Stack Developer (Next.js & Node.js)"
                className="h-10 w-full rounded-xl border border-white/10 bg-[#191a22] px-3.5 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-indigo-500"
              />
            </div>

            {/* Default Resume Link */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-300">
                Default Resume / Portfolio URL
              </label>
              <div className="relative">
                <FileTextIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-neutral-500" />
                <input
                  type="url"
                  name="resumeUrl"
                  value={profile.resumeUrl}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/your-resume"
                  className="h-10 w-full rounded-xl border border-white/10 bg-[#191a22] pr-3.5 pl-10 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Short Bio */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-neutral-300">
                Short Bio
              </label>
              <textarea
                name="bio"
                rows={3}
                value={profile.bio}
                onChange={handleChange}
                placeholder="Briefly describe your skills, experience, and the roles you are looking for..."
                className="w-full rounded-xl border border-white/10 bg-[#191a22] p-3.5 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </section>

        {/* Preferences & Notifications Card */}
        <section className="rounded-2xl border border-white/10 bg-[#14151b] p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <BellIcon className="size-5 text-indigo-400" />
            <div>
              <h2 className="text-lg font-semibold text-white">
                Job Preferences & Notifications
              </h2>
              <p className="text-xs text-neutral-400">
                Control your availability and email updates.
              </p>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {[
              {
                key: "openToWork" as const,
                title: "Open to Work",
                desc: "Let recruiters know you are actively looking for new opportunities.",
              },
              {
                key: "emailAlerts" as const,
                title: "Application Status Alerts",
                desc: "Receive updates when recruiters shortlist or schedule interviews.",
              },
              {
                key: "remoteOnly" as const,
                title: "Prefer Remote Roles",
                desc: "Highlight remote-friendly positions in your job feed.",
              },
            ].map((item) => {
              const active = profile[item.key]
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {item.title}
                    </p>
                    <p className="text-xs text-neutral-400">{item.desc}</p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={active}
                    onClick={() => handleToggle(item.key)}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                      active ? "bg-indigo-500" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                        active ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        {/* Bottom Actions */}
        <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 text-xs font-semibold text-red-400 transition hover:bg-red-500/20"
          >
            <LogOutIcon className="size-4" />
            Sign Out
          </button>

          <button
            type="submit"
            disabled={saving || uploadingImage}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50"
          >
            <SaveIcon className="size-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  )
}