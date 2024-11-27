'use client'

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { HeadingNode } from '@lexical/rich-text';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $generateHtmlFromNodes } from '@lexical/html';
import { CLEAR_HISTORY_COMMAND } from 'lexical';

import { useState } from "react";
import { Alert, AlertDescription } from "../ui/alert";
import { Input } from "../ui/input";
import ToolbarPlugin from "./toolbar-plugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { MyOnChangePlugin } from "./on-change-plugin";
import { useQuery } from "@tanstack/react-query";
import EditorLoadPlugin from "./editor-load-plugin";
import { getNote } from "@/utils/actions";
import UpdateNoteAction from "./update-note-action";
import LoadingEditor from "../skeletons/loading-editor";

const theme = {
  heading: {
    h1: 'text-4xl',
    h2: 'text-3xl',
    h3: 'text-2xl'
  },
  text: {
    bold: 'font-bold',
    italic: 'italic',
    strikethrough: 'line-through',
    underline: 'underline',
  },
}
const onError = (error) => {
  console.error(error);
}
const initialConfig = {
  namespace: 'Note-Update-Editor',
  theme,
  onError,
  nodes: [HeadingNode]
}

export default function UpdateNoteEditor({ topicSlug, noteSlug }) {

  const { data, isLoading, isPending, isFetching } = useQuery({
    queryKey: ['note', topicSlug, noteSlug],
    queryFn: () => getNote({ topicSlug, noteSlug }),
  })

  const note = data?.note || []
  const title = note.title || ''

  const [noteTitle, setNoteTitle] = useState('')
  const [errors, setErrors] = useState([])
  const [isFirstRender, setIsFirstRender] = useState(true)
  const [editorState, setEditorState] = useState()
  const [htmlState, setHtmlState] = useState()


  const onChange = ({ editorState, editor }) => {
    console.log("editorState: ", editorState);
    const editorStateJSON = editorState.toJSON();
    setEditorState(JSON.stringify(editorStateJSON));
    editorState.read(() => {
      setHtmlState($generateHtmlFromNodes(editor))
    })
  }

  const handleEditorLoad = (editor) => {
    if (note && isFirstRender) {
      editor.update(async () => {
        const editorState = editor.parseEditorState(note.editor_json)
        editor.setEditorState(editorState);
      });
      setNoteTitle(title)
      setHtmlState(note.editor_html)
      setIsFirstRender(false);
      editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined)
    }
  }

  if (isPending || isLoading || isFetching) return <LoadingEditor />

  return (
    <div className='col-span-6 flex flex-col items-start gap-2'>
      <div className='w-full mb-2'>
        <Input
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          placeholder="A jegyzeted címe..."
        />
        {errors.length > 0 && <Alert variant="destructive" className='border-none p-0 pl-3 py-2 '>
          <AlertDescription className='text-xs'>{errors[0]}</AlertDescription>
        </Alert>}
      </div>
      <LexicalComposer initialConfig={initialConfig}>
        <div className='w-full'>
          <div className='mb-2'>
            <ToolbarPlugin />
          </div>
          <RichTextPlugin
            contentEditable={<ContentEditable className='w-full h-[calc(100vh-30rem)] max-h-[calc(100vh-23.75rem)] overflow-y-auto border rounded-md p-4' />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          {data && (
            <EditorLoadPlugin onLoad={handleEditorLoad} />
          )}
          <MyOnChangePlugin onChange={onChange} />
          <UpdateNoteAction
            noteTitle={noteTitle}
            topicSlug={topicSlug}
            noteSlug={noteSlug}
            setErrors={setErrors}
            htmlState={htmlState}
          />
        </div>
      </LexicalComposer>
    </div>
  )
}