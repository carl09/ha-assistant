export interface IHomeAssistantEntityAttributes {
  friendly_name: string;
  hidden: boolean;
  icon: string;
  [key: string]: any;

  temperature?: number;
  current_temperature?: number;
  min_temp?: number;
  humidity?: number;

  fan_mode?: any;
  fan_modes?: string[];

  hvac_modes?: any[];
}

export interface IHomeAssistantEntityStatus {
  state: string;
  entity_id: string;
  last_changed: Date;
  last_updated: Date;
  attributes: IHomeAssistantEntityAttributes;
}

/**
 *  type: "config/area_registry/list"
 */
export interface IHomeAssistantArea {
  area_id: string;
  name: string;
}

/**
 * type: "config/entity_registry/list"
 */
export interface IHomeAssistantEntity {
  config_entry_id: string;
  device_id: string;
  disabled_by: string;
  entity_id: string;
  name: string;
  icon: string;
  platform: string;
  original_name: string;
  original_icon: string;
}

/**
 * type: "config/device_registry/list"
 */
export interface IHomeAssistantDevice {
  config_entries: string[];
  connections: string[];
  manufacturer: string;
  model: string;
  name: string;
  sw_version: string;
  id: string;
  via_device_id: string;
  area_id: string;
  name_by_user: string;
}

export interface IHomeAssistantDeviceSummary {
  entity_id: string;
  area: string;
  manufacturer: string;
  model: string;
  name: string;
  sw_version: string;
}

/**
 * type: "get_services"
 */
export interface IHomeAssistantService {
  [domain: string]: {
    [service: string]: {
      name: string;
      description: string;
      fields: any;
      target: any;
    };
  };
}

