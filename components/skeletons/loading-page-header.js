import { Skeleton } from "../ui/skeleton";

export default function LoadingPageHeader() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-20">
        <Skeleton className="h-full w-full rounded-md bg-gray-200" />
      </div>
    </div>
  )
}
