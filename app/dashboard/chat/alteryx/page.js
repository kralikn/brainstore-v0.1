'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { generateSubChatResponse, saveSubChatMessages } from "@/utils/actions";
import { questionSchema } from "@/utils/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bot, CloudUpload, Loader2, SendHorizontal, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

export default function AlteryxChatPage() {

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [messages, setMessages] = useState([]);
  const [tokens, setTokens] = useState({ prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 });

  const messagesEndRef = useRef(null)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const form = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      chat_message: "",
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (values) => generateSubChatResponse(values),
    onSuccess: (data) => {
      if (!data) {
        toast({
          description: 'Valami hiba történt...',
        });
        form.reset()
        return;
      }
      form.reset()
      setMessages((prev) => [...prev, data.message])
      setTokens((prevTokens) => ({
        total_tokens: prevTokens.total_tokens + data.tokens.total_tokens,
        completion_tokens: data.tokens.completion_tokens,
        prompt_tokens: data.tokens.prompt_tokens
      }))
    },
    onError: (error) => {
      toast({
        description: error.message || 'Ismeretlen hiba történt...',
      });
      form.reset();
    }
  })
  const { mutate: mutateChatMessages, isPending: isPendindSaveChatMessages } = useMutation({
    mutationFn: (values) => saveSubChatMessages(values),
    onSuccess: (data) => {
      if (data?.error) {
        toast({
          variant: "destructive",
          description: data.error,
        });
        return;
      }
      toast({ description: data.message })
      // form.reset()
      // setMessages((prev) => [...prev, data.message])
      // setTokens((prevTokens) => ({
      //   total_tokens: prevTokens.total_tokens + data.tokens.total_tokens,
      //   completion_tokens: data.tokens.completion_tokens,
      //   prompt_tokens: data.tokens.prompt_tokens
      // }))
    }
  })

  const saveMessages = () => {
    mutateChatMessages(messages)
  }
  const onSubmit = (values) => {
    const query = { role: 'user', content: values.chat_message }
    mutate({ prevMessages: [...messages], query })
    setMessages((prev) => [...prev, query])
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex justify-between items-center bg-slate-100 border-none p-4">
        <CardHeader className="p-0">
          <CardTitle>
            Alteryx
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">

        </CardContent>
      </Card>

      <div className='grid grid-cols-12 h-[calc(100vh-16rem)] gap-4'>
        <div className='col-span-6'>
          <div className="grid grid-rows-[1fr,auto,auto] h-full border rounded-lg px-6 py-4 gap-4">
            <div className='max-h-[calc(100vh-23.75rem)] overflow-y-auto flex flex-col space-y-2 pr-2'>
              {messages && messages.map(({ role, content }, index) => {
                const icon = role === 'user' ? <User /> : <Bot />
                return <div key={index} className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-2 px-4 py-3 items-start w-4/5 rounded-lg ${role === "user" ? 'border' : "bg-zinc-100"}`}>
                    <span>{icon}</span>
                    <p>{content}</p>
                  </div>
                </div>

              })}
              {isPending && <div className="flex justify-start">
                <div className="flex flex-col space-y-3 mt-4">
                  <Skeleton className="h-4 w-[300px]" />
                  <Skeleton className="h-4 w-[275px]" />
                </div>
              </div>}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex justify-between pl-2 w-3/4">
              <CardDescription className="text-xs">{`prompt tokes: ${tokens.prompt_tokens}`}</CardDescription>
              <CardDescription className="text-xs">{`completion tokes: ${tokens.completion_tokens}`}</CardDescription>
              <CardDescription className="text-xs">{`total tokes: ${tokens.total_tokens}`}</CardDescription>
            </div>
            <div className="w-full">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="chat_message"
                    render={({ field }) => (
                      <FormItem className="w-3/4">
                        <FormControl >
                          <Input placeholder="" {...field} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isPending || isPendindSaveChatMessages}>
                    {isPending ? <Loader2 className="animate-spin" /> : <SendHorizontal />}
                  </Button>
                  {/* <Button onClick={saveMessages} disabled={isPending || messages.length === 0} className="ml-auto">
                    {isPending ? <Loader2 className="animate-spin" /> : <CloudUpload />}
                  </Button> */}
                </form>
              </Form>
            </div>
          </div>
        </div>
        <div className='col-span-6 h-full'>
          {/* korábbi beszélgetések listája */}
          <Button onClick={saveMessages} disabled={isPending || isPendindSaveChatMessages} className="ml-auto">
            {isPending ? <Loader2 className="animate-spin" /> : <CloudUpload />}
          </Button>
          <p>korábbi beszélgetések listája</p>
        </div>
      </div>
    </div >
  )
}
