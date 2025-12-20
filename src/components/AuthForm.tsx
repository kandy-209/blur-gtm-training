'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onSuccess?: () => void;
  onSwitchMode?: () => void;
}

export default function AuthForm({ mode, onSuccess, onSwitchMode }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Sign in fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Sign up fields
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [roleAtCursor, setRoleAtCursor] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'signin') {
        const response = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to sign in');
        }

        // Store session
        if (data.session) {
          localStorage.setItem('supabase_session', JSON.stringify(data.session));
        }

        onSuccess?.();
      } else {
        if (!username || !roleAtCursor || !jobTitle) {
          throw new Error('Please fill in all required fields');
        }

        // Email is optional - generate one for Supabase Auth if not provided
        // The actual email (if provided) will be stored separately for analytics
        const providedEmail = email.trim() || '';
        const userEmail = providedEmail || `${username.toLowerCase().replace(/\s+/g, '')}@blur.local`;

        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail, // Required for Supabase Auth, but can be generated
            emailForAnalytics: providedEmail || null, // Optional real email for analytics
            password,
            username,
            fullName: fullName || undefined,
            roleAtCursor,
            jobTitle,
            department: department || undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to sign up');
        }

        // Store session
        if (data.session) {
          localStorage.setItem('supabase_session', JSON.stringify(data.session));
        }

        onSuccess?.();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</CardTitle>
        <CardDescription>
          {mode === 'signin'
            ? 'Sign in to your Browserbase GTM Training account'
            : 'Create your account to start practicing Enterprise sales'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          {mode === 'signin' && (
            <div>
              <Label htmlFor="email">Username or Email</Label>
              <Input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your username or email"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can sign in with either your username or email address
              </p>
            </div>
          )}
          {mode === 'signup' && (
            <div>
              <Label htmlFor="email">
                Email (Optional)
                <span className="text-xs text-muted-foreground ml-2">
                  - For analytics & insights emails
                </span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Leave empty if you don't want email updates"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can sign in with your username and password. Email is only used for sending training insights and analytics.
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={isLoading}
            />
            {mode === 'signup' && (
              <p className="text-xs text-muted-foreground mt-1">
                Must be at least 8 characters
              </p>
            )}
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={30}
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="fullName">Full Name (Optional)</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="roleAtCursor">Your Role at Browserbase</Label>
                <Select value={roleAtCursor} onValueChange={setRoleAtCursor} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales Rep">Sales Rep</SelectItem>
                    <SelectItem value="Account Executive">Account Executive</SelectItem>
                    <SelectItem value="Senior Account Executive">Senior Account Executive</SelectItem>
                    <SelectItem value="Enterprise Account Executive">Enterprise Account Executive</SelectItem>
                    <SelectItem value="Sales Manager">Sales Manager</SelectItem>
                    <SelectItem value="Sales Director">Sales Director</SelectItem>
                    <SelectItem value="VP of Sales">VP of Sales</SelectItem>
                    <SelectItem value="GTM Manager">GTM Manager</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Senior Account Executive"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="department">Department (Optional)</Label>
                <Input
                  id="department"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g., Enterprise Sales"
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          <Button
            type="submit"
            className="w-full bg-black hover:bg-gray-900 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              mode === 'signin' ? 'Sign In' : 'Sign Up'
            )}
          </Button>

          {onSwitchMode && (
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={onSwitchMode}
                className="text-blue-600 hover:underline"
                disabled={isLoading}
              >
                {mode === 'signin'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

