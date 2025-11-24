import { SermonDetail } from '@/components/dashboard/sermons/SermonDetail';
import React from 'react'

const SermonPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  return (
   <SermonDetail sermonId={id} />
  )
}

export default SermonPage