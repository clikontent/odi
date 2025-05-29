"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, MapPin, Clock, DollarSign, Briefcase, Crown, ExternalLink, Lock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getUserSubscription } from "@/lib/subscription"
import type { JobPosting, Subscription } from "@/lib/types"
import Link from "next/link"

export default function JobBoardPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [externalJobs, setExternalJobs] = useState<JobPosting[]>([])
  const [filteredJobs, setFilteredJobs] = useState<JobPosting[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [jobTypeFilter, setJobTypeFilter] = useState("all")
  const [experienceFilter, setExperienceFilter] = useState("all")
  const [showPrivateJobs, setShowPrivateJobs] = useState(0)

  useEffect(() => {
    fetchJobsAndSubscription()
  }, [user])

  useEffect(() => {
    filterJobs()
  }, [jobs, externalJobs, searchTerm, locationFilter, jobTypeFilter, experienceFilter])

  const fetchJobsAndSubscription = async () => {
    try {
      let subData = null
      if (user) {
        subData = await getUserSubscription(user.id)
        setSubscription(subData)
      }

      const { data, error } = await supabase
        .from("job_postings")
        .select("*")
        .eq("is_active", true)
        .order("posted_date", { ascending: false })

      if (error) throw error

      const allJobs = data || []
      const publicJobs = allJobs.filter((job) => !job.is_private)
      const privateJobs = allJobs.filter((job) => job.is_private)

      setJobs(allJobs)
      setShowPrivateJobs(privateJobs.length)

      await fetchExternalJobs()
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchExternalJobs = async () => {
    try {
      const results: JobPosting[] = []

      // Their Stack
      const stackRes = await fetch('https://api.theirstack.com/v1/jobs/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJvZGltYW9zY2FyQGdtYWlsLmNvbSIsInBlcm1pc3Npb25zIjoidXNlciIsImNyZWF0ZWRfYXQiOiIyMDI1LTA1LTI4VDEwOjE3OjUyLjYyMDE1NSswMDowMCJ9.f1qCuZpYvWGLGQ9fFu76D13aZQT1LZZgDecXA0IHkU0'
        },
        body: JSON.stringify({
          order_by: [
            { desc: true, field: 'date_posted' },
            { desc: true, field: 'discovered_at' }
          ],
          limit: 25,
          posted_at_max_age_days: 7
        })
      })
      const stackData = await stackRes.json()
      results.push(...(stackData.jobs || []).map((job: any) => ({
        id: job.id,
        job_title: job.title,
        company_name: job.company,
        description: job.description || '',
        posted_date: job.date || new Date().toISOString(),
        location: job.location || 'Remote',
        job_type: 'remote',
        experience_level: 'mid',
        salary_range: job.salary || '',
        skills_required: job.skills || [],
        is_private: false,
        is_featured: false,
        external_url: job.url,
      })))

      // Active Jobs
      const activeRes = await fetch('https://active-jobs-db.p.rapidapi.com/active-ats-24h?limit=10&offset=0&title_filter=%22Data%20Engineer%22&location_filter=%22United%20States%22%20OR%20%22United%20Kingdom%22&description_type=text', {
        headers: {
          'x-rapidapi-key': '157f53683amshb93ded32c4223aap1d45c3jsn9ba4cb60b544',
          'x-rapidapi-host': 'active-jobs-db.p.rapidapi.com'
        }
      })
      const activeData = await activeRes.json()
      results.push(...(activeData.data || []).map((job: any) => ({
        id: job.id,
        job_title: job.title,
        company_name: job.company_name,
        description: job.description || '',
        posted_date: job.posted_at || new Date().toISOString(),
        location: job.location || 'Remote',
        job_type: 'remote',
        experience_level: 'mid',
        salary_range: job.salary || '',
        skills_required: job.skills || [],
        is_private: false,
        is_featured: false,
        external_url: job.job_url,
      })))

      // Upwork Jobs
      const upworkRes = await fetch('https://upwork-jobs-api2.p.rapidapi.com/active-freelance-24h?limit=10', {
        headers: {
          'x-rapidapi-key': '157f53683amshb93ded32c4223aap1d45c3jsn9ba4cb60b544',
          'x-rapidapi-host': 'upwork-jobs-api2.p.rapidapi.com'
        }
      })
      const upworkData = await upworkRes.json()
      results.push(...(upworkData.jobs || []).map((job: any) => ({
        id: job.id,
        job_title: job.title,
        company_name: 'Upwork Client',
        description: job.description || '',
        posted_date: job.date_posted || new Date().toISOString(),
        location: 'Remote',
        job_type: 'contract',
        experience_level: 'entry',
        salary_range: job.budget || '',
        skills_required: job.skills || [],
        is_private: false,
        is_featured: false,
        external_url: job.url,
      })))

      setExternalJobs(results)
    } catch (error) {
      console.error("Error fetching external jobs:", error)
    }
  }

  const filterJobs = () => {
    let combined = [...jobs, ...externalJobs]

    if (!user || !subscription || subscription.plan_type === "free") {
      combined = combined.filter((job) => !job.is_private)
    }

    if (searchTerm) {
      combined = combined.filter(
        (job) =>
          job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (locationFilter) {
      combined = combined.filter((job) => job.location?.toLowerCase().includes(locationFilter.toLowerCase()))
    }

    if (jobTypeFilter !== "all") {
      combined = combined.filter((job) => job.job_type === jobTypeFilter)
    }

    if (experienceFilter !== "all") {
      combined = combined.filter((job) => job.experience_level === experienceFilter)
    }

    setFilteredJobs(combined)
  }

  // (rest of the component remains unchanged)
}
