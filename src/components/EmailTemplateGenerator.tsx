'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Mail, Copy, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EmailTemplate {
  subject: string;
  body: string;
  cta: string;
  personalization: {
    companyName?: string;
    contactName?: string;
    painPoints?: string[];
    valueProps?: string[];
  };
  variants?: Array<{
    subject: string;
    body: string;
    cta: string;
  }>;
}

export default function EmailTemplateGenerator() {
  const [prospectName, setProspectName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyDomain, setCompanyDomain] = useState('');
  const [role, setRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [emailType, setEmailType] = useState<'cold-outreach' | 'follow-up' | 'demo-invite' | 'objection-response'>('cold-outreach');
  const [tone, setTone] = useState<'professional' | 'friendly' | 'urgent' | 'consultative'>('professional');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!companyName.trim()) {
      setError('Company name is required');
      return;
    }

    setLoading(true);
    setError(null);
    setTemplate(null);

    try {
      const response = await fetch('/api/llm/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectName: prospectName.trim() || undefined,
          companyName: companyName.trim(),
          companyDomain: companyDomain.trim() || undefined,
          role: role.trim() || undefined,
          industry: industry.trim() || undefined,
          emailType,
          tone,
          context: context.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate email template');
      }

      const data = await response.json();
      setTemplate(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate email template');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            AI Email Template Generator
          </CardTitle>
          <CardDescription>
            Generate personalized email templates for your sales outreach
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="prospect-name">Prospect Name (optional)</Label>
              <Input
                id="prospect-name"
                placeholder="e.g., John"
                value={prospectName}
                onChange={(e) => setProspectName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="company-name">Company Name *</Label>
              <Input
                id="company-name"
                placeholder="e.g., Acme Corp"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="company-domain">Company Domain (optional)</Label>
              <Input
                id="company-domain"
                placeholder="e.g., acme.com"
                value={companyDomain}
                onChange={(e) => setCompanyDomain(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role">Role/Title (optional)</Label>
              <Input
                id="role"
                placeholder="e.g., VP of Engineering"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="industry">Industry (optional)</Label>
              <Input
                id="industry"
                placeholder="e.g., SaaS, FinTech"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email-type">Email Type</Label>
              <Select value={emailType} onValueChange={(v: any) => setEmailType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cold-outreach">Cold Outreach</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="demo-invite">Demo Invite</SelectItem>
                  <SelectItem value="objection-response">Objection Response</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={(v: any) => setTone(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="consultative">Consultative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {emailType === 'objection-response' && (
            <div>
              <Label htmlFor="context">Objection Context</Label>
              <Textarea
                id="context"
                placeholder="Describe the objection or concern..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Generate Email Template
              </>
            )}
          </Button>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {template && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Email Template</CardTitle>
            <CardDescription>
              Review and customize the generated template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Subject Line</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(template.subject)}
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg font-semibold">
                {template.subject}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Email Body</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(template.body)}
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-sm">
                {template.body}
              </div>
            </div>

            <div>
              <Label>Call-to-Action</Label>
              <div className="p-3 bg-blue-50 rounded-lg font-semibold text-blue-900">
                {template.cta}
              </div>
            </div>

            {template.personalization && (
              <div>
                <Label>Personalization Applied</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {template.personalization.companyName && (
                    <Badge variant="outline">Company: {template.personalization.companyName}</Badge>
                  )}
                  {template.personalization.contactName && (
                    <Badge variant="outline">Contact: {template.personalization.contactName}</Badge>
                  )}
                  {template.personalization.valueProps && template.personalization.valueProps.length > 0 && (
                    <Badge variant="outline">Value Props Included</Badge>
                  )}
                </div>
              </div>
            )}

            {template.variants && template.variants.length > 0 && (
              <div>
                <Label>A/B Test Variants</Label>
                <div className="space-y-3 mt-2">
                  {template.variants.map((variant, idx) => (
                    <Card key={idx} className="border-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Variant {idx + 1}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Subject</div>
                          <div className="text-sm font-semibold">{variant.subject}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">CTA</div>
                          <div className="text-sm">{variant.cta}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}











