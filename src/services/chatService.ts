import signalRService from '@/signalR/index'

class ChatService {
  private hubName = 'messageHub'

  public async sendMessage(receiverId: string, message: string) {
    try {
      await signalRService.invoke(this.hubName, 'SendMessage', receiverId, message)
    } catch (err) {
      console.error('Error sending message:', err)
    }
  }

  public onReceiveMessage(callback: (message: any) => void) {
    signalRService.on(this.hubName, 'ReceiveMessage', callback)
  }

  public onReceiveConversation(callback: (conversation: any) => void) {
    console.log('Receive conversation')
    signalRService.on(this.hubName, 'ReceiveConversation', callback)
  }

  public async getListUserDto(): Promise<any[] | null> {
    try {
      const result = await signalRService.invoke(this.hubName, 'GetListUserDto')
      return result
    } catch (err) {
      console.error('Error getting list message:', err)
      throw err
    }
  }

  public async getConversation(patientId: string): Promise<any | null> {
    try {
      return await signalRService.invoke(this.hubName, 'GetConversation', patientId)
    } catch (err) {
      console.error('Error getting conversation:', err)
    }
  }

  public onUserOnline(callback: (username: string[]) => void) {
    signalRService.on(this.hubName, 'UserIsOnline', callback)
  }

  public onUserOffline(callback: (username: string) => void) {
    signalRService.on(this.hubName, 'UserIsOffline', callback)
  }

  public disconnect() {
    signalRService.off(this.hubName, 'ReceiveMessage')
    signalRService.off(this.hubName, 'UserIsOnline')
    signalRService.off(this.hubName, 'UserIsOffline')
    signalRService.off(this.hubName, 'ReceiveConversation')
  }
}

export const chatService = new ChatService()
