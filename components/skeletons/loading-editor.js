import { Skeleton } from "../ui/skeleton";

export default function LoadingEditor() {

  return (
    <div className='col-span-6 flex flex-col items-start gap-2'>
      <div className='h-12 w-full mb-2'>
        <Skeleton className="h-full w-full rounded-md bg-slate-100" />
      </div>
      <div className='h-12 w-full'>
        <Skeleton className="h-full w-full rounded-md bg-slate-100" />
      </div>
      <div className='h-96 w-full mb-2'>
        <Skeleton className="h-full w-full rounded-md bg-slate-100" />
      </div>
      <div className='h-12 w-1/6'>
        <Skeleton className="h-full w-full rounded-md bg-slate-100" />
      </div>

    </div>
  )
}
