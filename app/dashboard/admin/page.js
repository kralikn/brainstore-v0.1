// import LoadingTopics from "@/components/loading-topics"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query'
import { Suspense } from "react"

import NewTopicForm from "@/components/forms/new-topic-form";
import { getAllTopics } from '@/utils/actions';
import TopicList from '@/components/topics/topic-list';
import LoadingTopics from '@/components/skeletons/loading-topics';

const queryClient = new QueryClient()

async function Topics() {
  await queryClient.fetchQuery({
    queryKey: ['topics'],
    queryFn: () => getAllTopics(),
  })
  return <TopicList />
}

export default async function AdminPage() {

  return (
    <div className="flex flex-col gap-4">
      <NewTopicForm />
      <Suspense fallback={<LoadingTopics />}>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Topics />
        </HydrationBoundary>
      </Suspense>
    </div>
  )
}