/**
 * Income calculations. Re-exported from the shared recurring calculations so
 * all recurring-plan features compute effective amounts identically (DRY).
 */
export {
  effectiveAmountForMonth,
  isActiveInMonth,
} from '../../../common/domain/recurring.calculations';
