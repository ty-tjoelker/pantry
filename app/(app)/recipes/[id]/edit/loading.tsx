import { LoadingStatus, SkeletonPulse } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
      <LoadingStatus label="Loading recipe" />
      <SkeletonPulse className="h-12 w-full" />
      <SkeletonPulse className="h-20 w-full" />
      <SkeletonPulse className="h-12 w-full" />
      <SkeletonPulse className="h-32 w-full" />
    </div>
  );
}
