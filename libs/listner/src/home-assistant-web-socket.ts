import { ReplaySubject, BehaviorSubject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { logging } from './utils/logging';

// Create a proper type hierarchy instead of one generic interface
export type IMessageBase = {
  type: string;
  id?: number;
};

export type ISubscribeMessage = IMessageBase & {
  type:
    | 'get_states'
    | 'get_services'
    | 'call_service'
    | 'subscribe_events'
    | 'config/area_registry/list'
    | 'config/device_registry/list'
    | 'config/entity_registry/list';

  event_type?: 'state_changed';
};

export type IAuthMessage = IMessageBase & {
  type: 'auth' | 'auth_required' | 'auth_ok' | 'auth_invalid';
  access_token?: string;
};

export type IEventMessage = IMessageBase & {
  type: 'event';
  event: {
    event_type: string;
    data?: any;
  };
};

export type IResultMessage = IMessageBase & {
  type: 'result';
  success: boolean;
  result?: any;
};

export type IServiceMessage = IMessageBase & {
  type: 'call_service';
  domain: string;
  service: string;
  service_data?: { [key: string]: any };
  target?: {
    entity_id: string;
  };
};

export type HomeAssistantMessage =
  | IAuthMessage
  | IEventMessage
  | IResultMessage
  | IServiceMessage
  | ISubscribeMessage;

export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  AUTHENTICATING = 'authenticating',
  CONNECTED = 'connected',
}

export class HomeAssistantWebSocket {
  private webSocketSubject!: WebSocketSubject<HomeAssistantMessage>;

  private homeAssistantResult: ReplaySubject<HomeAssistantMessage> =
    new ReplaySubject(1);

  private subscribedMessages: HomeAssistantMessage[] = [];

  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;

  private connectionStateSubject = new BehaviorSubject<ConnectionState>(
    ConnectionState.DISCONNECTED
  );

  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private readonly initialReconnectDelay = 1000; // 1 second

  constructor(private url: string, private token: string) {
    this.initWebSocket();
  }

  initWebSocket() {
    this.webSocketSubject = webSocket<HomeAssistantMessage>({
      url: this.url,
      closeObserver: {
        next: () => {
          logging.error('Home Assistant Web Socket Closed');
          this.scheduleReconnection();
        },
      },
    });

    this.webSocketSubject.subscribe({
      next: (msg) => {
        this.processMessage(msg);
      },
      error: () => {
        logging.error('HomeAssistantWebSocket ws error');
        this.webSocketSubject.complete();
      },
      complete: () => {
        logging.warn('webSocket completed');
      },
    });
  }

  private scheduleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logging.error(
        `Failed to reconnect after ${this.maxReconnectAttempts} attempts`
      );
      return;
    }

    // Calculate exponential backoff time
    const delay =
      this.initialReconnectDelay * Math.pow(2, this.reconnectAttempts);
    const jitter = Math.random() * 1000; // Add some randomness
    const reconnectDelay = Math.min(delay + jitter, 60000); // Cap at 1 minute

    logging.log(
      `Reconnecting in ${Math.round(reconnectDelay / 1000)}s (attempt ${
        this.reconnectAttempts + 1
      })`
    );

    setTimeout(() => {
      this.reconnectAttempts++;
      this.initWebSocket();
    }, reconnectDelay);
  }

  messages() {
    return this.homeAssistantResult.asObservable();
  }

  next(massageBase: ISubscribeMessage) {
    this.subscribedMessages.push(massageBase);

    if (!this.webSocketSubject) {
      this.initWebSocket();
    } else {
      logging.debug('Adding Messages - WS Open', massageBase);
      this.webSocketSubject.next(massageBase);
    }
  }

  /**
   * Closes the WebSocket connection and cleans up resources
   */
  public disconnect(): void {
    if (this.webSocketSubject) {
      this.webSocketSubject.complete();
    }
    this.subscribedMessages = [];
    this.connectionState = ConnectionState.DISCONNECTED;
    this.connectionStateSubject.next(ConnectionState.DISCONNECTED);
  }

  /**
   * Observable of the current connection state
   */
  public connectionState$() {
    return this.connectionStateSubject.asObservable();
  }

  private processMessage(msg: HomeAssistantMessage): void {
    switch (msg.type) {
      case 'auth_required':
        this.handleAuthRequired();
        break;
      case 'auth_ok':
        this.handleAuthOk();
        break;
      case 'auth_invalid':
        this.handleAuthInvalid(msg as IAuthMessage);
        break;
      case 'result':
        this.handleResult(msg as IResultMessage);
        break;
      case 'event':
        this.handleEvent(msg as IEventMessage);
        break;
      default:
        logging.warn('Unknown message type', msg);
        break;
    }
  }

  private handleAuthRequired(): void {
    logging.debug('Auth required, sending credentials');
    this.webSocketSubject.next({
      type: 'auth',
      access_token: this.token,
    });
  }

  private handleAuthOk(): void {
    logging.info('Authentication successful');
    this.reconnectAttempts = 0; // Reset reconnect counter on successful auth
    this.sendQueuedMessages();
  }

  private handleAuthInvalid(msg: IAuthMessage): void {
    logging.error('Auth Error', msg.access_token);
    logging.info('Token', {
      token: this.token,
      url: this.url,
    });
  }

  private handleResult(msg: IResultMessage): void {
    this.homeAssistantResult.next(msg);
  }

  private handleEvent(msg: IEventMessage): void {
    this.homeAssistantResult.next(msg);
  }

  private sendQueuedMessages(): void {
    this.subscribedMessages.forEach((m) => {
      logging.debug('Adding Messages', m);
      this.webSocketSubject.next(m);
    });
  }
}
