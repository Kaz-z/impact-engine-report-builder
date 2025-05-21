"use client"

import Link from "next/link"
import { UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { getAuth, signOut } from 'firebase/auth'
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/context/authContext"

export default function Header() {
  const { user } = useAuth()
  const router = useRouter()

  const handleSignOut = () => {
    const auth = getAuth()
    signOut(auth)
      .then(() => {
        toast.success("Signed out successfully")
        router.push("/login")
      })
      .catch((error) => {
        console.error("Sign out failed", error)
        toast.error("Sign out failed")
      })
  }

  return (
    <header className="w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-orange-500/80 to-orange-600/80 w-8 h-8 rounded-md flex items-center justify-center text-white font-bold">
            IE
          </div>
          <span className="font-bold">Impact Engine</span>
        </Link>

        <div className="flex items-center">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserRound className="h-5 w-5 text-orange-500" />
                  <span className="sr-only">Profile menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex-col items-start">
                  <span className="text-sm font-medium">Signed in as:</span>
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
