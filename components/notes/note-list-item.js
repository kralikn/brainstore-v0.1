'use client'

import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FilePenLine, FileStack, Loader2, StickyNote, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { createNoteEmbeddings, deleteNote } from "@/utils/actions";


export default function NotesListItem({ note, topicSlug, }) {

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { mutate: mutateDeleteNote, isPending: deleteIsPending } = useMutation({
    mutationFn: (values) => deleteNote(values),
    onSuccess: (data) => {
      if (data?.error) {
        toast({
          variant: "destructive",
          description: data.error,
        });
        return;
      }
      toast({ description: data.message })
      queryClient.invalidateQueries({ queryKey: ['notes', topicSlug] })
    },
  })
  const { mutate: mutatemutateCreateNoteEmbedding, isPending: createEmbeddingIsPending } = useMutation({
    mutationFn: (values) => createNoteEmbeddings(values),
    onSuccess: (data) => {
      if (data?.error) {
        toast({
          variant: "destructive",
          description: data.error,
        });
        return;
      }
      toast({ description: data.message })
      queryClient.invalidateQueries({ queryKey: ['notes', topicSlug] })
    },
  })

  const handleDeleteNote = () => {
    mutateDeleteNote(note.id)
  }

  const handleCreateNoteEmbedding = () => {
    mutatemutateCreateNoteEmbedding({ noteId: note.id, topicSlug })
  }

  return (
    <div className="flex justify-between items-center gap-4">
      <div className="flex gap-3 items-center">
        <StickyNote size={18} />
        <div className="text-base">{note.title}</div>
      </div>
      <div className="space-x-2">
        <Button size='sm' variant="" onClick={handleCreateNoteEmbedding} disabled={deleteIsPending || createEmbeddingIsPending || note.embedded}>
          {false ? <Loader2 className="animate-spin" /> : <FileStack />}
        </Button>
        <Button asChild size="sm" variant="">
          <Link href={`/dashboard/admin/${topicSlug}/notes/${note.id}`}>
            <FilePenLine />
          </Link>
        </Button>
        <Button variant="destructive" size="sm" onClick={handleDeleteNote} disabled={deleteIsPending || createEmbeddingIsPending}>
          {deleteIsPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
        </Button>
      </div>
    </div>
  )
}