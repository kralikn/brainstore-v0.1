'use client'

import { useQuery } from "@tanstack/react-query"
import { getFiles } from "@/utils/actions"
import DocsLisItem from "./doc-list-item"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"
import DocLisItem from "./doc-list-item"
import LoadingDocList from "../skeletons/loading-doc-list"
// import LoadingDocsList from "./loading-docs-list";


export default function DocList({ topicSlug }) {

  const { data, isLoading, isRefetching } = useQuery({
    queryKey: ['topic', topicSlug],
    queryFn: () => getFiles(topicSlug),
  })

  const docs = data?.docs || []

  if (isLoading || isRefetching) return <LoadingDocList />

  return (
    <Card className='w-full h-full p-4 space-y-6'>
      <CardHeader className="p-0 mb-2">
        <CardTitle className="text-xl">Dokumentumok</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {docs.map(doc => {
          return (
            <div key={doc.id} className="space-y-2">
              <Separator className="mt-2" />
              <DocLisItem
                doc={doc}
                topicSlug={topicSlug}
              />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
