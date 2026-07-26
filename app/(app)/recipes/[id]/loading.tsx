import { LoadingStatus, SkeletonPulse } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
      <LoadingStatus label="Loading recipe" />
      <SkeletonPulse className="h-7 w-2/3" />
      <SkeletonPulse className="mt-3 h-4 w-1/3" />
      <div className="mt-6 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonPulse key={i} className="h-5 w-full" />
        ))}
      </div>
    </div>
  );
}
