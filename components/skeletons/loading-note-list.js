import { Skeleton } from "../ui/skeleton";

export default function LoadingNoteList() {
  return (
    <div className='col-span-6 flex flex-col items-start gap-2'>
      <div className="w-1/4 h-12">
        <Skeleton className="h-full rounded-md bg-slate-100" />
      </div>
      <div className="w-full h-8">
        <Skeleton className="h-full rounded-md bg-slate-100" />
      </div>
      <div className="w-full h-8">
        <Skeleton className="h-full rounded-md bg-slate-100" />
      </div>
      <div className="w-full h-8">
        <Skeleton className="h-full rounded-md bg-slate-100" />
      </div>
    </div>
  )
}
