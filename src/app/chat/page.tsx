'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { PermissionAwareChat } from '@/components/PermissionAwareChat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getUserRole, getPermissions } from '@/lib/permissions';

export default function ChatPage() {
  const { user } = useAuth();
  const role = getUserRole(user);
  const permissions = getPermissions(user);

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-black flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Chat Assistant</h1>
              <p className="text-muted-foreground mt-1">
                Ask questions about Cursor - Access based on your permissions
              </p>
            </div>
          </div>

          {/* Permission Info */}
          <Card className="border-gray-200 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">Your Access Level: {role}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    You have access to {permissions.length} permission{permissions.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {permissions.filter(p => p.startsWith('chat:')).map((permission) => (
                      <span
                        key={permission}
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded"
                      >
                        {permission.replace('chat:', '')}
                      </span>
                    ))}
                  </div>
                </div>
                {role === 'guest' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Lock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Upgrade Access</p>
                        <p className="text-xs text-blue-800 mt-1">
                          Sign in to access technical and ROI chat features
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Component */}
        <PermissionAwareChat initialChatType="general" />
      </div>
    </ProtectedRoute>
  );
}

