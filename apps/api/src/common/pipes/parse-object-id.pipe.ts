import { Injectable, type PipeTransform } from '@nestjs/common';
import { DomainValidationException } from '../exceptions/app.exception';

const OBJECT_ID_HEX = /^[0-9a-fA-F]{24}$/;

/**
 * Validates route `:id` params as MongoDB ObjectIds before they reach services.
 * Returns 422 with a clear message instead of a silent 404 from bad filters.
 */
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!OBJECT_ID_HEX.test(value)) {
      throw new DomainValidationException(`Invalid resource id: ${value}`);
    }
    return value;
  }
}
