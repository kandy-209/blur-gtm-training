'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, BookOpen, MessageSquare, PlayCircle, BarChart3, Trophy } from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

const faqs = [
  {
    question: 'How do I start practicing?',
    answer: 'Go to the Scenarios page and select a role-play scenario. You can practice with AI prospects that respond like real Enterprise buyers.',
  },
  {
    question: 'What is the ROI Calculator?',
    answer: 'The ROI Calculator helps you calculate the business impact and return on investment for Cursor Enterprise based on productivity improvements and cost savings.',
  },
  {
    question: 'How does scoring work?',
    answer: 'Your responses are evaluated based on how well you address objections, mention key value points, and demonstrate understanding of Cursor features. Scores range from 0-100.',
  },
  {
    question: 'Can I create custom scenarios?',
    answer: 'Yes! Use the Scenario Builder to create, edit, and manage custom role-play scenarios tailored to your needs.',
  },
  {
    question: 'How do I improve my sales skills?',
    answer: 'Check out the Sales Skills Training section for outbound and inbound sales fundamentals, then practice what you learn in the scenarios.',
  },
  {
    question: 'What features can I learn about?',
    answer: 'Visit the Features page to explore Cursor Enterprise capabilities, including Plan Mode, AI Code Review, and more. Each feature includes learning paths for leadership and IC teams.',
  },
];

const helpSections = [
  {
    title: 'Getting Started',
    icon: PlayCircle,
    description: 'Learn the basics of using the platform',
    link: '/scenarios',
    linkText: 'Start Practicing',
  },
  {
    title: 'Sales Training',
    icon: BookOpen,
    description: 'Master outbound and inbound sales skills',
    link: '/sales-skills',
    linkText: 'Learn Skills',
  },
  {
    title: 'Track Progress',
    icon: BarChart3,
    description: 'Monitor your performance and analytics',
    link: '/analytics',
    linkText: 'View Analytics',
  },
  {
    title: 'Leaderboard',
    icon: Trophy,
    description: 'See top performers and compete',
    link: '/leaderboard',
    linkText: 'View Rankings',
  },
];

export default function HelpPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Help & Support
            </h1>
            <p className="text-gray-600">
              Find answers to common questions and get help using the platform
            </p>
          </div>

          {/* Quick Help Sections */}
          <div className="grid gap-4 md:grid-cols-2 mb-12">
            {helpSections.map((section) => {
              const Icon = section.icon;
              return (
                <Link key={section.title} href={section.link}>
                  <Card className="h-full hover:border-gray-900 transition-all cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-lg bg-gray-900 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                      </div>
                      <CardDescription>{section.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">
                        {section.linkText}
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* FAQs */}
          <Card className="mb-12">
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-gray-900" />
                <CardTitle>Frequently Asked Questions</CardTitle>
              </div>
              <CardDescription>
                Common questions and answers about the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-gray-900" />
                <CardTitle>Still Need Help?</CardTitle>
              </div>
              <CardDescription>
                Can't find what you're looking for? Get in touch with us
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Link href="/feedback">
                  <Button className="w-full" size="lg">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Submit Feedback or Question
                  </Button>
                </Link>
                <p className="text-sm text-gray-600 text-center">
                  You can also use the AI Training Assistant on any page for instant help
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}













