import { Collection } from "./Collection";
import { Swap } from "./Swap";
import { UserNft } from "./UserNft";

export interface User {
  address: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  email?: string;
  receiveNotifications?: boolean;
  UserNft?: UserNft;
  collections?: Collection[];
  swapsAsCreator?: Swap[];
  swapsAsReceiver?: Swap[];
  nftIdsMapping?: { [key: string]: number };
}
