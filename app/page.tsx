import { Navbar } from "@/components/navbar"  
import { Hero } from "@/components/hero"     

export default function HomePage() {
  return (
    <div className="min-h-svh bg-neutral-950 text-white">
      <Navbar />
      <main>
        <Hero />
      </main>
    </div>
  )
}