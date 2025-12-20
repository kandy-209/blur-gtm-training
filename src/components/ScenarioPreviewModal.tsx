'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scenario } from '@/types/roleplay';
import { Target, Clock, Shield, DollarSign, Puzzle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface ScenarioPreviewModalProps {
  scenario: Scenario | null;
  open: boolean;
  onClose: () => void;
}

const categoryIcons: Record<string, any> = {
  'Competitive_SelfHosted': Puzzle,
  'Security_Privacy': Shield,
  'Pricing_Value': DollarSign,
  'Integration_Complexity': Clock,
  'Adoption_Concerns': TrendingUp,
  'Code_Quality': Target,
};

export function ScenarioPreviewModal({ scenario, open, onClose }: ScenarioPreviewModalProps) {
  if (!scenario) return null;

  const CategoryIcon = categoryIcons[scenario.objection_category] || Target;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <CategoryIcon className="h-5 w-5 text-gray-600" />
            <DialogTitle className="text-xl">{scenario.persona.name}</DialogTitle>
          </div>
          <DialogDescription className="text-sm">
            {scenario.objection_category.replace(/_/g, ' ')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Persona Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Persona Details</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Current Solution:</span>
                <p className="mt-1">{scenario.persona.currentSolution}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Primary Goal:</span>
                <p className="mt-1">{scenario.persona.primaryGoal}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Skepticism:</span>
                <p className="mt-1">{scenario.persona.skepticism}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Tone:</span>
                <p className="mt-1">{scenario.persona.tone}</p>
              </div>
            </div>
          </div>

          {/* Objection */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Opening Objection</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm leading-relaxed">{scenario.objection_statement}</p>
            </div>
          </div>

          {/* Key Points */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Key Points to Address ({scenario.keyPoints.length})
            </h3>
            <ul className="space-y-2">
              {scenario.keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Link href={`/roleplay/${scenario.id}`} className="flex-1">
              <Button className="w-full bg-black hover:bg-gray-900 text-white" onClick={onClose}>
                Start Scenario
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

