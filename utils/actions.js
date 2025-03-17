'use server'

import { fileSchema, newTopicSchema } from "./schemas";
import { createClient } from "./supabase/server";
import { redirect } from 'next/navigation';
import OpenAI from 'openai'
import PdfParse from 'pdf-parse/lib/pdf-parse'
import { v4 as uuidv4 } from 'uuid'

const openAIApiKey = process.env.OPEN_AI_KEY
const openai = new OpenAI({
  apiKey: openAIApiKey
})

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
export async function getTopic(topicId) {

  try {
    const supabase = await createClient()
    const { data, error: topicError } = await supabase
      .from('topics')
      .select()
      .eq('id', topicId)

    if (topicError) {
      console.log(topicError)
      return { error: `code: ${topicError.code} / message: ${topicError.message}` }
    }
    console.log(data);
    return { topic: data[0] }

  } catch (error) {
    console.error(error)
    return { error: 'Valami hiba történt...' }
  }
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
export async function getNote(data) {

  const { topicSlug, noteSlug } = data

  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('notes')
      .select()
      .eq('id', noteSlug)

    if (error) {
      console.log(error)
      return { error: `code: ${error.code} / message: ${error.message}` }
    }

    return { note: data[0] }

  } catch (error) {
    console.error(error)
    return { error: 'Valami hiba történt...' }
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
export async function updateNote({ editorJSON, noteTitle, noteSlug, htmlState, topicSlug }) {

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

  try {
    const supabase = await createClient()
    const { error: updateNoteError } = await supabase
      .from('notes')
      .update({ content: noteContent, editor_json: noteJSON, editor_html: htmlState, title })
      .eq('id', noteSlug)

    if (updateNoteError) {
      console.log(updateNoteError)
      return { error: `code: ${updateNoteError.code} / message: ${updateNoteError.message}` }
    }

    const noteText = title + '\n' + noteContent

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: noteText,
      encoding_format: "float",
    })

    const { error: updateDocumentSectionsError } = await supabase
      .from('document_sections')
      .update({ content: noteText, embedding: embedding.data[0].embedding })
      .eq('note_id', noteSlug)

    if (updateDocumentSectionsError) {
      console.log(updateDocumentSectionsError)
      return { error: `code: ${updateDocumentSectionsError.code} / message: ${updateDocumentSectionsError.message}` }
    }

    return { message: "A jegyzet frissítve!" }

  } catch (error) {
    console.error(error)
    return { error: 'Valami hiba történt...' }
  }
}
export async function getSignedUrl(docPath) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.storage
      .from('brainstore')
      .createSignedUrl(`${docPath}`, 60)
    if (error) {
      console.log(error)
      return { error: `code: ${error.code} / message: ${error.message}` }
    }
    return data
  } catch (error) {
    console.error(error)
    return { error: 'Valami hiba történt...' }
  }
}
export async function getFiles(topicSlug) {

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

    const { data, error } = await supabase
      .from('documents')
      .select()
      .eq('topic_id', topic_id)

    if (error) {
      console.log(error)
      return { error: `code: ${error.code} / message: ${error.message}` }
    }

    // itt még kell hibakezelés
    const docsWithSignedUrl = await Promise.all(
      data.map(async (item) => {
        const { signedUrl } = await getSignedUrl(item.doc_path)
        item.signedUrl = signedUrl
        return item
      })
    )

    return { docs: docsWithSignedUrl, topicTitle: topicData[0].title }

  } catch (error) {
    console.error(error)
    return { error: 'Valami hiba történt...' }
  }
}
export async function uploadFile(data) {

  const { formData, topicSlug } = data
  const file = formData.get('topic_file')
  const result = fileSchema.safeParse({ file })
  if (!result.success) {
    const errors = result.error.errors.map((error) => error.message)
    return { error: errors.join(',') }
  }

  const fileName = `${uuidv4()}.pdf`

  try {

    const supabase = await createClient()
    const { data: uploadedFile, error } = await supabase.storage
      .from('brainstore')
      .upload(`${topicSlug}/${fileName}`, result.data.file)

    if (error) {
      console.log(error)
      return { error: `code: ${error.code} / message: ${error.message}` }
    }

    const { data: selectData, error: selectTopicError } = await supabase
      .from('topics')
      .select()
      .eq('folder_name', topicSlug)

    if (selectTopicError) {
      console.log(selectTopicError)
      return { error: `code: ${selectTopicError.code} / message: ${selectTopicError.message}` }
    }

    const newDocument = {
      doc_path: uploadedFile.path,
      doc_original_name: file.name,
      topic_id: selectData[0].id
    }

    const { error: insertDocumentError } = await supabase
      .from('documents')
      .insert(newDocument)
      .select()

    if (insertDocumentError) {
      console.log(insertDocumentError)
      return { error: `code: ${insertDocumentError.code} / message: ${insertDocumentError.message}` }
    }

    return { message: "A fájl sikeresen feltöltve!" }

  } catch (error) {
    console.error(error)
    return { error: 'Valami hiba történt...' }
  }
}
export async function deleteDocument(doc) {

  const { id, doc_path } = doc

  try {
    const supabase = await createClient()
    const { error: deleteSectionsError } = await supabase
      .from('document_sections')
      .delete()
      .eq('doc_id', id)

    if (deleteSectionsError) {
      console.log(deleteSectionsError)
      return { error: `code: ${deleteSectionsError.code} / message: ${deleteSectionsError.message}` }
    }

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)

    if (error) {
      console.log(error)
      return { error: `code: ${error.code} / message: ${error.message}` }
    }

    const { error: deleteDocError } = await supabase
      .storage
      .from('brainstore')
      .remove([doc_path])

    if (deleteDocError) {
      console.log(deleteDocError)
      return { error: `code: ${deleteDocError.code} / message: ${deleteDocError.message}` }
    }

    return { message: "A fájl törölve!" }

  } catch (error) {
    console.error(error)
    return { error: 'Valami hiba történt...' }
  }
}
export async function createEmbeddings(doc) {

  const { id, doc_path, topic_id } = doc

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.storage
      .from('brainstore')
      .download(doc_path)

    const pdfData = await data.arrayBuffer()
    const docContent = await PdfParse(pdfData)
    const cleanPageBreaks = docContent.text.replace(/^\d+\s*\n/gm, '')             // hivatkozási számok eltávolítása
    const chaptersArray = cleanPageBreaks.split(' \n \n \n \n')

    const cleanedChaptersArray = []
    chaptersArray.forEach(chapter => {
      if (chapter.length !== 0) cleanedChaptersArray.push(chapter.replace(/\s+/g, ' ').trim())
    })

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: cleanedChaptersArray,
      encoding_format: "float",
    })

    const documentSections = embedding.data.map((item, index) => {
      return { content: cleanedChaptersArray[index], embedding: item.embedding, doc_id: id, topic_id }
    })

    const { error: insertError } = await supabase
      .from('document_sections')
      .insert(documentSections)

    if (insertError) {
      console.log(insertError)
      return { error: `code: ${insertError.code} / message: ${insertError.message}` }
    }

    const { data: updatedDoc, error: updateError } = await supabase
      .from('documents')
      .update({ embedded: true })
      .eq('id', id)

    if (updateError) {
      console.log(updateError)
      return { error: `code: ${updateError.code} / message: ${updateError.message}` }
    }

    return { message: "A dokumentum feldolgozva" }

  } catch (error) {
    console.error(error)
    return { error: 'Valami hiba történt...' }
  }
}
export async function getSouerceForChat(topicId) {

  try {
    const supabase = await createClient()
    const { count, data: documentsData, error: documentsError } = await supabase
      .from('documents')
      .select('*', { count: 'exact' })
      .eq('topic_id', topicId)
      .eq('embedded', true)

    if (documentsError) {
      console.log(documentsError)
      return { error: `code: ${documentsError.code} / message: ${documentsError.message}` }
    }
    const { count: notesCount, data: notesData, error: notesError } = await supabase
      .from('notes')
      .select('*', { count: 'exact' })
      .eq('topic_id', topicId)
      .eq('embedded', true)

    if (notesError) {
      console.log(notesError)
      return { error: `code: ${notesError.code} / message: ${notesError.message}` }
    }

    const { data: topicData, error: topicError } = await supabase
      .from('topics')
      .select()
      .eq('id', topicId)

    if (topicError) {
      console.log(topicError)
      return { error: `code: ${topicError.code} / message: ${topicError.message}` }
    }

    // ide kell még hibakezelés
    const docsWithSignedUrl = await Promise.all(
      documentsData.map(async (item) => {
        const { signedUrl } = await getSignedUrl(item.doc_path)
        item.signedUrl = signedUrl
        return item
      })
    )

    return { docsCount: count, notesCount: notesCount, topicTitle: topicData[0].title, docs: docsWithSignedUrl, notes: notesData }

  } catch (error) {
    console.error(error)
    return { error: 'Valami hiba történt...' }
  }

}
export async function generateChatResponse({ prevMessages, query, topicId }) {

  try {

    const supabase = await createClient()

    // 1. standalone question
    let queryEmbedding
    const queryEmbeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query.content,
      encoding_format: "float",
    })

    queryEmbedding = queryEmbeddingResponse.data[0].embedding

    let context = ''

    let { data, error } = await supabase
      .rpc('match_documents_by_topic_id', {
        match_count: 6,
        p_topic_id: topicId,
        query_embedding: queryEmbedding
      })

    if (error) {
      console.log(error)
      return { error: `code: ${error.code} / message: ${error.message}` }
    }

    data.map((item, index) => {
      if (index + 1 === data.length) {
        context += `${item.content.trim()}`
      } else {
        context += `${item.content.trim()}\n\n---\n\n`
      }
    })

    const prompt = `Felhasználó aktuális kérdése/kérése: "${query.content}"
    Kontextus:
    ${context}`

    const systemContent = `Te egy mesterséges intelligenciával működő asszisztens vagy, amely segít a felhasználónak kérdéseket megválaszolni a megadott dokumentumrészletek és a korábbi beszélgetés alapján.
                          Csak az itt megadott és a korábbi üzenetekben található információkat használd a pontos válasz megfogalmazásához.
                          Ha a megadott információkból nem tudsz egyértelmű választ adni, kérlek, válaszolj a következő sablon szerint:
                          "Sajnálom, de a rendelkezésre álló információk alapján erre a kérdésre jelenleg nem tudok válaszolni."`

    let messagesForPrompt = []
    if (prevMessages.length < 1) {
      messagesForPrompt = [{ role: "system", content: systemContent }, { role: "user", content: prompt }]
    } else {
      messagesForPrompt = [{ role: "system", content: systemContent }, ...prevMessages, { role: "user", content: prompt }]
    }

    const completion = await openai.chat.completions.create({
      messages: messagesForPrompt,
      model: "gpt-4o-mini",
      // model: "gpt-4o-2024-11-20",
      // max_completion_tokens: 1500,
      temperature: 0
    })
    const { prompt_tokens, completion_tokens, total_tokens } = completion.usage
    const { role, content } = completion.choices[0].message

    return { message: { role, content }, tokens: { prompt_tokens, completion_tokens, total_tokens } }

  } catch (error) {
    console.error(error)
    return { error: 'Valami hiba történt...' }
  }
}
export async function createComparison(notes) {

  const { firstNote, secondNote } = notes
  const prompt = `Az összehasonlítandó szövegek:
    első szöveg:
    ${firstNote}

    második szöveg:
    ${secondNote}
    `

  const systemContent = `Egy segítőkész asszisztens vagy, aki a kapott szövegeket hasonlítja össze, és az összes eltérést egy JSON-formátumú tömbben adja vissza, ahol minden eltérés külön elemként szerepel. 

    A különbségek legyenek tömören és érthetően megfogalmazva, és pontosan utaljanak arra, hogy az eltérés melyik szövegből származik. Kérlek, az eltérések típusát (pl. hiányzó szöveg, eltérő tartalom) is említsd. Ha nincs eltérés a szövegek között, egy üres tömböt adj vissza.

    Kizárólag a tömböt add vissza válaszként, minden más szöveg nélkül.

    Példa a válasz struktúrájára: 
    [
      "Az első eltérés leírása.",
      "A második eltérés leírása.",
      "A harmadik eltérés leírása."
    ]
    `

  try {

    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: systemContent }, { role: "user", content: prompt }],
      model: "gpt-4o-mini",
      temperature: 0
    })

    const { content } = completion.choices[0].message
    console.log(content);
    return { response: content }

  } catch (error) {
    console.error(error)
    return { error: 'Valami hiba történt...' }
  }


}
