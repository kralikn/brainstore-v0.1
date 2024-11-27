'use client'

import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ChevronLeft } from "lucide-react";
import { getNotes } from "@/utils/actions";
import { Badge } from "./ui/badge";
import { useQuery } from "@tanstack/react-query";
import LoadingPageHeader from "./skeletons/loading-page-header";

export default function PageHeader({ topicSlug, url, subTitle }) {

  const { data, isFetching, isPending } = useQuery({
    queryKey: ['notes', topicSlug],
    queryFn: () => getNotes(topicSlug),
  })

  const topicTitle = data?.topicTitle || ""
  const error = data?.error || ''

  if (isFetching || isPending) return <LoadingPageHeader />
  if (error) {
    return <Badge variant="destructive" className="text-md w-1/2 mx-auto px-8 py-4">{error}</Badge>
  }

  return (
    <Card className="bg-slate-100 border-none flex justify-between items-end p-4">
      <CardHeader className="flex flex-row justify-between items-center w-full p-0">
        <div className="space-y-1">
          <CardTitle className="p-0">
            {topicTitle}
          </CardTitle>
          <CardDescription>{subTitle}</CardDescription>
        </div>
        <CardTitle>
          <Button
            asChild
            variant='link'
            size='sm'
          >
            <Link href={url} className='flex items-center gap-x-2'>
              <ChevronLeft size={32} /> Vissza
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
    </Card>
  )
}