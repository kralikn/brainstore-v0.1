'use client'

import { useState, useEffect, useRef } from "react";
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import MessagesConatiner from "./messages-conatiner";
import { Loader2, SendHorizontal } from 'lucide-react'
import { useMutation } from "@tanstack/react-query";
import { generateChatResponse } from "@/utils/actions";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { CardDescription } from "../ui/card";
import { questionSchema } from "@/utils/schemas";

export default function ChatWindow({ topicId }) {

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
    mutationFn: (values) => generateChatResponse(values),
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

  const onSubmit = (values) => {
    const query = { role: 'user', content: values.chat_message }
    mutate({ prevMessages: [...messages], query, topicId })
    setMessages((prev) => [...prev, query])
  }

  return (
    <div className="grid grid-rows-[1fr,auto,auto] h-full border rounded-lg px-6 py-4 gap-4">
      <MessagesConatiner messagesEndRef={messagesEndRef} messages={messages} isPending={isPending} />
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
                <FormItem className="flex-1">
                  <FormControl >
                    <Input placeholder="" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : <SendHorizontal />}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
