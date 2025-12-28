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
  // Optional style diagnostics from the backend
  bbqScore?: {
    total: number;
    wordBand: number;
    buzzwords: number;
    structure: number;
    clarity: number;
  };
  issues?: Array<{
    type: string;
    severity: string;
    message: string;
  }>;
  style?: EmailStyle;
}

type EmailStyle = 'bbq_plain' | 'exec_concise';

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
  const [style, setStyle] = useState<EmailStyle>('bbq_plain');
  const [improving, setImproving] = useState(false);

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
          style,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to generate email template');
      }

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

  const handleImprove = async () => {
    if (!template) return;
    setImproving(true);
    try {
      const response = await fetch('/api/llm/bbq-rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original: template.body,
          style,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to improve email');
      }

      setTemplate((prev) =>
        prev
          ? {
              ...prev,
              body: data.rewritten || prev.body,
              bbqScore: data.bbqScore || prev.bbqScore,
              // keep full issue objects if present
              issues: data.lintAfter?.issues || prev.issues,
            }
          : prev
      );
    } catch (err: any) {
      setError(err.message || 'Failed to improve email');
    } finally {
      setImproving(false);
    }
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
            Generate personalized sales emails optimized for Gong-style best practices:
            ~50–75 words, no fluff, one clear interest-based CTA, and short, internal-style subject lines.
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
            <div>
              <Label htmlFor="style">Email Style</Label>
              <Select value={style} onValueChange={(v: any) => setStyle(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bbq_plain">BBQ plain (conversational)</SelectItem>
                  <SelectItem value="exec_concise">Exec concise (short &amp; direct)</SelectItem>
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
            {(template.style || template.bbqScore) && (
              <div className="text-xs text-gray-600 flex flex-wrap gap-3 items-center">
                {template.style && (
                  <span>
                    Style:{' '}
                    <span className="font-medium">
                      {template.style === 'bbq_plain' ? 'BBQ plain' : 'Exec concise'}
                    </span>
                  </span>
                )}
                {template.bbqScore && (
                  <span>
                    BBQ Score:{' '}
                    <span className="font-semibold">
                      {template.bbqScore.total}/100
                    </span>
                  </span>
                )}
                {template.issues && template.issues.length > 0 && (
                  <span>
                    Notes:{' '}
                    {template.issues
                      .slice(0, 2)
                      .map((i) => i.message)
                      .join(' • ')}
                  </span>
                )}
              </div>
            )}

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
                <div className="flex items-center gap-2">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleImprove}
                    disabled={improving}
                  >
                    {improving ? 'Improving…' : 'Improve with BBQ-it'}
                  </Button>
                </div>
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















