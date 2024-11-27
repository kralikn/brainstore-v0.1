'use client'

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import LoadingPageHeader from "./skeletons/loading-page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { getTopic } from "@/utils/actions";

export default function ChatPageHeader({ topicId, url, subTitle }) {

  const { data, isPending } = useQuery({
    queryKey: ['chat', 'title', topicId],
    queryFn: () => getTopic(topicId),
  })

  const topicTitle = data?.topic?.title || ''
  const error = data?.error || ''

  if (isPending) return <LoadingPageHeader height='h-28' />
  if (error) {
    return <Badge variant="destructive" className="text-md w-1/2 mx-auto px-8 py-4">{error}</Badge>
  }

  return (
    <Card className="bg-slate-100 border-none flex justify-between items-end p-4">
      <CardHeader className="flex flex-row justify-between items-center w-full p-0">
        <div className="space-y-1">
          <CardTitle>
            <Button
              asChild
              variant='link'
              size='sm'
              className="p-0"
            >
              <Link href={'/dashboard/admin'} className='flex items-center gap-x-2'>
                <ChevronLeft size={32} /> Vissza
              </Link>
            </Button>
          </CardTitle>
          <CardTitle className="p-0">
            {topicTitle}
          </CardTitle>
          <CardDescription>{subTitle}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  )
}