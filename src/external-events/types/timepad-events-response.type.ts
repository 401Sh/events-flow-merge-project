export type TimepadLocationType = {
  country?: string;
  city?: string;
  address?: string;
}

export type TimepadEventType = {
  id: number;
  name: string;
  description_html?: string;
  starts_at?: string;
  ends_at?: string;
  url?: string;
  is_sending_free_tickets?: boolean;

  categories?: {
    id: number;
  }[];
  registration_data?: {
    sale_ends_at?: string;
  };
  poster_image?: {
    default_url?: string;
  };
  organization?: {
    name?: string;
  };
  location?: TimepadLocationType;
}

export type TimepadEventsResponseType = {
  values: TimepadEventType[];
  total: number;
};