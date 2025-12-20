'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Shield } from 'lucide-react';

export default function AdminSignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [adminCode, setAdminCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          username,
          fullName: fullName || undefined,
          adminCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin account');
      }

      // Store session
      if (data.session) {
        localStorage.setItem('supabase_session', JSON.stringify(data.session));
      }

      // Redirect to admin dashboard
      router.push('/scenario-builder');
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
          <h1 className="text-3xl font-bold mb-2">Admin Account Creation</h1>
          <p className="text-muted-foreground">
            Create an administrator account for the Browserbase GTM Training Platform
          </p>
        </div>

        <Card className="border-2 border-red-200">
          <CardHeader>
            <CardTitle>Admin Sign Up</CardTitle>
            <CardDescription>
              This page is for creating administrator accounts only. You must have a valid admin code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="adminCode">
                  Admin Code {email && !email.toLowerCase().endsWith('@blur.com') && '*'}
                </Label>
                <Input
                  id="adminCode"
                  type="password"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="Enter admin invitation code"
                  required={!email || !email.toLowerCase().endsWith('@blur.com')}
                  disabled={isLoading}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {email && email.toLowerCase().endsWith('@blur.com')
                    ? 'Admin code not required for @blur.com email addresses'
                    : 'Contact your system administrator for the admin code'}
                </p>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@blur.com"
                  required
                  disabled={isLoading}
                  className="mt-2"
                />
                {email && email.toLowerCase().endsWith('@blur.com') && (
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    ✓ @blur.com email detected - Admin code not required
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin_username"
                  required
                  minLength={3}
                  maxLength={30}
                  disabled={isLoading}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  disabled={isLoading}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={isLoading}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Must be at least 8 characters
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={isLoading}
                  className="mt-2"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating admin account...
                  </>
                ) : (
                  'Create Admin Account'
                )}
              </Button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => router.push('/auth')}
                  className="text-blue-600 hover:underline"
                  disabled={isLoading}
                >
                  Need a regular account? Sign up here
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Admin accounts have full access to the platform including scenario management, analytics, and user administration. Use responsibly.
          </p>
        </div>
      </div>
    </div>
  );
}

