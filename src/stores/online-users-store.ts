import { defineStore } from 'pinia'
interface OnlineUsersState {
  onlineUsers: string[]
  receivedMessage: Message
}

interface Message {
  id: number
  message: string
  senderId: string
  senderName?: string
  imageUrl?: string
  createdOn: string
}

export const useOnlineUsersStore = defineStore('onlineUsers', {
  state: (): OnlineUsersState => ({
    onlineUsers: [],
    receivedMessage: { id: 0, message: '', senderId: '', createdOn: '' },
  }),
  actions: {
    updateOnlineUsers(users: string[]) {
      this.onlineUsers = users
    },
    receiveMessage(message: Message) {
      this.receivedMessage = message
    },
  },
})
