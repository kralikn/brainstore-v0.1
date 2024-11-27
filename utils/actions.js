'use server'

import { newTopicSchema } from "./schemas";
import { createClient } from "./supabase/server";
import { redirect } from 'next/navigation';


// await new Promise(resolve => setTimeout(resolve, 6000))

export async function socialAuth() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.BASIC_URL}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    },
  })
  if (data.url) {
    redirect(data.url)
  }
}
export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  redirect('/')
}
export async function getAllTopics() {

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('topics')
      .select()

    if (error) {
      console.log(error)
      return { error: `code: ${error.code} / message: ${error.message}` }
    }

    let { data: groupByData, error: groupByError } = await supabase
      .rpc('count_documents_and_notes_by_topic')

    if (groupByError) {
      console.log(groupByError)
      return { error: `code: ${groupByError.code} / message: ${groupByError.message}` }
    }
    const mergedData = data.map(row => {
      const matchingData = groupByData.find(g_row => g_row.topic_id === row.id);
      if (matchingData) {
        return { ...row, doc_count: matchingData.doc_count, has_doc_embedded: matchingData.has_doc_embedded, note_count: matchingData.note_count, has_note_embedded: matchingData.has_note_embedded }
      } else {
        return row
      }
    })

    return mergedData

  } catch (error) {
    console.log(error)
    return { error: 'Valami hiba történt...' }
  }
}
export async function createTopic(values) {

  const { topic_title } = values
  const folder_name = topic_title.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .replace(/-/g, "")
    .toLowerCase();

  try {

    newTopicSchema.parse(values)

    const supabase = await createClient()
    const { error } = await supabase
      .from('topics')
      .insert({ title: topic_title, folder_name })

    if (error) {
      console.log(error)
      return { error: `code: ${error.code} / message: ${error.message}` }
    }

    return { message: "A témakör létrehozva!" }

  } catch (error) {
    console.error(error)
    return { error: 'Valami hiba történt...' }
  }
}
export async function deleteTopic(topic) {

  const { id } = topic

  try {
    const supabase = await createClient()
    const { data: seletedData, error: selectError } = await supabase
      .from('documents')
      .select('id, doc_path')
      .eq('topic_id', id)

    if (selectError) {
      console.log("selectError: ", selectError)
      return { error: `code: ${selectError.code} / message: ${selectError.message}` }
    }

    const { error: deletedDocumentSectionsError } = await supabase
      .from('document_sections')
      .delete()
      .eq('topic_id', id)

    if (deletedDocumentSectionsError) {
      console.log("deletedDocumentSectionsError: ", deletedDocumentSectionsError)
      return { error: `code: ${deletedDocumentSectionsError.code} / message: ${deletedDocumentSectionsError.message}` }
    }

    const { error: deletedDocumentsError } = await supabase
      .from('documents')
      .delete()
      .eq('topic_id', id)

    if (deletedDocumentsError) {
      console.log("deletedDocumentsError: ", deletedDocumentsError)
      return { error: `code: ${deletedDocumentsError.code} / message: ${deletedDocumentsError.message}` }
    }

    if (seletedData.length > 0) {

      const pathArray = seletedData.map(path => path.doc_path)

      const { error: deleteDocsError } = await supabase
        .storage
        .from('brainstore')
        .remove(pathArray)

      if (deleteDocsError) {
        console.log("deleteDocsError: ", deleteDocsError)
        return { error: `code: ${deleteDocsError.code} / message: ${deleteDocsError.message}` }
      }
    }

    const { data: deletedNotes, error: deletedNotesError } = await supabase
      .from('notes')
      .delete()
      .eq('topic_id', id)

    console.log(id);

    if (deletedNotesError) {
      console.log("deletedNotesError: ", deletedNotesError)
      return { error: `code: ${deletedNotesError.code} / message: ${deletedNotesError.message}` }
    }

    const { error: deleteTopicError } = await supabase
      .from('topics')
      .delete()
      .eq('id', id)

    if (deleteTopicError) {
      console.log(deleteTopicError)
      return { error: `code: ${deleteTopicError.code} / message: ${deleteTopicError.message}` }
    }

    return { message: "A témakör törölve!" }

  } catch (error) {
    console.error(error)
    return { error: 'Valami hiba történt...' }
  }
}