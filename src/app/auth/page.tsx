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

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showGuestForm, setShowGuestForm] = useState(false);
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
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Continue as Guest</h1>
            <p className="text-muted-foreground">
              Start practicing immediately without creating an account
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Guest Access</CardTitle>
              <CardDescription>
                You can always create an account later to save your progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGuestSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="guest-username">Your Name</Label>
                  <Input
                    id="guest-username"
                    name="username"
                    value={guestUsername}
                    onChange={(e) => setGuestUsername(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="guest-role">Role at Cursor</Label>
                  <Select value={guestRole} onValueChange={setGuestRole}>
                    <SelectTrigger id="guest-role" className="mt-1">
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
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowGuestForm(false)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1 bg-black hover:bg-gray-900 text-white">
                    Continue as Guest
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
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Cursor Enterprise GTM Training</h1>
          <p className="text-muted-foreground">
            {mode === 'signin' ? 'Welcome back!' : 'Create your account to start practicing'}
          </p>
        </div>
        <AuthForm
          mode={mode}
          onSuccess={handleSuccess}
          onSwitchMode={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        />
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full mt-6"
            onClick={() => setShowGuestForm(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Continue as Guest
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            No email required. Start practicing immediately.
          </p>
        </div>
      </div>
    </div>
  );
}

