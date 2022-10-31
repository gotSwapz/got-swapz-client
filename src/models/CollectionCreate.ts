import { Package } from "./Package";

export interface CollectionCreate {
  id?: number;
  address: string;
  name: string;
  description: string;
  owner: string;
  packages: Package[];
}
