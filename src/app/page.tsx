import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Music } from "lucide-react"

export default async function Home() {
  const session = await auth()

  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Music className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">TourManager</h1>
      </div>
      <p className="max-w-md text-center text-lg text-muted-foreground">
        Professional tour management for the live entertainment industry.
        Itineraries, venues, crew, and finances — all in one place.
      </p>
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/register">Get Started</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    </div>
  )
}
