import jwtService from '@/services/jwt.service'
import { HubConnection, HubConnectionBuilder, IHttpConnectionOptions } from '@microsoft/signalr'

class SignalRService {
  private connections: Map<string, HubConnection> = new Map()
  private token: string | null = jwtService.getToken()

  private getAccessToken = (): string | Promise<string> => {
    if (this.token === null) {
      throw new Error('Token is not available')
    }
    return this.token
  }

  async connect(url: string, hubName: string) {
    if (this.connections.has(hubName) && this.connections.get(hubName)?.state === 'Connected') {
      console.log(`Already connected to ${hubName} hub.`)
      return
    }

    if (this.token) {
      const option: IHttpConnectionOptions = {
        accessTokenFactory: () => this.getAccessToken(),
      }
      const connection = new HubConnectionBuilder().withUrl(url, option).withAutomaticReconnect().build()
      try {
        await connection.start()
        this.connections.set(hubName, connection)
        console.log(`Connected to ${hubName} hub.`)
      } catch (error) {
        console.error(`Error connecting to ${hubName} hub:`, error)
      }
    }
  }

  async disconnect(hubName: string) {
    const connection = this.connections.get(hubName)
    if (connection) {
      await connection.stop()
      this.connections.delete(hubName)
      console.log(`Disconnected from ${hubName} hub.`)
    }
  }

  on(hubName: string, eventName: string, callback: (...args: any[]) => void) {
    const connection = this.connections.get(hubName)
    if (connection) {
      connection.on(eventName, callback)
    } else {
      console.error(`No connection found for hub: ${hubName}`)
    }
  }

  off(hubName: string, eventName: string) {
    const connection = this.connections.get(hubName)
    if (connection) {
      connection.off(eventName)
    } else {
      console.error(`No connection found for hub: ${hubName}`)
    }
  }

  async invoke(hubName: string, methodName: string, ...args: any[]) {
    const connection = this.connections.get(hubName)
    if (connection) {
      try {
        return await connection.invoke(methodName, ...args)
      } catch (err) {
        console.error(`Error invoking method ${methodName} on hub ${hubName}:`, err)
      }
    } else {
      console.error(`No connection found for hub: ${hubName}`)
    }
  }
}

const signalRService = new SignalRService()
export default signalRService
