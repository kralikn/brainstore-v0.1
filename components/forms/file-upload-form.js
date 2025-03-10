'use client'

import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { CloudUpload, Loader2 } from "lucide-react";
import { uploadFile } from "@/utils/actions";

export default function FileUploadForm({ topicSlug }) {

  const { toast } = useToast()
  const { register, handleSubmit, reset } = useForm()
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: (formData) => uploadFile(formData),
    onSuccess: (data) => {
      if (data?.error) {
        toast({
          variant: "destructive",
          description: data.error,
        });
        return;
      }
      toast({ description: data.message })
      reset()
      queryClient.invalidateQueries({ queryKey: ['topic', topicSlug] })
    },
  });

  const onSubmit = (data) => {
    if (!data.topic_file[0]) {
      toast({
        description: 'Kérjük, válasszon egy fájlt!',
      });
      return;
    }
    const formData = new FormData();
    formData.append('topic_file', data.topic_file[0]); // Fájl hozzáadása a formData-hoz
    mutate({ formData, topicSlug });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full flex gap-4">
      <Input
        type="file"
        id="topic_file"
        name="topic_file"
        placeholder="Fájl kiválasztása..."
        required
        accept="application/pdf"
        {...register("topic_file")}
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="animate-spin" /> : <CloudUpload />} Feltöltés
      </Button>
    </form>
  )

}