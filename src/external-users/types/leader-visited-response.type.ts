type LeaderVisitedEventType = {
  id: number;
  name: string;
  info?: string;
  dateStart?: string;
  dateEnd?: string;
  registrationDateStart?: string;
  registrationDateEnd?: string;

  photo?: {
    full?: string;
  };
  timezone?: {
    value?: string;
  };
}

export type LeaderVisitedType = {
  id: string;
  eventId: number;
  createdAt: string;
  completed: boolean;
  completedAt?: string;

  event?: LeaderVisitedEventType;
}

export type LeaderVisitedResponseType = {
  items: LeaderVisitedType[];
  meta: {
    totalCount: number;
    paginationPageCount: number;
    paginationPage: number;
    paginationSize: number;
  };
}