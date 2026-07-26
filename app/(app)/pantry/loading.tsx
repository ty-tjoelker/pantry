import { LoadingStatus, SkeletonPulse } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="flex-1 space-y-4 px-4 pt-4">
      <LoadingStatus label="Loading pantry" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonPulse className="h-3 w-20" />
          <SkeletonPulse className="h-12 w-full" />
          <SkeletonPulse className="h-12 w-full" />
        </div>
      ))}
    </div>
  );
}
