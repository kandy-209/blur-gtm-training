'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Search } from 'lucide-react';

interface ProspectIntelligenceFormProps {
  onSubmit: (websiteUrl: string, companyName?: string) => void;
  loading: boolean;
}

export function ProspectIntelligenceForm({ onSubmit, loading }: ProspectIntelligenceFormProps) {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!websiteUrl.trim()) {
      setError('Please enter a website URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(websiteUrl);
    } catch {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    onSubmit(websiteUrl.trim(), companyName.trim() || undefined);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Prospect Intelligence Research
        </CardTitle>
        <CardDescription>
          Enter a company website URL to automatically research their tech stack, hiring activity, and engineering culture
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website-url">Website URL *</Label>
            <Input
              id="website-url"
              type="url"
              placeholder="https://www.example.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name (optional)</Label>
            <Input
              id="company-name"
              type="text"
              placeholder="Acme Corp"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={loading}
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Start Research
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}







