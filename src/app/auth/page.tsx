'use client';

import { useState, useEffect } from 'react';
import AuthForm from '@/components/AuthForm';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showGuestForm, setShowGuestForm] = useState(false); // Show signin/signup form by default
  const [guestUsername, setGuestUsername] = useState('');
  const [guestRole, setGuestRole] = useState('Sales Rep');
  const router = useRouter();
  const { user, loading, signInAsGuest } = useAuth();

  useEffect(() => {
    // If already logged in, redirect
    if (!loading && user) {
      // Get redirect from URL params
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/';
      router.push(redirect);
    }
  }, [user, loading, router]);

  const handleSuccess = () => {
    // Redirect to original destination or home
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect') || '/';
    router.push(redirect);
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guestUsername.trim()) {
      signInAsGuest(guestUsername.trim(), guestRole);
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/';
      router.push(redirect);
    }
  };

  if (showGuestForm) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-md mx-auto">
          {/* Cursor Employee Banner */}
          <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">For Cursor Employees</h3>
                <p className="text-sm text-blue-800">
                  No signup required! Start training immediately. You can create an account later if you want to save progress.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Quick Start - No Signup</h1>
            <p className="text-muted-foreground">
              Enter your name and start practicing right away
            </p>
          </div>
          <Card className="border-2 border-gray-200 shadow-lg">
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-xl">Start Training Now</CardTitle>
              <CardDescription>
                No email or password needed. Perfect for Cursor team members!
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleGuestSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="guest-username" className="text-base font-medium">Your Name</Label>
                  <Input
                    id="guest-username"
                    name="username"
                    value={guestUsername}
                    onChange={(e) => setGuestUsername(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="mt-2 h-12 text-base"
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="guest-role" className="text-base font-medium">Your Role at Cursor</Label>
                  <Select value={guestRole} onValueChange={setGuestRole}>
                    <SelectTrigger id="guest-role" className="mt-2 h-12 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sales Rep">Sales Rep</SelectItem>
                      <SelectItem value="Account Executive">Account Executive</SelectItem>
                      <SelectItem value="Sales Engineer">Sales Engineer</SelectItem>
                      <SelectItem value="Sales Manager">Sales Manager</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3 pt-2">
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base bg-black hover:bg-gray-900 text-white font-semibold"
                  >
                    Start Training Now →
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowGuestForm(false)}
                    className="w-full text-sm text-muted-foreground"
                  >
                    Need to create an account? Click here
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-md mx-auto">
        {/* Prominent Guest Access Banner */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 text-lg mb-1">Looking to poke around.</h3>
              <p className="text-sm text-blue-800">
                Start training immediately without creating an account
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => setShowGuestForm(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11"
          >
            Quick Start →
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Cursor Enterprise GTM Training</h1>
          <p className="text-muted-foreground">
            {mode === 'signin' ? 'Welcome back!' : 'Create your account to start practicing'}
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{mode === 'signin' ? 'Sign In' : 'Create Account'}</CardTitle>
            <CardDescription>
              {mode === 'signin' 
                ? 'Sign in to access your saved progress' 
                : 'Create an account to save your training progress'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm
              mode={mode}
              onSuccess={handleSuccess}
              onSwitchMode={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            />
          </CardContent>
        </Card>
        
        <div className="mt-6 space-y-2 text-center">
          <p className="text-sm text-muted-foreground">
            {mode === 'signin' ? (
              <>
                Cursor employee?{' '}
                <button
                  type="button"
                  onClick={() => setShowGuestForm(true)}
                  className="text-blue-600 hover:text-blue-700 font-semibold underline"
                >
                  Start without signing up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-blue-600 hover:text-blue-700 font-semibold underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            Need admin access?{' '}
            <Link href="/admin/signup" className="text-red-600 hover:text-red-700 font-semibold underline">
              Create admin account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

