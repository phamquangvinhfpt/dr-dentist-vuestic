import {
  HttpTransportType,
  HubConnection,
  HubConnectionBuilder,
  IHttpConnectionOptions,
  JsonHubProtocol,
  LogLevel,
} from '@microsoft/signalr'
import jwtService from '@/services/jwt.service'

class SignalRService {
  private connection: HubConnection | null = null
  private token: string | null = null
  private readonly RECONNECT_DELAYS = [0, 2000, 5000, 10000, 30000]
  private readonly TIMEOUT_MS = 30000
  private readonly KEEP_ALIVE_INTERVAL_MS = 15000
  private handlers = new Map<string, (...args: any[]) => void>()
  private isInitialized = false

  constructor() {
    // Initialize token in constructor
    this.token = jwtService.getToken()
  }

  private getAccessToken = (): string | Promise<string> => {
    this.token = jwtService.getToken() // Always get fresh token
    if (this.token === null) {
      throw new Error('Token is not available')
    }
    return this.token
  }

  async initialize(url: string) {
    if (this.isInitialized) {
      return
    }

    await this.connect(url)
    this.isInitialized = true
  }

  async connect(url: string) {
    if (this.connection?.state === 'Connected') {
      console.log('Already connected to SignalR.')
      await this.disconnect()
    }

    await this.setupConnection(url)
  }

  private async setupConnection(url: string) {
    try {
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

      // Setup event handlers before starting connection
      this.setupEventHandlers()

      await this.connection.start()

      if (this.connection.state === 'Connected') {
        console.log('Successfully connected to SignalR')
        // Register handlers after successful connection
        this.registerHandlers()
      } else {
        throw new Error('Connection not established')
      }
    } catch (error) {
      console.error('Error in setupConnection:', error)
      throw error
    }
  }

  private setupEventHandlers() {
    if (!this.connection) return

    this.connection.onclose(async (error) => {
      console.error('Connection closed:', error)
      this.isInitialized = false
    })

    this.connection.onreconnecting((error) => {
      console.warn('Attempting to reconnect:', error)
    })

    this.connection.onreconnected((connectionId) => {
      console.log('Reconnected successfully. Connection ID:', connectionId)
      // Re-register handlers after reconnection
      this.registerHandlers()
    })
  }

  private registerHandlers() {
    if (!this.connection) return

    // Clear existing handlers first
    this.connection.off('NotificationFromServer')
    this.connection.off('UpdateOnlineUsers')
    this.connection.off('ReceiveMessage')
    this.connection.off('HeartbeatResponse')

    // Register new handlers
    // this.connection.on('NotificationFromServer', this.handleReceiveNotification)
    // this.connection.on('UpdateOnlineUsers', this.handleUserIsOnline)
    // this.connection.on('ReceiveMessage', this.handleReceiveMessage)
    // this.connection.on('HeartbeatResponse', this.handleCheckHeartbeat)

    // Register any additional handlers from the handlers Map
    this.handlers.forEach((callback, eventName) => {
      this.connection?.on(eventName, callback)
    })
  }

  // private handleReceiveNotification = (type: string, notification: any) => {
  //   console.log('Received notification:', type, notification)
  //   const handler = this.handlers.get('NotificationFromServer')
  //   if (handler) {
  //     handler(type, notification)
  //   }
  // }

  // private handleUserIsOnline = (users: any[], staffs: any[]) => {
  //   console.log('Users online:', users, 'Staffs online:', staffs)
  //   const handler = this.handlers.get('UpdateOnlineUsers')
  //   if (handler) {
  //     handler(users, staffs)
  //   }
  // }

  // private handleReceiveMessage = (message: any) => {
  //   console.log('Received message:', message)
  //   const handler = this.handlers.get('ReceiveMessage')
  //   if (handler) {
  //     handler(message)
  //   }
  // }

  // private handleCheckHeartbeat = () => {
  //   console.log('Heartbeat checked')
  //   const handler = this.handlers.get('HeartbeatResponse')
  //   if (handler) {
  //     handler()
  //   }
  // }

  async reconnectWithToken(url: string) {
    this.token = jwtService.getToken()
    if (this.token) {
      await this.disconnect()
      await this.connect(url)
    } else {
      console.error('Token is still not available after login.')
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.stop()
      this.isInitialized = false
    }
  }

  on(eventName: string, callback: (...args: any[]) => void) {
    if (!eventName || !callback) {
      throw new Error('EventName and callback are required')
    }
    this.handlers.set(eventName, callback)
    if (this.connection?.state === 'Connected') {
      this.connection.on(eventName, callback)
    }
  }

  off(eventName: string) {
    if (this.connection) {
      this.connection.off(eventName)
    }
    this.handlers.delete(eventName)
  }

  async invoke<T>(methodName: string, ...args: any[]): Promise<T | void> {
    if (!methodName) {
      throw new Error('Method name is required')
    }
    if (this.connection?.state === 'Connected') {
      try {
        return await this.connection.invoke<T>(methodName, ...args)
      } catch (err) {
        console.error(`Error invoking method ${methodName}:`, err)
      }
    } else {
      console.warn('Cannot invoke method: Connection not established')
    }
  }

  isConnected() {
    return this.connection?.state === 'Connected'
  }
}

const signalRService = new SignalRService()
export default signalRService
