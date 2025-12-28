import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blursalestrainer.com';

export default function NotFound() {
  // Structured data for error page
  const errorPageStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: '404 - Page Not Found',
    description: 'The page you are looking for does not exist on the Browserbase GTM Training Platform.',
    url: `${siteUrl}/404`,
    mainEntity: {
      '@type': 'Thing',
      name: '404 Error',
      description: 'Page not found error',
    },
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(errorPageStructuredData),
        }}
      />
      <div className="min-h-screen bg-white flex items-center justify-center" role="main">
        <div className="container mx-auto px-4 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-6xl sm:text-7xl font-bold text-gray-900" id="main-heading">
              404
            </h1>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">Page Not Found</h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto" aria-live="polite">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/" aria-label="Go to homepage">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white flex items-center gap-2">
                <Home className="h-4 w-4" aria-hidden="true" />
                Go Home
              </Button>
            </Link>
            <Link href="/scenarios" aria-label="Go back to scenarios">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to Scenarios
              </Button>
            </Link>
            <Link href="/scenarios" aria-label="Search for scenarios">
              <Button variant="outline" className="flex items-center gap-2">
                <Search className="h-4 w-4" aria-hidden="true" />
                Search
              </Button>
            </Link>
          </div>
          <div className="mt-8 text-sm text-gray-500">
            <p>Popular pages:</p>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              <Link href="/scenarios" className="text-blue-600 hover:underline">
                Scenarios
              </Link>
              <span aria-hidden="true">•</span>
              <Link href="/sales-training" className="text-blue-600 hover:underline">
                Sales Training
              </Link>
              <span aria-hidden="true">•</span>
              <Link href="/analytics" className="text-blue-600 hover:underline">
                Analytics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

