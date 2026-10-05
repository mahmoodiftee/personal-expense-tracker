export type ChartSlice = {
  name: string;
  color: string;
  total: string;
  sharePct: number;
  /** Icon registry key from the category, when the API sent one. */
  icon?: string;
};
