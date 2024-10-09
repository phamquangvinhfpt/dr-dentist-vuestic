import { defineStore } from 'pinia'

interface OnlineUsersState {
  onlineUsers: string[]
}

export const useOnlineUsersStore = defineStore('onlineUsers', {
  state: (): OnlineUsersState => ({
    onlineUsers: [],
  }),
  actions: {
    updateOnlineUsers(users: string[]) {
      this.onlineUsers = users
      console.log('updateOnlineUsers', users)
    },
    addOnlineUser(username: string) {
      if (!this.onlineUsers.includes(username)) {
        this.onlineUsers.push(username)
      }
    },
    removeOnlineUser(username: string) {
      const index = this.onlineUsers.indexOf(username)
      if (index > -1) {
        this.onlineUsers.splice(index, 1)
      }
    },
    anyStaffOnline(users: string[]) {
      return users.some((user) => user.includes('staff'))
    },
  },
})
