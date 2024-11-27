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

export const fileSchema = z.object({
  file: validateFile()
})

function validateFile() {
  const acceptedFileTypes = ['application/pdf']
  return z.instanceof(File).refine((file) => {
    return !file || acceptedFileTypes.some((type) => file.type.startsWith(type))
  }, 'Csak pdf tölthető fel!')
}

export const questionSchema = z.object({
  chat_message: z.string().min(2, {
    message: "Legalább 2 karakter!"
  }),
})