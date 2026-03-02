"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center px-4">
          <Card className="max-w-md space-y-3 text-center">
            <h1 className="text-3xl font-bold">Something went wrong</h1>
            <p className="text-sm text-zinc-600">{error.message}</p>
            <div className="flex justify-center gap-2">
              <Button onClick={reset}>Try again</Button>
              <Link href="/">
                <Button variant="ghost">Home</Button>
              </Link>
            </div>
          </Card>
        </div>
      </body>
    </html>
  );
}

