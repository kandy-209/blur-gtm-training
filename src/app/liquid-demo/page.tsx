'use client';

import { Button } from '@/components/ui/button';
import { LiquidButton } from '@/components/ui/liquid-button';
import { LiquidProgress } from '@/components/ui/liquid-progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdvancedCard } from '@/components/ui/advanced-card';

export default function LiquidDemoPage() {
  return (
    <div className="min-h-screen bg-white p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Vercel-Style Liquid Design</h1>
          <p className="text-gray-600">Minimal, clean, and subtle - matching Vercel's aesthetic</p>
        </div>

        {/* Buttons Section */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Vercel-style liquid buttons with subtle effects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <LiquidButton variant="liquid">Liquid Button</LiquidButton>
              <Button variant="liquid">Standard Liquid</Button>
              <LiquidButton variant="liquid" size="lg">Large Liquid</LiquidButton>
              <LiquidButton variant="liquid" size="sm">Small Liquid</LiquidButton>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 mb-2">Hover to see subtle effects:</p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Subtle border brightening</li>
                <li>Minimal lift on hover</li>
                <li>Gentle radial gradient overlay</li>
                <li>Clean, minimal shadows</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Progress Bars */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Bars</CardTitle>
            <CardDescription>Liquid-style progress indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Default</p>
              <LiquidProgress value={45} />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Blue</p>
              <LiquidProgress value={60} variant="blue" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Purple</p>
              <LiquidProgress value={75} variant="purple" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">With Label</p>
              <LiquidProgress value={85} showLabel variant="success" />
            </div>
          </CardContent>
        </Card>

        {/* Cards with Liquid Effect */}
        <Card>
          <CardHeader>
            <CardTitle>Cards</CardTitle>
            <CardDescription>Cards with liquid animation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AdvancedCard liquid className="p-6">
              <h3 className="font-semibold mb-2">Liquid Card</h3>
              <p className="text-sm text-gray-600">
                This card has the liquid wave animation - subtle and minimal, just like Vercel's design.
              </p>
            </AdvancedCard>
          </CardContent>
        </Card>

        {/* Design Principles */}
        <Card>
          <CardHeader>
            <CardTitle>Design Principles</CardTitle>
            <CardDescription>What makes this Vercel-style?</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-black font-medium">✓</span>
                <span><strong>Minimal shadows:</strong> Very subtle, almost imperceptible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black font-medium">✓</span>
                <span><strong>Clean borders:</strong> Thin, subtle borders (rgba(255, 255, 255, 0.1))</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black font-medium">✓</span>
                <span><strong>Subtle animations:</strong> Gentle, not flashy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black font-medium">✓</span>
                <span><strong>Pure black backgrounds:</strong> #000 with minimal gradients</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black font-medium">✓</span>
                <span><strong>Minimal hover effects:</strong> Slight lift, border brightening</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-black font-medium">✓</span>
                <span><strong>Radial gradients:</strong> Subtle overlay effects</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


