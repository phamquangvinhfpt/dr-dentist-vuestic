export type ListMessageDto = {
  id: string
  senderId?: string
  latestMessage?: string
  SenderName?: string
  IsRead?: boolean
  ImageUrl?: string
  CreatedOn: Date
}
