'use client'

import Link from "next/link"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"
import { deleteTopic } from "@/utils/actions"
import { FilePlus2, Loader2, MessageSquareMore, Pencil, SquarePen, Trash2 } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"

export default function TopicCard({ topic }) {

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { mutate, isPending } = useMutation({
    mutationFn: (topic) => deleteTopic(topic),
    onSuccess: (data) => {
      if (data?.error) {
        toast({
          variant: "destructive",
          description: data.error,
        });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['topics'] })
      toast({ description: data.message })
    },
  });

  const handleSubmit = (topic) => {
    mutate(topic)
  }

  return (
    <Card className="space-y-8 px-4">
      <CardHeader className="space-y-3 flex flex-col items-start px-0">
        <CardTitle className="text-xl uppercase">{topic.title}</CardTitle>
        <div className="space-x-4">
          <Badge variant="outline" className="px-3 py-1 text-gray-500">{`${topic.doc_count ? topic.doc_count : '0'} dokumentum`}</Badge>
          <Badge variant="outline" className="px-3 py-1 text-gray-500">{`${topic.note_count ? topic.note_count : '0'} jegyzet`}</Badge>
        </div>
      </CardHeader>
      <CardFooter className="flex justify-between px-0">
        <div className="flex items-center gap-4">
          <Button asChild size='sm' variant="secondary">
            <Link href={`/dashboard/admin/${topic.folder_name}/documents`}>
              <FilePlus2 /> Dokumentum feltöltés
            </Link>
          </Button>
          <Button asChild size='sm' variant="secondary">
            <Link href={`/dashboard/admin/${topic.folder_name}/notes`}>
              <SquarePen /> Jegyzet feltöltés
            </Link>
          </Button>
          {(topic.has_doc_embedded || topic.has_note_embedded) &&
            <Button asChild size="sm" variant="outline">
              <Link href={`/dashboard/admin/chat/${topic.id}`}>
                <MessageSquareMore />
              </Link>
            </Button>
          }
        </div>
        <Button size='sm' variant="destructive" onClick={() => handleSubmit(topic)} disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
        </Button>
      </CardFooter>
    </Card>
  )
}
