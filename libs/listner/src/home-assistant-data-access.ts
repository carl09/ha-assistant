import {
  IHomeAssistantArea,
  IHomeAssistantDevice,
  IHomeAssistantEntity,
  IHomeAssistantEntityStatus,
  IHomeAssistantService,
} from './home-assistant-entities';
import { Observable, filter, map, shareReplay, take } from 'rxjs';
import {
  HomeAssistantWebSocket,
  IMassageBase,
} from './home-assistant-web-socket';

export class HomeAssistantDataAccess {
  private homeAssistantWebSocket: HomeAssistantWebSocket;

  private entityStatus?: Observable<IHomeAssistantEntityStatus[]>;
  private entityStatusUpdated?: Observable<IHomeAssistantEntityStatus>;

  private areas?: Observable<IHomeAssistantArea[]>;
  private entities?: Observable<IHomeAssistantEntity[]>;
  private devices?: Observable<IHomeAssistantDevice[]>;
  private services?: Observable<IHomeAssistantService>;

  private counter = 1;

  constructor(private url: string, private token: string) {
    this.homeAssistantWebSocket = new HomeAssistantWebSocket(url, token);
  }

  getEntityStatus(): Observable<IHomeAssistantEntityStatus[]> {
    if (!this.entityStatus) {
      this.entityStatus = this.createSubScription(
        {
          id: this.counter,
          type: 'get_states',
        },
        this.counter++
      ).pipe(
        map((msg) => {
          return (msg as any).result as IHomeAssistantEntityStatus[];
        }),
        shareReplay(1)
      );
    }
    return this.entityStatus;
  }

  getEntityStatusUpdated(): Observable<IHomeAssistantEntityStatus> {
    if (!this.entityStatusUpdated) {
      this.entityStatusUpdated = this.createSubScription(
        {
          id: this.counter,
          type: 'subscribe_events',
          event_type: 'state_changed',
        },
        this.counter++
      ).pipe(
        filter((x) => x.event?.event_type === 'state_changed'),
        map((msg) => {
          return (msg as any).event.data
            .new_state as IHomeAssistantEntityStatus;
        }),
        shareReplay(1)
      );
    }
    return this.entityStatusUpdated;
  }

  getAreas() {
    if (!this.areas) {
      this.areas = this.createSubScription(
        {
          id: this.counter,
          type: 'config/area_registry/list',
        },
        this.counter++
      ).pipe(
        map((msg) => {
          return (msg as any).result as IHomeAssistantArea[];
        }),
        shareReplay(1)
      );
    }

    return this.areas;
  }

  getEntities() {
    if (!this.entities) {
      this.entities = this.createSubScription(
        {
          id: this.counter,
          type: 'config/entity_registry/list',
        },
        this.counter++
      ).pipe(
        map((msg) => {
          return (msg as any).result as IHomeAssistantEntity[];
        }),
        shareReplay(1)
      );
    }

    return this.entities;
  }

  getServices(): Observable<IHomeAssistantService> {
    if (!this.services) {
      this.services = this.createSubScription(
        {
          id: this.counter,
          type: 'get_services',
        },
        this.counter++
      ).pipe(
        map((msg) => {
          return (msg as any).result; // as IHomeAssistantEntity[];
        }),
        shareReplay(1)
      );
    }

    return this.services;
  }

  getDevices() {
    if (!this.devices) {
      this.devices = this.createSubScription(
        {
          id: this.counter,
          type: 'config/device_registry/list',
        },
        this.counter++
      ).pipe(
        map((msg) => {
          return (msg as any).result as IHomeAssistantDevice[];
        }),
        shareReplay(1)
      );
    }

    return this.devices;
  }

  callService(
    domain: string,
    service: string,
    serviceData: { [key: string]: any } | undefined,
    entityId: string
  ) {
    const serviceCall = this.createSubScription(
      {
        id: this.counter,
        type: 'call_service',
        domain,
        service,
        service_data: serviceData,
        target: {
          entity_id: entityId,
        },
      },
      this.counter++
    ).pipe(
      map((msg) => {
        return msg as unknown as { success: boolean; result: any };
      }),
      take(1)
    );

    return serviceCall;
  }

  private createSubScription(iniMessage: IMassageBase, resultId: number) {
    this.homeAssistantWebSocket.next(iniMessage);

    return this.homeAssistantWebSocket
      .messages()
      .pipe(filter((x) => x.id === resultId));
  }
}

let instance: HomeAssistantDataAccess;

export const getHomeAssistantDataAccess = (url: string, token: string) => {
  if (!instance) {
    instance = new HomeAssistantDataAccess(url, token);
  }
  return instance;
};
