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
import { request } from 'undici'


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

      // Fetch external jobs
      fetchExternalJobs()

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
    const { statusCode, body } = await request('https://api.theirstack.com/v1/jobs/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer asdfasd'
  },
  body: JSON.stringify({
    order_by: [{
      desc: true,
      field: 'date_posted'
    },   {
      desc: true,
      field: 'discovered_at'
    }],
    offset: 0,
    page: 0,
    limit: 25,
    job_title_or: [],
    job_title_not: [],
    job_title_pattern_and: [],
    job_title_pattern_or: [],
    job_title_pattern_not: [],
    job_country_code_or: [],
    job_country_code_not: [],
    posted_at_max_age_days: 7,
    job_description_pattern_or: [],
    job_description_pattern_not: [],
    job_description_pattern_is_case_insensitive: true,
    job_id_or: [],
    job_id_not: [],
    job_ids: [],
    job_seniority_or: [],
    job_technology_slug_or: [],
    job_technology_slug_not: [],
    job_technology_slug_and: [],
    job_location_pattern_or: [],
    job_location_pattern_not: [],
    url_domain_or: [],
    url_domain_not: [],
    scraper_name_pattern_or: [],
    company_name_or: [],
    company_name_case_insensitive_or: [],
    company_id_or: [],
    company_domain_or: [],
    company_domain_not: [],
    company_name_not: [],
    company_name_partial_match_or: [],
    company_name_partial_match_not: [],
    company_linkedin_url_or: [],
    company_description_pattern_or: [],
    company_description_pattern_not: [],
    company_description_pattern_accent_insensitive: false,
    funding_stage_or: [],
    industry_or: [],
    industry_not: [],
    industry_id_or: [],
    industry_id_not: [],
    company_tags_or: [],
    company_investors_or: [],
    company_investors_partial_match_or: [],
    company_technology_slug_or: [],
    company_technology_slug_and: [],
    company_technology_slug_not: [],
    only_yc_companies: false,
    company_location_pattern_or: [],
    company_country_code_or: [],
    company_country_code_not: [],
    company_list_id_or: [],
    company_list_id_not: [],
    include_total_results: false,
    blur_company_data: false
  })
})

      // Active Jobs
      const http = require('https');

const options = {
	method: 'GET',
	hostname: 'active-jobs-db.p.rapidapi.com',
	port: null,
	path: '/active-ats-24h?limit=10&offset=0&title_filter=%22Data%20Engineer%22&location_filter=%22United%20States%22%20OR%20%22United%20Kingdom%22&description_type=text',
	headers: {
		'x-rapidapi-key': '157f53683amshb93ded32c4223aap1d45c3jsn9ba4cb60b544',
		'x-rapidapi-host': 'active-jobs-db.p.rapidapi.com'
	}
};

const req = http.request(options, function (res) {
	const chunks = [];

	res.on('data', function (chunk) {
		chunks.push(chunk);
	});

	res.on('end', function () {
		const body = Buffer.concat(chunks);
		console.log(body.toString());
	});
});

req.end();

      // Upwork Jobs
     const http = require('https');

const options = {
	method: 'GET',
	hostname: 'upwork-jobs-api2.p.rapidapi.com',
	port: null,
	path: '/active-freelance-24h?limit=10',
	headers: {
		'x-rapidapi-key': '157f53683amshb93ded32c4223aap1d45c3jsn9ba4cb60b544',
		'x-rapidapi-host': 'upwork-jobs-api2.p.rapidapi.com'
	}
};

const req = http.request(options, function (res) {
	const chunks = [];

	res.on('data', function (chunk) {
		chunks.push(chunk);
	});

	res.on('end', function () {
		const body = Buffer.concat(chunks);
		console.log(body.toString());
	});
});

