import { ReplaySubject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { logging } from './utils/logging';

export interface IMassageBase {
  type: string;
  id?: number;
  access_token?: string;
  success?: boolean;
  event?: {
    event_type?: string;
  };
  event_type?: string;

  domain?: string;
  service?: string;
  service_data?: { [key: string]: any };
  target?: {
    entity_id: string;
  };
}

export class HomeAssistantWebSocket {
  private webSocketSubject!: WebSocketSubject<IMassageBase>;

  private homeAssistantResult: ReplaySubject<IMassageBase> = new ReplaySubject(
    1
  );

  private subscribedMessages: IMassageBase[] = [];

  constructor(private url: string, private token: string) {
    this.initWebSocket();
  }

  initWebSocket() {
    this.webSocketSubject = webSocket<IMassageBase>({
      url: this.url,
      closeObserver: {
        next: () => {
          logging.error('Home Assistant Web Socket Closed');
          setTimeout(() => {
            logging.log('Re connecting');
            this.initWebSocket();
          }, 5000);
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

  messages() {
    return this.homeAssistantResult.asObservable();
  }

  next(massageBase: IMassageBase) {
    this.subscribedMessages.push(massageBase);

    if (!this.webSocketSubject) {
      this.initWebSocket();
    } else {
      logging.debug('Adding Messages - WS Open', massageBase);
      this.webSocketSubject.next(massageBase);
    }
  }

  private processMessage(msg: IMassageBase) {
    if (msg.type === 'auth_required') {
      this.webSocketSubject.next({
        type: 'auth',
        access_token: this.token,
      });
    } else if (msg.type === 'auth_ok') {
      this.subscribedMessages.forEach((m) => {
        logging.debug('Adding Messages', m);
        this.webSocketSubject.next(m);
      });
    } else if (msg.type === 'result') {
      this.homeAssistantResult.next(msg);
    } else if (msg.type === 'event') {
      this.homeAssistantResult.next(msg);
    } else if (msg.type === 'auth_invalid') {
      logging.error('Auth Error', (msg as any).message);
      logging.info('Token', {
        token: this.token,
        url: this.url,
      });
    } else {
      logging.warn('processMessage unknown', msg);
    }
  }
}

