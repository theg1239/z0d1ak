import Link from "next/link"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-black/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">z0d1ak</span>
        </Link>
        <nav className="ml-auto flex gap-4">
          <Link href="/dashboard">
            <Button variant="ghost">Dashboard</Button>
          </Link>
          {/* <Link href="/profile">
            <Button variant="ghost">Profile</Button>
          </Link> */}
        </nav>
      </div>
    </header>
  )
}

