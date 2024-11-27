'use client'

import { FileStack, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEmbeddings } from "@/utils/actions";
import { Button } from "../ui/button";


export default function CreateEmbeddingsButton({ doc, topicSlug }) {

  const { embedded } = doc

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { mutate, isPending } = useMutation({
    mutationFn: (doc) => createEmbeddings(doc),
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
    <Button onClick={() => handleSubmit(doc)} size='sm' variant="" disabled={embedded || isPending}>
      {isPending ? <Loader2 className="animate-spin" /> : <FileStack />}
    </Button>

  )
}
