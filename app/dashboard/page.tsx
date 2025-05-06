"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/contexts/user-context"

export default function Dashboard() {
  const { user } = useUser()
  const [recentResumes, setRecentResumes] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalResumes: 0,
    totalCoverLetters: 0,
    totalApplications: 0,
    completionRate: 0,
  })
  const [recentJobs, setRecentJobs] = useState([
    {
      id: 1,
      title: "Software Engineer",
      company: "Tech Innovations Ltd",
      location: "Nairobi, Kenya",
      salary: "KSh 120,000 - 180,000",
      posted: "2 days ago",
    },
    {
      id: 2,
      title: "Marketing Manager",
      company: "Global Marketing Solutions",
      location: "Mombasa, Kenya",
      salary: "KSh 100,000 - 150,000",
      posted: "3 days ago",
    },
    {
      id: 3,
      title: "Financial Analyst",
      company: "East African Bank",
      location: "Nairobi, Kenya",
      salary: "KSh 90,000 - 130,000",
      posted: "1 week ago",
    },
  ])

  // Determine features based on subscription tier
  const isPremium = user?.subscription_tier === "premium"
  const isCorporate = user?.subscription_tier === "corporate"
  const isFree = !isPremium && !isCorporate

  useEffect(() => {
    async function fetchData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Fetch recent resumes
          const { data