req.end();

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
          job.description.toLowerCase().includes(searchTerm.toLowerCase()),
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

  // Fetch all active jobs (both public and private)
      const { data, error } = await supabase
        .from("job_postings")
        .select("*")
        .eq("is_active", true)
        .order("posted_date", { ascending: false })

      if (error) throw error

      const allJobs = data || []

      // Separate public and private jobs for display
      const publicJobs = allJobs.filter((job) => !job.is_private)
      const privateJobs = allJobs.filter((job) => job.is_private)

      setJobs(allJobs)
      setShowPrivateJobs(privateJobs.length)
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterJobs = () => {
    let filtered = jobs

    // Filter based on user access level
    if (!user || !subscription || subscription.plan_type === "free") {
      // Free users and non-logged users only see public jobs
      filtered = filtered.filter((job) => !job.is_private)
    }
    // Premium and above can see all jobs (public + private)

    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (locationFilter) {
      filtered = filtered.filter((job) => job.location?.toLowerCase().includes(locationFilter.toLowerCase()))
    }

    if (jobTypeFilter !== "all") {
      filtered = filtered.filter((job) => job.job_type === jobTypeFilter)
    }

    if (experienceFilter !== "all") {
      filtered = filtered.filter((job) => job.experience_level === experienceFilter)
    }

    setFilteredJobs(filtered)
  }

  const canAccessPrivateJobs = () => {
    return user && subscription && subscription.plan_type !== "free"
  }

  const applyToJob = async (jobId: string) => {
    if (!user) {
      alert("Please sign in to apply for jobs")
      return
    }

    try {
      const job = jobs.find((j) => j.id === jobId)
      if (!job) return

      // Check if user can access this job
      if (job.is_private && !canAccessPrivateJobs()) {
        alert("This is a private job posting. Please upgrade to Premium or Professional to apply.")
        return
      }

      // Create job application
      const { error } = await supabase.from("job_applications").insert({
        user_id: user.id,
        job_posting_id: jobId,
        company_name: job.company_name,
        job_title: job.job_title,
        status: "applied",
        application_date: new Date().toISOString(),
      })

      if (error) throw error
      alert("Application submitted successfully!")
    } catch (error) {
      console.error("Error applying to job:", error)
      alert("Error submitting application")
    }
  }

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case "full-time":
        return "bg-green-100 text-green-800"
      case "part-time":
        return "bg-blue-100 text-blue-800"
      case "contract":
        return "bg-orange-100 text-orange-800"
      case "remote":
        return "bg-purple-100 text-purple-800"
      case "hybrid":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getExperienceColor = (level: string) => {
    switch (level) {
      case "entry":
        return "bg-green-100 text-green-800"
      case "mid":
        return "bg-blue-100 text-blue-800"
      case "senior":
        return "bg-purple-100 text-purple-800"
      case "executive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Job Board</h1>
        <p className="text-gray-600 mt-2">Discover opportunities tailored to your skills and experience</p>
      </div>

      {/* Access Level Info */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">
              Public Jobs ({filteredJobs.filter((j) => !j.is_private).length})
            </span>
          </div>
          {canAccessPrivateJobs() ? (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Private Jobs ({filteredJobs.filter((j) => j.is_private).length})
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Lock className="h-3 w-3 text-gray-400" />
              <span className="text-sm text-gray-400">{showPrivateJobs} Private Jobs (Premium Required)</span>
            </div>
          )}
        </div>

        {!canAccessPrivateJobs() && showPrivateJobs > 0 && (
          <Link href="/pricing">
            <Button size="sm" variant="outline">
              <Crown className="h-4 w-4 mr-2" />
              Unlock Private Jobs
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search jobs or companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>

            <Select value={experienceFilter} onValueChange={setExperienceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Experience Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="entry">Entry Level</SelectItem>
                <SelectItem value="mid">Mid Level</SelectItem>
                <SelectItem value="senior">Senior Level</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Banner for Free Users */}
      {(!user || !subscription || subscription.plan_type === "free") && showPrivateJobs > 0 && (
        <Alert className="mb-6 border-purple-200 bg-purple-50">
          <Crown className="h-4 w-4" />
          <AlertDescription>
            <strong>Unlock {showPrivateJobs} Exclusive Opportunities!</strong> Upgrade to Premium or Professional to
            access private job postings from top companies.
            <Link href="/pricing" className="ml-2 text-purple-600 hover:text-purple-700 font-medium">
              View Plans →
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Job Listings */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600 text-center">
                Try adjusting your search criteria or check back later for new opportunities.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{job.job_title}</h3>
                      {job.is_private && (
                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                          <Crown className="h-3 w-3 mr-1" />
                          Private
                        </Badge>
                      )}
                      {job.is_featured && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Featured</Badge>
                      )}
                    </div>

                    <p className="text-lg text-gray-700 mb-3">{job.company_name}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                      {job.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(job.posted_date).toLocaleDateString()}
                      </div>
                      {job.salary_range && (
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {job.salary_range}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className={getJobTypeColor(job.job_type)}>{job.job_type}</Badge>
                      <Badge className={getExperienceColor(job.experience_level)}>{job.experience_level}</Badge>
                      {job.skills_required?.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <p className="text-gray-600 line-clamp-3">{job.description}</p>
                  </div>

                  <div className="flex flex-col space-y-2 mt-4 lg:mt-0 lg:ml-6">
                    {job.is_private && !canAccessPrivateJobs() ? (
                      <div className="text-center">
                        <Button disabled className="w-full lg:w-auto mb-2">
                          <Lock className="mr-2 h-4 w-4" />
                          Premium Required
                        </Button>
                        <Link href="/pricing">
                          <Button variant="outline" size="sm" className="w-full lg:w-auto">
                            Upgrade Plan
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <>
                        <Button onClick={() => applyToJob(job.id)} className="w-full lg:w-auto">
                          Apply Now
                        </Button>
                        {job.external_url && (
                          <Button variant="outline" asChild className="w-full lg:w-auto">
                            <a href={job.external_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Details
                            </a>
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Load More */}
      {filteredJobs.length > 0 && (
        <div className="text-center mt-8">
          <Button variant="outline">Load More Jobs</Button>
        </div>
      )}
    </div>
  )
}
}
