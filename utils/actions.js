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
export async function getNotes(topicSlug) {

  try {
    const supabase = await createClient()

    const { data: topicData, error: topicError } = await supabase
      .from('topics')
      .select()
      .eq('folder_name', topicSlug)

    if (topicError) {
      console.log(topicError)
      return { error: `code: ${topicError.code} / message: ${topicError.message}` }
    }

    const topic_id = topicData[0].id

    const { data, error: notesError } = await supabase
      .from('notes')
      .select()
      .eq('topic_id', topic_id)

    if (notesError) {
      console.log(notesError)
      return { error: `code: ${notesError.code} / message: ${notesError.message}` }
    }

    return { notes: data, topicTitle: topicData[0].title }

  } catch (error) {
    console.log(error)
    return null
  }
}
export async function createNote({ editorJSON, noteTitle, topicSlug, htmlState }) {

  let noteContent = ''
  const title = noteTitle
  const noteJSON = editorJSON
  const rows = JSON.parse(noteJSON).root.children
  rows.map(rowObject => {
    if (rowObject.children.length !== 0) {
      rowObject.children.map(row => {
        noteContent = noteContent + '\n' + row.text

      })
    } else {
      noteContent = noteContent + '\n'
    }
  })

  console.log("topicSlug: ", topicSlug);

  try {
    const supabase = await createClient()
    const { data: topicData, error: topicError } = await supabase
      .from('topics')
      .select()
      .eq('folder_name', topicSlug)

    if (topicError) {
      console.log(topicError)
      return { error: `code: ${topicError.code} / message: ${topicError.message}` }
    }

    const topic_id = topicData[0].id

    const { error: createNoteError } = await supabase
      .from('notes')
      .insert({ topic_id, content: noteContent, editor_json: noteJSON, editor_html: htmlState, title })

    if (createNoteError) {
      console.log(createNoteError)
      return { error: `code: ${createNoteError.code} / message: ${createNoteError.message}` }
    }

    return { message: "A jegyzet felmentve!" }

  } catch (error) {
    console.error(error)
    return { error: 'Valami hiba történt...' }
  }
}
export async function deleteNote(noteId) {

  try {
    const supabase = await createClient()

    const { error: deletDocumentSectionsError } = await supabase
      .from('document_sections')
      .delete()
      .eq('note_id', noteId)

    if (deletDocumentSectionsError) {
      console.log(deletDocumentSectionsError)
      return { error: `code: ${deletDocumentSectionsError.code} / message: ${deletDocumentSectionsError.message}` }
    }

    const { error: deleteNoteError } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId)

    if (deleteNoteError) {
      console.log(deleteNoteError)
      return { error: `code: ${deleteNoteError.code} / message: ${deleteNoteError.message}` }
    }

    return { message: 'A jegyzet törölve lett' }

  } catch (error) {
    console.log(error)
    return { error: 'Valami hiba történt...' }
  }
}

export async function createNoteEmbeddings({ noteId, topicSlug }) {

  try {
    const supabase = await createClient()
    const { data: topicData, error: topicError } = await supabase
      .from('topics')
      .select()
      .eq('folder_name', topicSlug)

    if (topicError) {
      console.log(topicError)
      return { error: `code: ${topicError.code} / message: ${topicError.message}` }
    }

    const topic_id = topicData[0].id

    const { data, error: noteError } = await supabase
      .from('notes')
      .select()
      .eq('id', noteId)

    if (noteError) {
      console.log(noteError)
      return { error: `code: ${noteError.code} / message: ${noteError.message}` }
    }

    const noteText = data[0].title + '\n' + data[0].content

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: noteText,
      encoding_format: "float",
    })

    const noteSection = { content: noteText, embedding: embedding.data[0].embedding, note_id: noteId, topic_id }
    const { error: insertDocumentSectionsError } = await supabase
      .from('document_sections')
      .insert(noteSection)

    if (insertDocumentSectionsError) {
      console.log(insertDocumentSectionsError)
      return { error: `code: ${insertDocumentSectionsError.code} / message: ${insertDocumentSectionsError.message}` }
    }

    const { error: updatedError } = await supabase
      .from('notes')
      .update({ embedded: true })
      .eq('id', noteId)

    if (updatedError) {
      console.log(updatedError)
      return { error: `code: ${updatedError.code} / message: ${updatedError.message}` }
    }
    return { message: "A jegyzet feldolgozva" }

  } catch (error) {
    console.error(error)
    return { error: 'Valami hiba történt...' }

  }
}