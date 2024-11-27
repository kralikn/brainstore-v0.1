'use client'

import { newTopicSchema } from "@/utils/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Button } from "../ui/button";
import { FolderPlus, Loader2 } from "lucide-react";
import { createTopic } from "@/utils/actions";
import { Input } from "../ui/input";

export default function NewTopicForm() {

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(newTopicSchema),
    defaultValues: {
      topic_title: "",
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (values) => createTopic(values),
    onSuccess: (data) => {
      if (data?.error) {
        toast({
          variant: "destructive",
          description: data.error,
        });
        return;
      }
      toast({ description: data.message })
      form.reset()
      queryClient.invalidateQueries({ queryKey: ['topics'] })
    }
  });

  const onSubmit = (values) => {
    mutate(values)
  }
  return (
    <Card className="flex justify-between items-center bg-slate-100 border-none p-4">
      <CardHeader className="p-0">
        <CardTitle>
          Témakör hozzáadása
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-4">
            <FormField
              control={form.control}
              name="topic_title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Új témakör címe..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : <FolderPlus />}Létrehozás
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
