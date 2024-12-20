'use client'

import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { deleteDocument } from "@/utils/actions";
import { Button } from "../ui/button";


export default function DeleteDocButton({ doc, topicSlug }) {

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { mutate, isPending } = useMutation({
    mutationFn: (doc) => deleteDocument(doc),
    onSuccess: (data) => {
      if (data?.error) {
        toast({
          variant: "destructive",
          description: data.error,
        });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['topic', topicSlug] })
      toast({ description: data.message })
    },
  });

  const handleSubmit = (doc) => {
    mutate(doc)
  }
  return (
    <Button onClick={() => handleSubmit(doc)} size="sm" variant="destructive" disabled={isPending}>
      {isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
    </Button>

  )
}
