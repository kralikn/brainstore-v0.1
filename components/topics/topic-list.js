'use client'

import { getAllTopics } from "@/utils/actions"
import { useQuery } from "@tanstack/react-query"
import TopicCard from "./topic-card"
import LoadingTopics from "../skeletons/loading-topics"
import { Badge } from "../ui/badge"

export default function TopicList() {

  const { data, isPending, isFetching } = useQuery({
    queryKey: ['topics'],
    queryFn: () => getAllTopics()
  })

  const topics = data || []
  const error = data?.error || ''

  if (isPending || isFetching) return <LoadingTopics />
  if (error) {
    return <Badge variant="destructive" className="text-md w-1/2 mx-auto px-8 py-4">{error}</Badge>
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {topics.map(topic => <TopicCard key={topic.id} topic={topic} />)}
    </div>
  )
}
