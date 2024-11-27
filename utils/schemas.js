import * as z from 'zod';

export const newTopicSchema = z.object({
  topic_title: z.string().min(3, {
    message: "Legalább 3 karakter!"
  }),
})

export const noteTitleSchema = z.object({
  noteTitle: z.string().min(3, {
    message: "Legalább 6 karakter!"
  }),
})