import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <Card className="w-full max-w-md p-6">
        <Skeleton className="mb-2 h-9 w-44" />
        <Skeleton className="mb-6 h-4 w-56" />
        <Skeleton className="mb-3 h-11 w-full" />
        <Skeleton className="mb-3 h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </Card>
    </div>
  );
}
