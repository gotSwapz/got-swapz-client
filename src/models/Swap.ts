import { Collection } from "./Collection";

export enum SwapState {
  OFFERED,
  REJECTED,
  CANCELLED,
  EXECUTED,
}

export interface Swap {
  id: string;
  creator: string;
  receiver: string;
  collectionId: number;
  swapIdInCollection: number;
  collection: Collection;
  creatorNfts: number[];
  receiverNfts: number[];
  state: number;
  createdAt: string;
  creatorAvatar?: string;
  receiverAvatar?: string;
}
