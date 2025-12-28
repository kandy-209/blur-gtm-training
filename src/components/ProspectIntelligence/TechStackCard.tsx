'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, CheckCircle2, AlertCircle } from 'lucide-react';
import type { TechStack, ThirdPartyTools } from '@/lib/prospect-intelligence/types';

interface TechStackCardProps {
  techStack: TechStack;
  thirdPartyTools: ThirdPartyTools;
}

export function TechStackCard({ techStack, thirdPartyTools }: TechStackCardProps) {
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Technology Stack
        </CardTitle>
        <CardDescription>
          Detected frameworks, tools, and integrations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {techStack.primaryFramework ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Primary Framework</span>
              <Badge className={getConfidenceColor(techStack.frameworkConfidence)}>
                {techStack.frameworkConfidence.toUpperCase()} CONFIDENCE
              </Badge>
            </div>
            <div className="text-lg font-bold">{techStack.primaryFramework}</div>
            {techStack.frameworkEvidence.length > 0 && (
              <div className="mt-2 text-xs text-gray-600">
                Evidence: {techStack.frameworkEvidence[0]}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-600">
            <AlertCircle className="h-4 w-4" />
            <span>Framework not detected</span>
          </div>
        )}

        {techStack.additionalFrameworks.length > 0 && (
          <div>
            <div className="font-semibold text-sm mb-2">Additional Frameworks</div>
            <div className="flex flex-wrap gap-2">
              {techStack.additionalFrameworks.map((fw, idx) => (
                <Badge key={idx} variant="outline">{fw}</Badge>
              ))}
            </div>
          </div>
        )}

        {techStack.isModernStack && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm">Uses modern JavaScript stack</span>
          </div>
        )}

        {(thirdPartyTools.analytics.length > 0 || 
          thirdPartyTools.monitoring.length > 0 || 
          thirdPartyTools.chat.length > 0 ||
          thirdPartyTools.other.length > 0) && (
          <div className="pt-4 border-t space-y-3">
            <div className="font-semibold text-sm">Third-Party Tools</div>
            
            {thirdPartyTools.analytics.length > 0 && (
              <div>
                <div className="text-xs text-gray-600 mb-1">Analytics</div>
                <div className="flex flex-wrap gap-2">
                  {thirdPartyTools.analytics.map((tool, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">{tool}</Badge>
                  ))}
                </div>
              </div>
            )}

            {thirdPartyTools.monitoring.length > 0 && (
              <div>
                <div className="text-xs text-gray-600 mb-1">Monitoring</div>
                <div className="flex flex-wrap gap-2">
                  {thirdPartyTools.monitoring.map((tool, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">{tool}</Badge>
                  ))}
                </div>
              </div>
            )}

            {thirdPartyTools.chat.length > 0 && (
              <div>
                <div className="text-xs text-gray-600 mb-1">Chat/Support</div>
                <div className="flex flex-wrap gap-2">
                  {thirdPartyTools.chat.map((tool, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">{tool}</Badge>
                  ))}
                </div>
              </div>
            )}

            {thirdPartyTools.other.length > 0 && (
              <div>
                <div className="text-xs text-gray-600 mb-1">Other</div>
                <div className="flex flex-wrap gap-2">
                  {thirdPartyTools.other.map((tool, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">{tool}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}








