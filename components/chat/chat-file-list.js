'use client'

import { getSouerceForChat } from "@/utils/actions"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"
import ChatFileItem from "./chat-file-item"
import ChatNoteItem from "./chat-note-item"
import LoadingDocList from "../skeletons/loading-doc-list"
// import ChatFileItem from "./chat-file-item"
// import ChatNoteItem from "./chat-note-item"

export default function ChatFileList({ topicId }) {


  const { data, isLoading, isPending } = useQuery({
    queryKey: ['chat', 'source', topicId],
    queryFn: () => getSouerceForChat(topicId),
  })

  const docs = data?.docs || []
  const notes = data?.notes || []
  const docsCount = data?.docsCount || 0
  const notesCount = data?.notesCount || 0

  if (isLoading || isPending) return <LoadingDocList />

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="">Források</CardTitle>
        <div className="flex h-5 items-center space-x-4">
          <CardDescription className="text-xs">{`${docsCount} dokumentum`}</CardDescription>
          <Separator orientation="vertical" />
          <CardDescription className="text-xs">{`${notesCount} jegyzet`}</CardDescription>
        </div>
      </CardHeader>
      {(docs.length > 0) && <>
        <Separator className="mb-4" />
        <CardContent className="space-y-4 text-xs">
          {docs.map(doc => {
            return <ChatFileItem key={doc.id} doc={doc} />
          })}
        </CardContent>
      </>}
      {(notes.length > 0) && <>
        <Separator className="mb-4" />
        <CardContent className="space-y-4 text-xs">
          {notes.map(note => {
            return <ChatNoteItem key={note.id} note={note} />
          })}
        </CardContent>
      </>}
    </Card>
  )
}
