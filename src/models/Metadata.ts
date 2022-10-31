export type MetadataPropertyValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[];

export interface MetadataProperty {
  key: string;
  value: MetadataPropertyValue;
}
