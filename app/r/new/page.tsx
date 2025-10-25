"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { generateRoomId } from '@/lib/utils'

export default function NewRoomRedirect() {
  const router = useRouter()
  useEffect(() => {
    const id = generateRoomId()
    router.replace(`/r/${id}`)
  }, [router])
  return null
}

