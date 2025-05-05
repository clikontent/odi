import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"
import type { Database } from "../lib/database.types"

// Resume templates
const resumeTemplates = [
  {
    id: uuidv4(),
    name: "Modern",
    description: "A clean, modern resume template with a professional look",
    thumbnail_url: null,
    html_content: `
      <div class="resume">
        <div class="header">
          <h1>{{name}}</h1>
          <div class="contact-info">
            <p>{{email}} | {{phone}} | {{address}}</p>
          </div>
        </div>
        
        <div class="section">
          <h2>Professional Summary</h2>
          <p>{{summary}}</p>
        </div>
        
        <div class="section">
          <h2>Work Experience</h2>
          {{#each experience}}
          <div class="item">
            <div class="item-header">
              <h3>{{position}}</h3>
              <p class="company">{{company}}, {{location}}</p>
              <p class="date">{{startDate}} - {{endDate}}</p>
            </div>
            <p>{{description}}</p>
          </div>
          {{/each}}
        </div>
        
        <div class="section">
          <h2>Education</h2>
          {{#each education}}
          <div class="item">
            <div class="item-header">
              <h3>{{degree}} in {{fieldOfStudy}}</h3>
              <p class="school">{{school}}</p>
              <p class="date">{{startDate}} - {{endDate}}</p>
            </div>
            <p>{{description}}</p>
          </div>
          {{/each}}
        </div>
        
        <div class="section">
          <h2>Skills</h2>
          <div class="skills">
            {{#each skills}}
            <span class="skill">{{name}}</span>
            {{/each}}
          </div>
        </div>
      </div>
    `,
    css_content: `
      .resume {
        font-family: 'Arial', sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 30px;
        color: #333;
      }
      
      .header {
        text-align: center;
        margin-bottom: 30px;
      }
      
      .header h1 {
        font-size: 28px;
        margin-bottom: 10px;
        color: #2563eb;
      }
      
      .contact-info {
        font-size: 14px;
        color: #666;
      }
      
      .section {
        margin-bottom: 25px;
      }
      
      h2 {
        font-size: 18px;
        border-bottom: 2px solid #2563eb;
        padding-bottom: 5px;
        margin-bottom: 15px;
      }
      
      .item {
        margin-bottom: 20px;
      }
      
      .item-header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      
      h3 {
        font-size: 16px;
        margin: 0;
        flex: 1;
      }
      
      .company, .school {
        font-weight: bold;
        flex: 1;
      }
      
      .date {
        color: #666;
        font-size: 14px;
      }
      
      .skills {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      
      .skill {
        background-color: #e5edff;
        color: #2563eb;
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 14px;
      }
    `,
    js_content: null,
    category: "professional",
    is_premium: false,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "Professional",
    description: "A traditional resume template with a professional layout",
    thumbnail_url: null,
    html_content: `
      <div class="resume">
        <div class="header">
          <h1>{{name}}</h1>
          <div class="contact-info">
            <p>{{email}} | {{phone}} | {{address}}</p>
          </div>
        </div>
        
        <div class="section">
          <h2>Professional Summary</h2>
          <p>{{summary}}</p>
        </div>
        
        <div class="section">
          <h2>Work Experience</h2>
          {{#each experience}}
          <div class="item">
            <div class="item-header">
              <h3>{{position}}</h3>
              <p class="company">{{company}}, {{location}}</p>
              <p class="date">{{startDate}} - {{endDate}}</p>
            </div>
            <p>{{description}}</p>
          </div>
          {{/each}}
        </div>
        
        <div class="section">
          <h2>Education</h2>
          {{#each education}}
          <div class="item">
            <div class="item-header">
              <h3>{{degree}} in {{fieldOfStudy}}</h3>
              <p class="school">{{school}}</p>
              <p class="date">{{startDate}} - {{endDate}}</p>
            </div>
            <p>{{description}}</p>
          </div>
          {{/each}}
        </div>
        
        <div class="section">
          <h2>Skills</h2>
          <div class="skills">
            {{#each skills}}
            <span class="skill">{{name}}</span>
            {{/each}}
          </div>
        </div>
      </div>
    `,
    css_content: `
      .resume {
        font-family: 'Times New Roman', serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 30px;
        color: #333;
        border-top: 5px solid #333;
      }
      
      .header {
        text-align: center;
        margin-bottom: 30px;
      }
      
      .header h1 {
        font-size: 24px;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .contact-info {
        font-size: 14px;
        color: #666;
      }
      
      .section {
        margin-bottom: 25px;
      }
      
      h2 {
        font-size: 18px;
        border-bottom: 1px solid #333;
        padding-bottom: 5px;
        margin-bottom: 15px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .item {
        margin-bottom: 20px;
      }
      
      .item-header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      
      h3 {
        font-size: 16px;
        margin: 0;
        flex: 1;
      }
      
      .company, .school {
        font-weight: bold;
        flex: 1;
      }
      
      .date {
        color: #666;
        font-size: 14px;
      }
      
      .skills {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      
      .skill {
        background-color: #f5f5f5;
        padding: 5px 10px;
        border-radius: 3px;
        font-size: 14px;
      }
    `,
    js_content: null,
    category: "professional",
    is_premium: false,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "Creative",
    description: "A creative resume template with a modern design",
    thumbnail_url: null,
    html_content: `
      <div class="resume">
        <div class="header">
          <h1>{{name}}</h1>
          <div class="contact-info">
            <p>{{email}} | {{phone}} | {{address}}</p>
          </div>
        </div>
        
        <div class="section">
          <h2>Professional Summary</h2>
          <p>{{summary}}</p>
        </div>
        
        <div class="section">
          <h2>Work Experience</h2>
          {{#each experience}}
          <div class="item">
            <div class="item-header">
              <h3>{{position}}</h3>
              <p class="company">{{company}}, {{location}}</p>
              <p class="date">{{startDate}} - {{endDate}}</p>
            </div>
            <p>{{description}}</p>
          </div>
          {{/each}}
        </div>
        
        <div class="section">
          <h2>Education</h2>
          {{#each education}}
          <div class="item">
            <div class="item-header">
              <h3>{{degree}} in {{fieldOfStudy}}</h3>
              <p class="school">{{school}}</p>
              <p class="date">{{startDate}} - {{endDate}}</p>
            </div>
            <p>{{description}}</p>
          </div>
          {{/each}}
        </div>
        
        <div class="section">
          <h2>Skills</h2>
          <div class="skills">
            {{#each skills}}
            <span class="skill">{{name}}</span>
            {{/each}}
          </div>
        </div>
      </div>
    `,
    css_content: `
      .resume {
        font-family: 'Montserrat', sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 40px;
        color: #333;
        background-color: #fff;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      }
      
      .header {
        text-align: center;
        margin-bottom: 30px;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        margin: -40px -40px 30px -40px;
        padding: 40px;
        border-radius: 10px 10px 0 0;
        color: white;
      }
      
      .header h1 {
        font-size: 32px;
        margin-bottom: 10px;
        font-weight: 700;
      }
      
      .contact-info {
        font-size: 14px;
        opacity: 0.9;
      }
      
      .section {
        margin-bottom: 25px;
      }
      
      h2 {
        font-size: 20px;
        color: #6366f1;
        margin-bottom: 15px;
        position: relative;
        padding-bottom: 10px;
      }
      
      h2:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 50px;
        height: 3px;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      }
      
      .item {
        margin-bottom: 20px;
        padding-left: 20px;
        border-left: 2px solid #e5e7eb;
        position: relative;
      }
      
      .item:before {
        content: '';
        position: absolute;
        left: -6px;
        top: 0;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #6366f1;
      }
      
      .item-header {
        margin-bottom: 8px;
      }
      
      h3 {
        font-size: 18px;
        margin: 0 0 5px 0;
        color: #4b5563;
      }
      
      .company, .school {
        font-weight: 600;
        color: #6366f1;
        margin-bottom: 5px;
      }
      
      .date {
        color: #9ca3af;
        font-size: 14px;
        font-style: italic;
      }
      
      .skills {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      
      .skill {
        background-color: #ede9fe;
        color: #6366f1;
        padding: 8px 15px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s ease;
      }
      
      .skill:hover {
        background-color: #6366f1;
        color: white;
        transform: translateY(-2px);
      }
    `,
    js_content: null,
    category: "creative",
    is_premium: false,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Cover letter templates
const coverLetterTemplates = [
  {
    id: uuidv4(),
    name: "Professional",
    description: "A clean, professional cover letter template",
    thumbnail_url: null,
    html_content: `
      <div class="cover-letter">
        <div class="header">
          <div class="sender-info">
            <p>{{name}}</p>
            <p>{{address}}</p>
            <p>{{phone}}</p>
            <p>{{email}}</p>
          </div>
          <div class="date">
            <p>{{date}}</p>
          </div>
          <div class="recipient-info">
            <p>{{recipient_name}}</p>
            <p>{{recipient_title}}</p>
            <p>{{recipient_company}}</p>
            <p>{{recipient_address}}</p>
          </div>
        </div>
        
        <div class="salutation">
          <p>Dear {{recipient_name}},</p>
        </div>
        
        <div class="body">
          <p class="paragraph">{{opening}}</p>
          <p class="paragraph">{{body1}}</p>
          <p class="paragraph">{{body2}}</p>
          <p class="paragraph">{{closing}}</p>
        </div>
        
        <div class="signature">
          <p>Sincerely,</p>
          <p>{{name}}</p>
        </div>
      </div>
    `,
    css_content: `
      .cover-letter {
        font-family: 'Arial', sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 40px;
        color: #333;
        line-height: 1.5;
      }
      
      .header {
        margin-bottom: 30px;
      }
      
      .sender-info {
        margin-bottom: 20px;
      }
      
      .sender-info p, .recipient-info p, .date p {
        margin: 0;
        line-height: 1.5;
      }
      
      .date {
        margin-bottom: 20px;
      }
      
      .recipient-info {
        margin-bottom: 30px;
      }
      
      .salutation {
        margin-bottom: 20px;
      }
      
      .body {
        margin-bottom: 30px;
      }
      
      .paragraph {
        margin-bottom: 15px;
        text-align: justify;
      }
      
      .signature {
        margin-top: 30px;
      }
      
      .signature p:first-child {
        margin-bottom: 20px;
      }
    `,
    js_content: null,
    category: "professional",
    is_premium: false,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "Modern",
    description: "A modern cover letter template with a clean design",
    thumbnail_url: null,
    html_content: `
      <div class="cover-letter">
        <div class="header">
          <h1 class="name">{{name}}</h1>
          <div class="contact-info">
            <p>{{phone}} | {{email}} | {{address}}</p>
          </div>
        </div>
        
        <div class="date-section">
          <p>{{date}}</p>
        </div>
        
        <div class="recipient">
          <p>{{recipient_name}}</p>
          <p>{{recipient_title}}</p>
          <p>{{recipient_company}}</p>
          <p>{{recipient_address}}</p>
        </div>
        
        <div class="salutation">
          <p>Dear {{recipient_name}},</p>
        </div>
        
        <div class="content">
          <p>{{opening}}</p>
          <p>{{body1}}</p>
          <p>{{body2}}</p>
          <p>{{closing}}</p>
        </div>
        
        <div class="signature">
          <p>Sincerely,</p>
          <p class="sender-name">{{name}}</p>
        </div>
      </div>
    `,
    css_content: `
      .cover-letter {
        font-family: 'Helvetica', Arial, sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 40px;
        color: #333;
        line-height: 1.6;
      }
      
      .header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #2563eb;
        padding-bottom: 20px;
      }
      
      .name {
        font-size: 28px;
        margin: 0 0 10px 0;
        color: #2563eb;
      }
      
      .contact-info {
        font-size: 14px;
        color: #666;
      }
      
      .date-section {
        margin-bottom: 20px;
      }
      
      .recipient {
        margin-bottom: 20px;
      }
      
      .recipient p, .date-section p {
        margin: 0;
        line-height: 1.5;
      }
      
      .salutation {
        margin-bottom: 20px;
      }
      
      .content p {
        margin-bottom: 15px;
        text-align: justify;
      }
      
      .signature {
        margin-top: 30px;
      }
      
      .sender-name {
        font-weight: bold;
        margin-top: 20px;
      }
    `,
    js_content: null,
    category: "modern",
    is_premium: false,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: "Creative",
    description: "A creative cover letter template with a unique design",
    thumbnail_url: null,
    html_content: `
      <div class="cover-letter">
        <div class="header">
          <div class="name-container">
            <h1 class="name">{{name}}</h1>
          </div>
          <div class="contact-container">
            <p><span class="icon">📱</span> {{phone}}</p>
            <p><span class="icon">📧</span> {{email}}</p>
            <p><span class="icon">📍</span> {{address}}</p>
          </div>
        </div>
        
        <div class="main-content">
          <div class="date-recipient">
            <p class="date">{{date}}</p>
            <div class="recipient">
              <p>{{recipient_name}}</p>
              <p>{{recipient_title}}</p>
              <p>{{recipient_company}}</p>
              <p>{{recipient_address}}</p>
            </div>
          </div>
          
          <div class="letter-body">
            <p class="salutation">Dear {{recipient_name}},</p>
            
            <div class="paragraphs">
              <p>{{opening}}</p>
              <p>{{body1}}</p>
              <p>{{body2}}</p>
              <p>{{closing}}</p>
            </div>
            
            <div class="signature">
              <p>Sincerely,</p>
              <p class="sender-name">{{name}}</p>
            </div>
          </div>
        </div>
      </div>
    `,
    css_content: `
      .cover-letter {
        font-family: 'Montserrat', sans-serif;
        max-width: 800px;
        margin: 0 auto;
        color: #333;
        background-color: #fff;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      }
      
      .header {
        display: flex;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: white;
        padding: 30px;
      }
      
      .name-container {
        flex: 1;
      }
      
      .name {
        font-size: 32px;
        margin: 0;
        font-weight: 700;
      }
      
      .contact-container {
        flex: 1;
        text-align: right;
      }
      
      .contact-container p {
        margin: 5px 0;
      }
      
      .icon {
        margin-right: 5px;
      }
      
      .main-content {
        padding: 30px;
      }
      
      .date-recipient {
        display: flex;
        margin-bottom: 30px;
      }
      
      .date {
        flex: 1;
        font-weight: 500;
      }
      
      .recipient {
        flex: 1;
      }
      
      .recipient p, .date {
        margin: 0 0 5px 0;
      }
      
      .letter-body {
        line-height: 1.6;
      }
      
      .salutation {
        margin-bottom: 20px;
        font-weight: 500;
      }
      
      .paragraphs p {
        margin-bottom: 15px;
        text-align: justify;
      }
      
      .signature {
        margin-top: 30px;
      }
      
      .sender-name {
        font-weight: 600;
        color: #6366f1;
        margin-top: 15px;
      }
    `,
    js_content: null,
    category: "creative",
    is_premium: false,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

async function seedTemplates() {
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials")
    return
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseKey)

  try {
    // Insert resume templates
    const { error: resumeError } = await supabase
      .from("resume_templates")
      .upsert(resumeTemplates, { onConflict: "name" })

    if (resumeError) {
      throw resumeError
    }

    console.log(`Successfully seeded ${resumeTemplates.length} resume templates`)

    // Insert cover letter templates
    const { error: coverLetterError } = await supabase
      .from("cover_letter_templates")
      .upsert(coverLetterTemplates, { onConflict: "name" })

    if (coverLetterError) {
      throw coverLetterError
    }

    console.log(`Successfully seeded ${coverLetterTemplates.length} cover letter templates`)
  } catch (error) {
    console.error("Error seeding templates:", error)
  }
}

// Run the seed function
seedTemplates()
