import UpdateNoteEditor from '@/components/editor/update-note-editor';
import PageHeader from '@/components/page-header';
import LoadingEditor from '@/components/skeletons/loading-editor';
import LoadingPageHeader from '@/components/skeletons/loading-page-header';
import { getNote } from '@/utils/actions';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { Suspense } from "react"

const queryClient = new QueryClient()

async function UpdateNoteEditorFunction({ topicSlug, noteSlug }) {

  await queryClient.fetchQuery({
    queryKey: ['note', topicSlug, noteSlug],
    queryFn: () => getNote({ topicSlug, noteSlug }),
  })

  return <UpdateNoteEditor topicSlug={topicSlug} noteSlug={noteSlug} />
}

export default async function UpdateNotePage({ params }) {

  const { topicSlug, noteSlug } = await params

  return (
    <div className="flex flex-col gap-4">
      <Suspense fallback={<LoadingPageHeader />}>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <PageHeader topicSlug={topicSlug} url={`/dashboard/admin/${topicSlug}/notes`} subTitle="Jegyzet szerkesztése" />
        </HydrationBoundary>
      </Suspense>
      <div className="grid grid-cols-12 gap-4">
        <Suspense fallback={<LoadingEditor />}>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <UpdateNoteEditorFunction topicSlug={topicSlug} noteSlug={noteSlug} />
          </HydrationBoundary>
        </Suspense>
      </div>
    </div>
  )
}