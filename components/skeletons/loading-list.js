import { Skeleton } from "../ui/skeleton";

export default function LoadingList() {
  return (
    <div className="col-span-6">
      <Skeleton className="h-2/6 rounded-md bg-slate-100" />
    </div>
  )
}
