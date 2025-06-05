import Link from "next/link"
import { UserAuthButton } from "@/components/user-auth-button"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">Nexus</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <UserAuthButton />
          </nav>
        </div>
      </div>
    </header>
  )
}
