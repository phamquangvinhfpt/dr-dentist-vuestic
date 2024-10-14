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
      console.log('updateOnlineUsers', users)
    },
    receiveMessage(message: Message) {
      console.log('value', message)
      this.receivedMessage = message
      console.log('value of rêcvied', this.receivedMessage)
    },
  },
})
