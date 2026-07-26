import { LoadingStatus, SkeletonPulse } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col">
      <LoadingStatus label="Loading recipes" />
      <div className="flex items-center gap-2 px-4 pt-4">
        <SkeletonPulse className="h-12 flex-1" />
        <SkeletonPulse className="h-11 w-11 shrink-0" />
      </div>
      <div className="mt-4 space-y-3 px-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonPulse key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}
