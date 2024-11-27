'use client'

import { useQuery } from "@tanstack/react-query"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"
import NotesListItem from "./note-list-item"
import { getNotes } from "@/utils/actions"


export default function NotesList({ topicSlug }) {

  const { data, isFetching, isPending } = useQuery({
    queryKey: ['notes', topicSlug],
    queryFn: () => getNotes(topicSlug),
  })

  const notes = data?.notes || []
  const error = data?.error || ''

  if (isFetching || isPending) return <p>töltés...</p>
  if (error) {
    return <Badge variant="destructive" className="text-md w-1/2 mx-auto px-8 py-4">{error}</Badge>
  }

  return (
    <Card className='w-full h-full p-4'>
      <CardHeader className="p-0">
        <CardTitle className="text-xl">Jegyzetek</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {notes.map(note => {
          return (
            <div key={note.id} className="space-y-4">
              <Separator className="mt-4" />
              <NotesListItem
                note={note}
                topicSlug={topicSlug}
              />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}