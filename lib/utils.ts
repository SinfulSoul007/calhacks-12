import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

export function generateRoomId(prefix = 'GHOST') {
  const num = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${num}`
}

