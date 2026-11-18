const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export const createJob = async (data: FormData) => {
  // 1. FormData theke plain object banano
  const payload = Object.fromEntries(data.entries())

  const res = await fetch(`${BASE_URL}/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // 2. JSON.stringify diye proper JSON string pathano
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error("Failed to create job listing")
  }

  return res.json()
}



// Backend theke shob post kora job anar jonno
export const getJobs = async () => {
  const res = await fetch(`${BASE_URL}/jobs`, {
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch jobs")
  }

  return res.json()
}

// Backend theke job delete korar jonno
export const deleteJob = async (id: string) => {
  const res = await fetch(`${BASE_URL}/jobs/${id}`, {
    method: "DELETE",
  })

  if (!res.ok) {
    throw new Error("Failed to delete job")
  }

  return res.json()
}