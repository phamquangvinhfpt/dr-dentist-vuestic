import signalRService from '@/signalR/index'

class ChatService {
  public async sendMessage(receiverId: string, message: string) {
    try {
      await signalRService.invoke('SendMessage', receiverId, message)
    } catch (err) {
      console.error('Error sending message:', err)
    }
  }

  public onReceiveMessage(callback: (message: any) => void) {
    signalRService.on('ReceiveMessage', callback)
  }

  public onReceiveConversation(callback: (conversation: any) => void) {
    signalRService.on('ReceiveConversation', callback)
  }

  public async getListUserDto(): Promise<any[] | null> {
    try {
      const result = await signalRService.invoke('GetListUserDto')
      return result
    } catch (err) {
      console.error('Error getting list message:', err)
      throw err
    }
  }

  public async getConversation(patientId: string): Promise<any | null> {
    try {
      return await signalRService.invoke('GetConversation', patientId)
    } catch (err) {
      console.error('Error getting conversation:', err)
    }
  }

  public onUserOnline(callback: (username: string[]) => void) {
    signalRService.on('UserIsOnline', callback)
  }

  public onUserOffline(callback: (username: string) => void) {
    signalRService.on('UserIsOffline', callback)
  }

  public disconnect() {
    signalRService.off('ReceiveMessage')
    signalRService.off('UserIsOnline')
    signalRService.off('UserIsOffline')
    signalRService.off('ReceiveConversation')
  }
}

export const chatService = new ChatService()
