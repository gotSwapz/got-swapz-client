import { Nft } from "./Nft";
import { Package } from "./Package";

export interface Collection {
  id: number;
  address: string;
  name: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  owner: string;
  numberOfItems: number;
  metadataUri: string;
  nftImagesUri: string;
  raritySum: number;
  packages: Package[];
  nfts: Nft[];
}
