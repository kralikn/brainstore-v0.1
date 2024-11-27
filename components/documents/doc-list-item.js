// import SignedUrl from "./signed-url"

import { File, FilePenLine, FileStack, Loader2, StickyNote, Trash2 } from "lucide-react"
import DeleteDocButton from "./delete-doc-button"
import { Button } from "../ui/button"
import Link from "next/link"
import CreateEmbeddingsButton from "./create-embeddings-button"
import SignedUrl from "./signed-url"

export default function DocLisItem({ doc, topicSlug }) {

  const { doc_original_name, signedUrl } = doc

  return (
    <div className="flex justify-between items-center gap-4">
      <div className="flex gap-3 items-center">
        <File size={18} />
        <div className="text-sm">{doc_original_name.slice(0, -4)}</div>
      </div>
      <div className="space-x-2">
        <SignedUrl signedUrl={signedUrl} />
        <CreateEmbeddingsButton doc={doc} topicSlug={topicSlug} />
        <DeleteDocButton doc={doc} topicSlug={topicSlug} />
      </div>
    </div>
  )
}
