"use client"

import { useState } from "react"
import Link from "next/link"
import { User } from "lucide-react"
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

interface HeaderProps {
  userEmail?: string
}

export default function Header({ userEmail = "user@example.com" }: HeaderProps) {
  const [isSignedIn, setIsSignedIn] = useState(!!userEmail)
  const router = useRouter()
  const handleSignOut = () => {
    const auth = getAuth()
    signOut(auth)
      .then(() => {
        setIsSignedIn(false)
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span className="font-bold">Impact Engine</span>
        </Link>

        <div className="flex items-center">
          {isSignedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Profile menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex-col items-start">
                  <span className="text-sm font-medium">Signed in as:</span>
                  <span className="text-sm text-muted-foreground">{userEmail}</span>
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
