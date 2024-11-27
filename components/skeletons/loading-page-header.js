import { Skeleton } from "../ui/skeleton";

export default function LoadingPageHeader({ height }) {
  return (
    <div className="flex flex-col gap-4">
      <div className={`${height ? height : 'h-20'} `}>
        <Skeleton className="h-full w-full rounded-md bg-slate-100" />
      </div>
    </div>
  )
}
