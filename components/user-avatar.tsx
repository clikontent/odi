"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"

interface UserAvatarProps {
  userId?: string
  size?: "sm" | "md" | "lg"
}

export function UserAvatar({ userId, size = "md" }: UserAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [initials, setInitials] = useState<string>("U")
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchUserProfile() {
      if (!userId) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        userId = user.id
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url, full_name, email")
        .eq("id", userId)
        .single()

      if (profile) {
        setAvatarUrl(profile.avatar_url)

        // Generate initials from name or email
        if (profile.full_name) {
          const nameParts = profile.full_name.split(" ")
          if (nameParts.length >= 2) {
            setInitials(`${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase())
          } else if (nameParts[0]) {
            setInitials(nameParts[0][0].toUpperCase())
          }
        } else if (profile.email) {
          setInitials(profile.email[0].toUpperCase())
        }
      }
    }

    fetchUserProfile()
  }, [userId, supabase])

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  }

  return (
    <Avatar className={sizeClasses[size]}>
      {avatarUrl ? <AvatarImage src={avatarUrl || "/placeholder.svg"} alt="User avatar" /> : null}
      <AvatarFallback className="bg-primary text-primary-foreground">
        {initials || <User className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  )
}
