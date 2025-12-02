import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container mx-auto p-6 text-center space-y-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-xl">Scenario not found</p>
      <Link href="/scenarios">
        <Button>Back to Scenarios</Button>
      </Link>
    </div>
  );
}

