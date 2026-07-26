import { LoadingStatus, SkeletonPulse } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-24 pt-4">
      <LoadingStatus label="Loading meal plan" />
      <SkeletonPulse className="mx-auto h-5 w-40" />
      <div className="mt-4 space-y-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <SkeletonPulse className="h-3 w-20" />
            <SkeletonPulse className="h-9 w-full" />
            <SkeletonPulse className="h-9 w-full" />
            <SkeletonPulse className="h-9 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
