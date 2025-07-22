import { EventAPISource } from "src/events/enums/event-source.enum";
import { UserLocation } from "./user-location.interface";

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  fatherName: string | null;
  email: string | null;
  gender: string | null;
  birthday: string | null;
  description: string | null;
  phone: string | null;
  address: UserLocation;
  url: string | null;
  photoUrl: string | null;
  source: EventAPISource
}