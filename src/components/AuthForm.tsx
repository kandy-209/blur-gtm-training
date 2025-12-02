'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

        // Generate email from username if not provided
        const userEmail = email.trim() || `${username.toLowerCase().replace(/\s+/g, '')}@cursor.local`;

        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
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
    <Card className="max-w-md mx-auto border-gray-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl">{mode === 'signin' ? 'Sign In' : 'Create Account'}</CardTitle>
        <CardDescription className="text-base mt-2">
          {mode === 'signin'
            ? 'Welcome back! Sign in to continue your training.'
            : 'Fill in the required fields below to get started'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          {mode === 'signin' && (
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          )}
          {mode === 'signup' && (
            <>
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  required
                  minLength={3}
                  maxLength={30}
                  disabled={isLoading}
                  className="mt-1"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">3-30 characters</p>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com (optional)"
                  disabled={isLoading}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {username 
                    ? `Optional - we'll use ${username}@cursor.local if not provided`
                    : 'Optional - email will be auto-generated from your username'}
                </p>
              </div>
            </>
          )}

          <div>
            <Label htmlFor="password">Password {mode === 'signup' && '*'}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'}
              required
              minLength={8}
              disabled={isLoading}
              className="mt-1"
            />
            {mode === 'signup' && (
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters
              </p>
            )}
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name (optional)"
                  disabled={isLoading}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="roleAtCursor">Your Role at Cursor *</Label>
                <Select value={roleAtCursor} onValueChange={setRoleAtCursor} required>
                  <SelectTrigger className="mt-1">
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
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Senior Account Executive"
                  required
                  disabled={isLoading}
                  className="mt-1"
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

