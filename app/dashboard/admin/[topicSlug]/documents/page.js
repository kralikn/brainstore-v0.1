import DocList from "@/components/documents/doc-list";
import FileUploadHeader from "@/components/file-upload-header"
import LoadingDocList from "@/components/skeletons/loading-doc-list";
import LoadingPageHeader from "@/components/skeletons/loading-page-header";
import { getFiles } from "@/utils/actions";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { Suspense } from "react"

const queryClient = new QueryClient()

async function FileUploadFunction({ topicSlug }) {
  await queryClient.fetchQuery({
    queryKey: ['topic', topicSlug],
    queryFn: () => getFiles(topicSlug),
  });
  return (
    <>
      <FileUploadHeader topicSlug={topicSlug} />
    </>
  )
}

async function DocsListFunction({ topicSlug }) {
  await queryClient.prefetchQuery({
    queryKey: ['topic', topicSlug],
    queryFn: () => getFiles(topicSlug),
  });
  return (
    <>
      <DocList topicSlug={topicSlug} />
    </>
  )
}

export default async function TopicPage({ params }) {

  const { topicSlug } = await params

  return (
    <div className="flex flex-col gap-4">
      <Suspense fallback={<LoadingPageHeader height='h-28' />}>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <FileUploadFunction topicSlug={topicSlug} />
        </HydrationBoundary>
      </Suspense>
      <Suspense fallback={<LoadingDocList />}>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <DocsListFunction topicSlug={topicSlug} />
        </HydrationBoundary>
      </Suspense>
    </div>
  )
}