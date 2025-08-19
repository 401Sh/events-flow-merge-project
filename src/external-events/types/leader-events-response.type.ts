type LeaderStatType = {
  participants?: {
    count?: number;
    list?: [];
  };
}

export type LeaderAddressType = {
  titles?: {
    country?: string;
  };
  city?: string;
  street?: string;
  house?: string;
}

export type LeaderEventType = {
  id: number;
  full_name: string;
  full_info: string;
  date_start?: string;
  date_end?: string;
  registrationDateStart?: string;
  registrationDateEnd?: string;
  photo?: string;

  timezone?: {
    value?: string;
  };
  themes?: {
    id: number;
  }[];
  organizers?: {
    name?: string;
  }[];
  space?: {
    address?: LeaderAddressType;
  };
  stat?: LeaderStatType;
}

export type LeaderEventsResponseType = {
  items: LeaderEventType[];
  meta: {
    totalCount: number;
    paginationPageCount: number;
    paginationPage: number;
    paginationSize: number;
  };
};