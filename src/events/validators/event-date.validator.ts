import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsDatesConsistent', async: false })
export class IsDatesConsistent implements ValidatorConstraintInterface {
  validate(obj: any, _args: ValidationArguments) {
    if (!obj) return true;

    if (obj.endsAt && obj.startsAt && obj.startsAt > obj.endsAt) {
      return false;
    }

    if (
      obj.registrationStart &&
      obj.registrationEnd &&
      obj.registrationStart > obj.registrationEnd
    ) {
      return false;
    }

    return true;
  }

  defaultMessage(_args: ValidationArguments) {
    return 'The start date cannot be later than the end date.';
  }
}