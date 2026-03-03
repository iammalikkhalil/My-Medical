import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MainLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-3 md:grid-cols-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Card>
        <Skeleton className="mb-3 h-6 w-40" />
        <Skeleton className="mb-2 h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </Card>
      <Card>
        <Skeleton className="mb-3 h-6 w-52" />
        <Skeleton className="mb-2 h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </Card>
    </div>
  );
}
