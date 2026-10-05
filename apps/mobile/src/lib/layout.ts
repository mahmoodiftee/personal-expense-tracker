/** Shared metrics so page content and the floating tab bar stay aligned. */
export const TAB_BAR_HEIGHT = 64;
export const TAB_BAR_HORIZONTAL_INSET = 20;
export const TAB_BAR_BOTTOM_GAP = 10;

export function tabBarClearance(insetBottom: number): number {
  return TAB_BAR_HEIGHT + TAB_BAR_BOTTOM_GAP + insetBottom + 20;
}
