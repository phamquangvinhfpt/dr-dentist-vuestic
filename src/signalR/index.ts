import jwtService from '@/services/jwt.service'
import {
  HttpTransportType,
  HubConnection,
  HubConnectionBuilder,
  IHttpConnectionOptions,
  JsonHubProtocol,
  LogLevel,
} from '@microsoft/signalr'

class SignalRService {
  private connection: HubConnection | null = null
  private token: string | null = jwtService.getToken()
  private readonly RECONNECT_DELAYS = [0, 2000, 5000, 10000, 30000]
  private readonly TIMEOUT_MS = 30000
  private readonly KEEP_ALIVE_INTERVAL_MS = 15000
  // private reconnectAttempts = 0
  // private maxReconnectAttempts = 10

  private getAccessToken = (): string | Promise<string> => {
    if (this.token === null) {
      throw new Error('Token is not available')
    }
    return this.token
  }

  async connect(url: string) {
    if (this.connection && this.connection.state === 'Connected') {
      console.log('Already connected to SignalR.')
      return
    }

    if (this.token) {
      console.log('Connecting to SignalR...')
      const option: IHttpConnectionOptions = {
        accessTokenFactory: () => this.getAccessToken(),
        transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
        timeout: this.TIMEOUT_MS,
      }
      this.connection = new HubConnectionBuilder()
        .withUrl(url, option)
        .withAutomaticReconnect(this.RECONNECT_DELAYS)
        .withHubProtocol(new JsonHubProtocol())
        .configureLogging(LogLevel.Information)
        .build()

      this.connection.keepAliveIntervalInMilliseconds = this.KEEP_ALIVE_INTERVAL_MS
      this.connection.serverTimeoutInMilliseconds = this.TIMEOUT_MS * 2

      this.connection.onclose(async (error) => {
        console.error('Connection closed:', error)
        // if (this.reconnectAttempts < this.maxReconnectAttempts) {
        //   this.reconnectAttempts++
        //   console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        //   await this.connect(url)
        // } else {
        //   console.error('Max reconnection attempts reached. Please check your network connection.')
        // }
      })

      this.connection.onreconnecting((error) => {
        console.warn('Attempting to reconnect:', error)
      })

      this.connection.onreconnected((connectionId) => {
        console.log('Reconnected successfully. Connection ID:', connectionId)
        // this.reconnectAttempts = 0
      })

      // this.connection.onclose((error) => {
      //   console.warn('Attempting to close', error)
      // })
      try {
        await this.connection.start()
        if (!this.connection || this.connection.state !== 'Connected') {
          throw new Error('Connection not established')
        }
        await this.connection.stop()
        await this.connection.start()
      } catch (error) {
        console.error('Error connecting to SignalR:', error)
        // if (this.reconnectAttempts < this.maxReconnectAttempts) {
        //   this.reconnectAttempts++
        //   console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        //   setTimeout(() => this.connect(url), this.RECONNECT_DELAYS[this.reconnectAttempts] || 120000)
        // }
      }
    } else {
      const url = import.meta.env.VITE_APP_BASE_URL
      const url_without_api = url.slice(0, -3)
      const path = url_without_api + 'notifications'
      await this.reconnectWithToken(`${path}`)
    }
  }

  async reconnectWithToken(url: string) {
    this.token = jwtService.getToken()
    if (this.token) {
      await this.connect(url)
    } else {
      console.error('Token is still not available after login.')
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.stop()
    }
    // this.reconnectAttempts = 0
  }

  on(eventName: any, callback: any) {
    if (this.connection) {
      this.connection.on(eventName, callback)
    }
  }

  off(eventName: any) {
    if (this.connection) {
      this.connection.off(eventName)
    }
  }

  async invoke(methodName: any, ...args: any) {
    if (this.connection) {
      try {
        return await this.connection.invoke(methodName, ...args)
      } catch (err) {
        console.error(`Error invoking method ${methodName}:`, err)
      }
    }
  }

  isConnected() {
    if (this.connection) {
      return this.connection.state === 'Connected'
    }
    return false
  }
}
const signalRService = new SignalRService()
export default signalRService
