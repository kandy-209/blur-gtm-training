'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function GrantAdminAccessPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [grantCode, setGrantCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/admin/grant-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, grantCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to grant admin access');
      }

      setSuccess(true);
      // Refresh page after 2 seconds to update user role
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Grant Admin Access</h1>
          <p className="text-muted-foreground">
            Grant administrator privileges to a user account
          </p>
        </div>

        <Card className="border-2 border-red-200">
          <CardHeader>
            <CardTitle>Grant Admin Access</CardTitle>
            <CardDescription>
              Enter the user's email and grant code to provide admin access
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <p className="text-lg font-semibold text-green-600 mb-2">
                  Admin access granted successfully!
                </p>
                <p className="text-sm text-muted-foreground">
                  Refreshing page...
                </p>
              </div>
            ) : (
              <form onSubmit={handleGrantAccess} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                    {error}
                  </div>
                )}

                <div>
                  <Label htmlFor="email">User Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                    disabled={isLoading}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email of the user to grant admin access
                  </p>
                </div>

                <div>
                  <Label htmlFor="grantCode">Grant Code</Label>
                  <Input
                    id="grantCode"
                    type="password"
                    value={grantCode}
                    onChange={(e) => setGrantCode(e.target.value)}
                    placeholder="Enter grant code"
                    required
                    disabled={isLoading}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Default code: GRANT_ADMIN_ACCESS_2024
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Granting access...
                    </>
                  ) : (
                    'Grant Admin Access'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> After granting admin access, the user will need to sign out and sign back in for the changes to take effect.
          </p>
        </div>
      </div>
    </div>
  );
}

