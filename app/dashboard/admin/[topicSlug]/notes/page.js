import PageHeader from "@/components/page-header";
import LoadingPageHeader from "@/components/skeletons/loading-page-header";
import { Suspense } from "react";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import CreateNoteEditor from "@/components/editor/create-note-editor";
import NotesList from "@/components/notes/note-list";
import { getNotes } from "@/utils/actions";
import LoadingList from "@/components/skeletons/loading-list";

const queryClient = new QueryClient()

async function Notes({ topicSlug }) {
  await queryClient.fetchQuery({
    queryKey: ['notes', topicSlug],
    queryFn: () => getNotes(topicSlug),
  });
  return (
    <>
      <div className='col-span-6 flex flex-col items-start gap-2'>
        <NotesList topicSlug={topicSlug} />
      </div>
    </>
  )
}

export default async function NotesPage({ params }) {

  const { topicSlug } = await params

  return (
    <div className="flex flex-col gap-4">
      <Suspense fallback={<LoadingPageHeader height='h-28' />}>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <PageHeader topicSlug={topicSlug} url={`/dashboard/admin`} subTitle="Jegyzetek hozzáadása" />
        </HydrationBoundary>
      </Suspense>
      <div className="grid grid-cols-12 gap-4">
        <CreateNoteEditor topicSlug={topicSlug} />
        <Suspense fallback={<LoadingList />}>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <Notes topicSlug={topicSlug} />
          </HydrationBoundary>
        </Suspense>
      </div>
    </div>
  )

}