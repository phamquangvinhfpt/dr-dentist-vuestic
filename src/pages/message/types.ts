export type ListMessageDto = {
  id: string
  senderId?: string
  latestMessage?: string
  SenderName?: string
  IsRead?: boolean
  ImageUrl?: string
  CreatedOn: Date
}

export type User = {
  id: string
  name: string
  lastMessage?: string
  imageUrl?: string
  isOnline?: boolean
  createdOn?: string
}

export type Message = {
  id: number
  content: string
  sender: 'me' | 'other'
  name?: string
  imageUrl?: string
  imagesUrl?: string[]
  originalTime?: string
  time?: string
}
