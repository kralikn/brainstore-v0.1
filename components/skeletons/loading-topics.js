import { Skeleton } from "../ui/skeleton";

export default function LoadingTopics() {
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className='col-span-1 h-48'>
        <Skeleton className="h-full w-full rounded-md bg-slate-100" />
      </div>
      <div className='col-span-1 h-48'>
        <Skeleton className="h-full w-full rounded-md bg-slate-100" />
      </div>
    </div>
  )
}
