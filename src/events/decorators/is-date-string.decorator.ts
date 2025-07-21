import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsDateStringFormat(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isDateStringFormat',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;

          // Проверяем формат с помощью regex
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

          // Проверяем, что дата валидна
          const date = new Date(value);
          if (isNaN(date.getTime())) return false;

          // Дополнительно проверить, что date.toISOString().startsWith(value), чтобы исключить, например, "2024-02-31"
          return date.toISOString().startsWith(value);
        },
      },
    });
  };
}
