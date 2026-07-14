import { Injectable, type PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';
import { DomainValidationException } from '../exceptions/app.exception';

/**
 * Validates route `:id` params as MongoDB ObjectIds before they reach services.
 * Returns 422 with a clear message instead of a silent 404 from bad filters.
 */
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!Types.ObjectId.isValid(value)) {
      throw new DomainValidationException(`Invalid resource id: ${value}`);
    }
    return value;
  }
}
