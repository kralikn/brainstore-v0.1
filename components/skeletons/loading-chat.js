import { Skeleton } from "../ui/skeleton";

export default function LoadingChat() {

  return (
    <div className='flex flex-row gap-2'>
      <div className='h-[calc(100vh-16rem)] w-full'>
        <Skeleton className="h-full w-full rounded-md bg-slate-100" />
      </div>
      <div className='h-[calc(100vh-16rem)] w-full'>
        <Skeleton className="h-full w-full rounded-md bg-slate-100" />
      </div>
    </div>
  )
}
