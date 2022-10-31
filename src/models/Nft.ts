import { Collection } from "./Collection";
import { MetadataProperty } from "./Metadata";
import { User } from "./User";

export interface Nft {
  id: number;
  collectionId: number;
  name: string;
  description: string;
  imageUri: string;
  idInCollection: number;
  rarity: number;
  properties: MetadataProperty[];
  users: User[];
  collection?: Collection;
}
