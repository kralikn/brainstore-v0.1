import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CLEAR_HISTORY_COMMAND } from "lexical";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { CloudUpload, Loader2 } from "lucide-react";
import { noteTitleSchema } from "@/utils/schemas";
import { updateNote } from "@/utils/actions";
import { useRouter } from "next/navigation";

export default function UpdateNoteAction({ noteTitle, topicSlug, noteSlug, setErrors, htmlState }) {

  const [editor] = useLexicalComposerContext()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const router = useRouter()

  const { mutate, isPending } = useMutation({
    mutationFn: (values) => updateNote(values),
    onSuccess: (data) => {
      if (data?.error) {
        toast({
          variant: "destructive",
          description: data.error,
        });
        return;
      }
      toast({ description: data.message })
      queryClient.invalidateQueries({ queryKey: ['topic', topicSlug, noteSlug] })
      editor.update(() => {
        editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
      });
      router.back()
    },
  })

  const handleSubmitNote = () => {
    const result = noteTitleSchema.safeParse({ noteTitle })
    if (result.success) {
      setErrors([])
      const editorState = editor.getEditorState()
      const json = editorState.toJSON()
      const editorJSON = JSON.stringify(json)
      mutate({ editorJSON, noteTitle, noteSlug, htmlState, topicSlug })

    } else {
      setErrors(result.error.formErrors.fieldErrors.noteTitle);
    }
  }

  return (
    <div className="mt-4 space-x-4">
      <Button
        onClick={handleSubmitNote}
        disabled={isPending}
      >
        {isPending ? <Loader2 className="animate-spin" /> : <CloudUpload />}Frissítés
      </Button>
    </div>
  )

}