// lib/fetch-jobs.ts
export async function fetchExternalJobs() {
  let results: any[] = []

  // Their Stack
  try {
    const stackRes = await fetch('https://api.theirstack.com/v1/jobs/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: process.env.THEIRSTACK_API_KEY!,
      },
      body: JSON.stringify({
        order_by: [
          { desc: true, field: 'date_posted' },
          { desc: true, field: 'discovered_at' },
        ],
        limit: 25,
        posted_at_max_age_days: 7,
      }),
      cache: 'no-store',
    })
    const stackData = await stackRes.json()
    results.push(
      ...(stackData.jobs || []).map((job: any) => ({
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
      }))
    )
  } catch (error) {
    console.error('Their Stack API error:', error)
  }

  // Active Jobs DB
  try {
    const activeRes = await fetch(
      'https://active-jobs-db.p.rapidapi.com/active-ats-24h?limit=10&offset=0&title_filter=%22Data%20Engineer%22&location_filter=%22United%20States%22%20OR%20%22United%20Kingdom%22&description_type=text',
      {
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
          'x-rapidapi-host': 'active-jobs-db.p.rapidapi.com',
        },
        cache: 'no-store',
      }
    )
    const activeData = await activeRes.json()
    results.push(
      ...(activeData.data || []).map((job: any) => ({
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
      }))
    )
  } catch (error) {
    console.error('Active Jobs API error:', error)
  }

  // Upwork Jobs
  try {
    const upworkRes = await fetch(
      'https://upwork-jobs-api2.p.rapidapi.com/active-freelance-24h?limit=10',
      {
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
          'x-rapidapi-host': 'upwork-jobs-api2.p.rapidapi.com',
        },
        cache: 'no-store',
      }
    )
    const upworkData = await upworkRes.json()
    results.push(
      ...(upworkData.jobs || []).map((job: any) => ({
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
      }))
    )
  } catch (error) {
    console.error('Upwork API error:', error)
  }

  return results
}
