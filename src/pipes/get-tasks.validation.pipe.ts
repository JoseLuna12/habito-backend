import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class GetTaskValidation implements PipeTransform {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: string, _metadata: ArgumentMetadata) {
    const valueRegex = new RegExp(/^(\d{2}):(\d{2}):(\d{4})$/);
    if (valueRegex.test(value)) {
      return value;
    }

    throw new BadRequestException(
      'Task param does not match the pattern (DD:MM:YYYY)',
    );
  }
}
