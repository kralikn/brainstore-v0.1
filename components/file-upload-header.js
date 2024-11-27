'use client'

import { useQuery } from "@tanstack/react-query"
import LoadingPageHeader from "./skeletons/loading-page-header"
import { Badge } from "./ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { getFiles } from "@/utils/actions"
import FileUploadForm from "./forms/file-upload-form"

export default function FileUploadHeader({ topicSlug }) {

  const { data, isFetching, isPending } = useQuery({
    queryKey: ['topic', topicSlug],
    queryFn: () => getFiles(topicSlug),
  })

  const topicTitle = data?.topicTitle || ""
  const error = data?.error || ''

  if (isPending) return <LoadingPageHeader height='h-28' />
  if (error) {
    return <Badge variant="destructive" className="text-md w-1/2 mx-auto px-8 py-4">{error}</Badge>
  }

  return (
    <Card className="bg-slate-100 border-none flex justify-between p-4">
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
          <CardDescription>Dokumentumok hozzáadása</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="w-2/4 flex items-center p-0 m-0">
        <FileUploadForm topicSlug={topicSlug} />
      </CardContent>
    </Card>
  )
}