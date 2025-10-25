"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function JoinPage() {
  const [code, setCode] = useState('')
  const router = useRouter()
  function join() {
    if (!code) return
    router.push(`/r/${code.toUpperCase()}`)
  }
  return (
    <div className="centered-card">
      <Card className="w-full max-w-md">
        <CardHeader className="text-lg font-semibold">Join a Room</CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Enter code e.g. GHOST-4829" value={code} onChange={(e) => setCode(e.target.value)} />
          <Button onClick={join} className="w-full">JOIN</Button>
        </CardContent>
      </Card>
    </div>
  )
}

