import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'SlugValidator', async: false })
export class SlugValidator implements ValidatorConstraintInterface {
  validate(slug: string, args: ValidationArguments) {
    return !/\s/.test(slug);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Slug should not contain spaces';
  }
}
