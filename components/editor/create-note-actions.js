import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, CLEAR_HISTORY_COMMAND } from 'lexical';

import { CloudUpload, Loader2, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { noteTitleSchema } from '@/utils/schemas';
import { createNote } from '@/utils/actions';
import LoadingNoteList from '../skeletons/loading-note-list';

export default function CreateNoteActions({ noteTitle, topicSlug, setNoteTitle, setErrors, htmlState }) {

  const [editor] = useLexicalComposerContext()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { mutate, isPending, isLoading } = useMutation({
    mutationFn: (values) => createNote(values),
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
      setNoteTitle('')
      editor.update(() => {
        $getRoot().clear();
        editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
      });
    },
  })

  const handleSubmitNote = () => {
    const result = noteTitleSchema.safeParse({ noteTitle })
    if (result.success) {
      setErrors([])
      const editorState = editor.getEditorState()
      const json = editorState.toJSON()
      const editorJSON = JSON.stringify(json)
      mutate({ editorJSON, noteTitle, topicSlug, htmlState })

    } else {
      setErrors(result.error.formErrors.fieldErrors.noteTitle);
    }
  }

  const handleResetNote = async () => {
    editor.update(() => {
      $getRoot().clear()
      editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined)
    })
  }

  return (
    <div className="mt-4 space-x-4">
      <Button
        onClick={handleSubmitNote}
        disabled={isPending}
        size="sm"
      >
        {isPending ? <Loader2 className="animate-spin" /> : <CloudUpload />}Mentés
      </Button>
      <Button
        onClick={handleResetNote}
        disabled={isPending}
        size="sm"
      >
        {isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}Mégsem
      </Button>
    </div>
  )
}