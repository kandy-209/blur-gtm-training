/**
 * Sales Training Page
 * Phone call training for sales reps
 */

'use client';

import { PhoneCallTraining } from '@/components/SalesTraining/PhoneCallTraining';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Target, TrendingUp, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function SalesTrainingPage() {
  const { user } = useAuth();
  const userId = user?.id || `guest_${Date.now()}`;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-6 w-6" />
            Sales Phone Call Training
          </CardTitle>
          <CardDescription>
            Practice real sales calls with AI prospects. Get instant feedback and improve your skills.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <Target className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-semibold mb-1">Real Scenarios</h3>
              <p className="text-sm text-muted-foreground">
                Practice with realistic enterprise prospects and objections
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-semibold mb-1">AI Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Get instant feedback on objection handling and closing
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <Award className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-semibold mb-1">Track Progress</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your improvement over time with detailed metrics
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <PhoneCallTraining userId={userId} />
    </div>
  );
}

