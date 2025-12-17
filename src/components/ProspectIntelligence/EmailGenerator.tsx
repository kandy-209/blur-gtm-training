'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Mail, Copy, Download, Sparkles, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ProspectIntelligence } from '@/lib/prospect-intelligence/types';

interface EmailGeneratorProps {
  prospectData: ProspectIntelligence;
}

type EmailTone = 'professional' | 'friendly' | 'direct' | 'consultative';
type LLMProvider = 'claude' | 'gemini';

export function EmailGenerator({ prospectData }: EmailGeneratorProps) {
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [tone, setTone] = useState<EmailTone>('professional');
  const [llmProvider, setLlmProvider] = useState<LLMProvider>('claude');
  const [recipientName, setRecipientName] = useState('');
  const [recipientTitle, setRecipientTitle] = useState('');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const generateEmail = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/prospect-intelligence/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prospectData,
          tone,
          llmProvider,
          recipientName: recipientName || undefined,
          recipientTitle: recipientTitle || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate email');
      }

      const result = await response.json();
      setEmailSubject(result.subject);
      setEmailBody(result.body);
    } catch (error) {
      console.error('Email generation error:', error);
      // Fallback to template-based generation
      generateTemplateEmail();
      setGenerating(false);
    }
  };

  const generateTemplateEmail = () => {
    const companyName = prospectData.companyName;
    const framework = prospectData.techStack.primaryFramework || 'modern JavaScript';
    const hiringSignal = prospectData.hiring.hasOpenEngineeringRoles
      ? `I noticed you're actively hiring ${prospectData.hiring.engineeringRoleCount || 'multiple'} engineering roles`
      : '';
    const blogSignal = prospectData.engineeringCulture.hasEngineeringBlog
      ? `I've been following your engineering blog and love your approach to ${prospectData.engineeringCulture.recentBlogTopics[0] || 'engineering culture'}`
      : '';

    const toneMap = {
      professional: {
        greeting: recipientName ? `Hi ${recipientName},` : `Hi there,`,
        opening: `I came across ${companyName} and was impressed by your work.`,
        closing: `Best regards,`,
      },
      friendly: {
        greeting: recipientName ? `Hey ${recipientName},` : `Hey,`,
        opening: `I've been checking out ${companyName} - really cool stuff you're building!`,
        closing: `Cheers,`,
      },
      direct: {
        greeting: recipientName ? `Hi ${recipientName},` : `Hi,`,
        opening: `${companyName} caught my attention.`,
        closing: `Best,`,
      },
      consultative: {
        greeting: recipientName ? `Hi ${recipientName},` : `Hello,`,
        opening: `I've been researching companies in your space and ${companyName} stands out.`,
        closing: `Looking forward to connecting,`,
      },
    };

    const selectedTone = toneMap[tone];

    const subject = `Quick question about ${companyName}'s ${framework} stack`;
    
    const body = `${selectedTone.greeting}

${selectedTone.opening} ${hiringSignal || blogSignal || `I noticed you're using ${framework} for your frontend.`}

I'm reaching out because I think Browserbase could be a game-changer for your engineering team. Here's why:

${prospectData.icpScore.recommendedTalkingPoints.slice(0, 3).map((point, idx) => `${idx + 1}. ${point}`).join('\n')}

Browserbase provides cloud-based browser automation that integrates seamlessly with ${framework} applications, helping engineering teams:
• Automate testing and QA workflows
• Run browser-based integrations without infrastructure overhead
• Scale browser automation without managing servers

${prospectData.hiring.hasOpenEngineeringRoles ? `Given that you're actively hiring engineers, I thought this might be particularly relevant as you scale your team.` : ''}

Would you be open to a quick 15-minute call to discuss how Browserbase could help ${companyName}? I'm happy to show you a quick demo tailored to your stack.

${selectedTone.closing}
[Your Name]
Browserbase`;

    setEmailSubject(subject);
    setEmailBody(body);
  };

  const handleCopy = () => {
    const fullEmail = `Subject: ${emailSubject}\n\n${emailBody}`;
    navigator.clipboard.writeText(fullEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const fullEmail = `Subject: ${emailSubject}\n\n${emailBody}`;
    const blob = new Blob([fullEmail], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `browserbase-outreach-${prospectData.companyName.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Generator
        </CardTitle>
        <CardDescription>
          Generate personalized outreach emails based on prospect intelligence
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="recipient-name">Recipient Name (optional)</Label>
            <Input
              id="recipient-name"
              placeholder="John Doe"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipient-title">Recipient Title (optional)</Label>
            <Input
              id="recipient-title"
              placeholder="VP of Engineering"
              value={recipientTitle}
              onChange={(e) => setRecipientTitle(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>LLM Provider</Label>
            <Select value={llmProvider} onValueChange={(value) => setLlmProvider(value as LLMProvider)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude">Claude (Anthropic)</SelectItem>
                <SelectItem value="gemini">Gemini (Google)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Email Tone</Label>
            <div className="flex gap-2 flex-wrap">
              {(['professional', 'friendly', 'direct', 'consultative'] as EmailTone[]).map((t) => (
                <Button
                  key={t}
                variant={tone === t ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTone(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
              ))}
            </div>
          </div>
        </div>

        <Button onClick={generating ? undefined : generateEmail} className="w-full" disabled={generating}>
          {generating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Email
            </>
          )}
        </Button>

        {emailSubject && (
          <>
            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject Line</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-body">Email Body</Label>
              <Textarea
                id="email-body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={15}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCopy} className="flex-1">
                {copied ? (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Email
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleDownload} className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

