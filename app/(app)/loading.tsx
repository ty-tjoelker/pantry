import { LoadingStatus, SkeletonPulse } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col">
      <LoadingStatus label="Loading grocery list" />
      <div className="px-4 pt-4">
        <SkeletonPulse className="h-12 w-full" />
      </div>
      <div className="mt-4 space-y-4 px-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <SkeletonPulse className="h-3 w-24" />
            <SkeletonPulse className="h-12 w-full" />
            <SkeletonPulse className="h-12 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
