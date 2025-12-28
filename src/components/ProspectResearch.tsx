'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Search, Building2, Mail, Users, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CompanyData {
  name: string;
  domain?: string;
  description?: string;
  industry?: string;
  sector?: string;
  employeeCount?: number;
  revenue?: number;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  website?: string;
  linkedin?: string;
  founded?: number;
  tags?: string[];
}

interface ContactData {
  firstName?: string;
  lastName?: string;
  email?: string;
  title?: string;
  seniority?: string;
  department?: string;
  linkedin?: string;
  verified?: boolean;
}

export default function ProspectResearch() {
  const [companyName, setCompanyName] = useState('');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleResearch = async () => {
    if (!companyName.trim()) {
      setError('Please enter a company name');
      return;
    }

    setLoading(true);
    setError(null);
    setCompanyData(null);
    setContacts([]);

    try {
      const response = await fetch('/api/sales/enrich-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          domain: domain.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to research company');
      }

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setCompanyData(data.company || null);
        setContacts(data.contacts || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to research company');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Prospect Research
          </CardTitle>
          <CardDescription>
            Enrich company data and find contacts for better outreach
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="company-name">Company Name *</Label>
              <Input
                id="company-name"
                placeholder="e.g., Acme Corp"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleResearch()}
              />
            </div>
            <div>
              <Label htmlFor="domain">Domain (optional)</Label>
              <Input
                id="domain"
                placeholder="e.g., acme.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleResearch()}
              />
            </div>
          </div>

          <Button onClick={handleResearch} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Research Company
              </>
            )}
          </Button>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {companyData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {companyData.name}
            </CardTitle>
            <CardDescription>
              {companyData.industry && `${companyData.industry}`}
              {companyData.sector && ` • ${companyData.sector}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {companyData.description && (
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-gray-600">{companyData.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {companyData.employeeCount && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Employees</div>
                  <div className="font-semibold">{companyData.employeeCount.toLocaleString()}</div>
                </div>
              )}
              {companyData.revenue && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Revenue</div>
                  <div className="font-semibold">{formatCurrency(companyData.revenue)}</div>
                </div>
              )}
              {companyData.founded && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Founded</div>
                  <div className="font-semibold">{companyData.founded}</div>
                </div>
              )}
              {companyData.location && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Location</div>
                  <div className="font-semibold">
                    {companyData.location.city}
                    {companyData.location.state && `, ${companyData.location.state}`}
                  </div>
                </div>
              )}
            </div>

            {companyData.tags && companyData.tags.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {companyData.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {contacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Contacts Found ({contacts.length})
            </CardTitle>
            <CardDescription>
              Potential contacts at {companyData?.name || 'this company'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contacts.slice(0, 10).map((contact, idx) => (
                <div key={idx} className="p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold">
                        {contact.firstName} {contact.lastName}
                      </div>
                      {contact.title && (
                        <div className="text-sm text-gray-600">{contact.title}</div>
                      )}
                      {contact.email && (
                        <div className="text-sm text-blue-600 flex items-center gap-2 mt-1">
                          <Mail className="h-3 w-3" />
                          {contact.email}
                          {contact.verified && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    {contact.seniority && (
                      <Badge variant="outline">{contact.seniority}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}















