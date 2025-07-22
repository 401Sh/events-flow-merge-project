import { plainToInstance } from 'class-transformer';
import { EventAPISource } from 'src/events/enums/event-source.enum';
import { UserProfileDto } from '../dto/user-profile.dto';
import { UserProfile } from '../interfaces/user-profile.interface';
import { UserLocation } from '../interfaces/user-location.interface';

export function mapLeaderUser(raw: any): UserProfileDto {
  const location = mapLocation(raw.address);

  const leaderObj: UserProfile = {
    id: raw.id,
    firstName: raw.firstName,
    lastName: raw.lastName,
    fatherName: raw.fatherName || null,
    email: raw.email || null,
    gender: raw.gender || null,
    birthday: raw.birthday || null,
    description: raw.info?.description || null,
    phone: raw.phones?.[0]?.phone || null,
    photoUrl: raw.photo?.full || null,

    url: `https://leader-id.ru/users/${raw.id}`,

    address: location,

    source: EventAPISource.LEADER_ID,
  };

  return plainToInstance(UserProfileDto, leaderObj);
}


function mapLocation(addr: any): UserLocation {
  return {
    house: addr?.house || null,
    building: addr?.building || null,
    street: addr?.street || null,
    country: addr?.country || null,
    city: addr?.city || null,
  };
}