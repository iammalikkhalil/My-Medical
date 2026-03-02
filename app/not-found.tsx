import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-md text-center">
        <h1 className="text-3xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-zinc-600">The page you requested does not exist.</p>
        <Link href="/" className="mt-4 inline-block">
          <Button>Go to Dashboard</Button>
        </Link>
      </Card>
    </div>
  );
}

