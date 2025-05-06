"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Save, Sparkles, Eye, CreditCard, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { generateCoverLetter, trackAIUsage } from "@/lib/gemini";
import { getCoverLetterTemplates } from "@/lib/templates";
import type { CoverLetterTemplate } from "@/lib/supabase";

export default function CoverLetterGenerator() {
  const [coverLetterTitle, setCoverLetterTitle] = useState("My Cover Letter");
  const [jobInfo, setJobInfo] = useState({ companyName: "", jobTitle: "", hiringManager: "", jobDescription: "" });
  const [personalInfo, setPersonalInfo] = useState({ fullName: "", email: "", phone: "", address: "", relevantExperience: "" });
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<CoverLetterTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const { data } = await supabase.auth.getUser();
        const isPremiumUser = !!data?.user;
        if (data?.user) setUserId(data.user.id);
        const templates = await getCoverLetterTemplates(isPremiumUser);
        if (templates && templates.length > 0) {
          setTemplates(templates);
          setSelectedTemplateId(templates[0].id);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  const handleJobInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJobInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  const generateCoverLetterContent = async () => {
    if (!userId || !jobInfo.companyName || !jobInfo.jobTitle || !personalInfo.fullName) {
      alert("Please fill in the required fields: Company Name, Job Title, and Full Name");
      return;
    }
    setIsGenerating(true);
    try {
      const skills = personalInfo.relevantExperience
        .split(/[,.]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && s.length < 30);

      const coverLetterText = await generateCoverLetter(
        jobInfo.jobTitle,
        jobInfo.companyName,
        jobInfo.jobDescription,
        personalInfo.relevantExperience,
        skills
      );
      setGeneratedCoverLetter(coverLetterText);

      if (selectedTemplateId) {
        const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
        if (selectedTemplate) {
          let html = selectedTemplate.html_content;
          html = html.replace(/{{personal.firstName}}/g, personalInfo.fullName.split(" ")[0] || "");
          html = html.replace(/{{personal.lastName}}/g, personalInfo.fullName.split(" ").slice(1).join(" ") || "");
          html = html.replace(/{{personal.fullName}}/g, personalInfo.fullName || "");
          html = html.replace(/{{personal.email}}/g, personalInfo.email || "");
          html = html.replace(/{{personal.phone}}/g, personalInfo.phone || "");
          html = html.replace(/{{personal.address}}/g, personalInfo.address || "");
          html = html.replace(/{{date}}/g, new Date().toLocaleDateString());
          html = html.replace(/{{recipient.name}}/g, jobInfo.hiringManager || "Hiring Manager");
          html = html.replace(/{{recipient.title}}/g, "Hiring Manager");
          html = html.replace(/{{recipient.company}}/g, jobInfo.companyName || "");
          html = html.replace(/{{recipient.address}}/g, "");

          const paragraphs = coverLetterText.split("\n\n");
          html = html.replace(/{{opening}}/g, paragraphs[0] || "");
          html = html.replace(/{{body1}}/g, paragraphs[1] || "");
          html = html.replace(/{{body2}}/g, paragraphs[2] || "");
          html = html.replace(/{{closing}}/g, paragraphs[3] || "");

          if (selectedTemplate.css_content) {
            html = `<style>${selectedTemplate.css_content}</style>` + html;
          }

          setPreviewHtml(html);
        }
      }
      await trackAIUsage(userId, "generate_cover_letter", 500);
    } catch (error) {
      console.error("Error generating cover letter:", error);
      alert("Failed to generate cover letter. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveCoverLetter = async () => {
    if (!userId) {
      alert("You must be logged in to save a cover letter");
      return;
    }
    try {
      const content = { jobInfo, personalInfo, generatedText: generatedCoverLetter };
      const { error } = await supabase.from("cover_letters").insert({
        user_id: userId,
        title: coverLetterTitle,
        content,
        template_id: selectedTemplateId,
        is_public: false,
      });
      if (error) throw error;
      alert("Cover letter saved successfully!");
    } catch (error) {
      console.error("Error saving cover letter:", error);
      alert("Failed to save cover letter. Please try again.");
    }
  };

  const downloadCoverLetter = () => {
    const blob = new Blob([previewHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${coverLetterTitle.replace(/\s+/g, "_")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const togglePreviewMode = () => setPreviewMode(!previewMode);

  return <DashboardLayout>{/* ... JSX retained */}</DashboardLayout>;
}
