import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="container mx-auto px-4 text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl sm:text-7xl font-bold text-gray-900">404</h1>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">Page Not Found</h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Link href="/scenarios">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Scenarios
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

