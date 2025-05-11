import * as React from "react"
import { Loader2 } from "lucide-react"

export function Loading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center" suppressHydrationWarning>
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  )
}
