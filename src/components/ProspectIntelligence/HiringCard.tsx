'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Briefcase, AlertCircle } from 'lucide-react';
import type { HiringData } from '@/lib/prospect-intelligence/types';

interface HiringCardProps {
  hiring: HiringData;
}

export function HiringCard({ hiring }: HiringCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Hiring Activity
        </CardTitle>
        <CardDescription>
          Engineering roles and hiring signals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hiring.hasOpenEngineeringRoles ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Engineering Roles</div>
                <div className="text-2xl font-bold">
                  {hiring.engineeringRoleCount ?? 'N/A'}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Total Open Roles</div>
                <div className="text-2xl font-bold">
                  {hiring.totalOpenRoles ?? 'N/A'}
                </div>
              </div>
            </div>

            {hiring.jobBoardPlatform && (
              <div>
                <div className="text-sm text-gray-600 mb-1">Job Board Platform</div>
                <Badge variant="outline">{hiring.jobBoardPlatform}</Badge>
              </div>
            )}

            {hiring.engineeringRoleTitles.length > 0 && (
              <div>
                <div className="font-semibold text-sm mb-2">Engineering Role Titles</div>
                <div className="space-y-1">
                  {hiring.engineeringRoleTitles.map((title, idx) => (
                    <div key={idx} className="text-sm flex items-center gap-2">
                      <Users className="h-3 w-3 text-gray-400" />
                      <span>{title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hiring.seniorityLevels.length > 0 && (
              <div>
                <div className="font-semibold text-sm mb-2">Seniority Levels</div>
                <div className="flex flex-wrap gap-2">
                  {hiring.seniorityLevels.map((level, idx) => (
                    <Badge key={idx} variant="outline">{level}</Badge>
                  ))}
                </div>
              </div>
            )}

            {hiring.hiringSignals.length > 0 && (
              <div>
                <div className="font-semibold text-sm mb-2">Hiring Signals</div>
                <ul className="space-y-1">
                  {hiring.hiringSignals.map((signal, idx) => (
                    <li key={idx} className="text-sm text-gray-600">• {signal}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 text-gray-600">
            <AlertCircle className="h-4 w-4" />
            <span>No open engineering roles detected</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}







