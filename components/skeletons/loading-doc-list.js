import { Skeleton } from "../ui/skeleton";

export default function LoadingDocList() {
  return (
    <div className="w-full h-2/4 flex flex-col space-y-2">
      <div className="w-1/4 h-12">
        <Skeleton className="h-full rounded-md bg-slate-100" />
      </div>
      <div className="w-full h-10">
        <Skeleton className="h-full rounded-md bg-slate-100" />
      </div>
      <div className="w-full h-10">
        <Skeleton className="h-full rounded-md bg-slate-100" />
      </div>
      <div className="w-full h-10">
        <Skeleton className="h-full rounded-md bg-slate-100" />
      </div>
    </div>
  )
}
