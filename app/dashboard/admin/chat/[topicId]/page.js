import ChatPageHeader from '@/components/chat-page-header';
import ChatContainer from '@/components/chat/chat-container';
import LoadingChat from '@/components/skeletons/loading-chat';
import LoadingDocList from '@/components/skeletons/loading-doc-list';
import LoadingPageHeader from '@/components/skeletons/loading-page-header';
import { getSouerceForChat, getTopic } from '@/utils/actions'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { Suspense } from 'react';

const queryClient = new QueryClient()

async function ChatContainerFunction({ topicId }) {
  await queryClient.prefetchQuery({
    queryKey: ['chat', 'source', topicId],
    queryFn: () => getSouerceForChat(topicId),
  });
  return (
    <>
      <ChatContainer topicId={topicId} />
    </>
  )
}
async function ChatPageHeaderFunction({ topicId }) {
  await queryClient.prefetchQuery({
    queryKey: ['chat', 'title', topicId],
    queryFn: () => getTopic(topicId),
  });
  return (
    <>
      <ChatPageHeader topicId={topicId} />
    </>
  )
}

export default async function ChatPage({ params }) {

  const { topicId } = await params

  return (
    <div className="flex flex-col gap-4" >
      <Suspense fallback={<LoadingPageHeader height='h-24' />}>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <ChatPageHeaderFunction topicId={topicId} />
        </HydrationBoundary>
      </Suspense>
      <Suspense fallback={<LoadingChat />}>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <ChatContainerFunction topicId={topicId} />
        </HydrationBoundary>
      </Suspense>
    </div>
  )
}
