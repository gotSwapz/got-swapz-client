import axios from "axios";
import { useContext, useEffect, useState } from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { Link, useParams } from "react-router-dom";
import { Tooltip } from "@material-tailwind/react";
import { apiUrl } from "../Config";
import { SignerContext } from "../context/SignerProvider";
import { Nft } from "../models/Nft";
import { User } from "../models/User";
import { COLLECTION_USER_ROUTE } from "../navigation/Routes";
import { formatPercentage, getIpfsUri } from "../utils/util";
import { MetadataProperty } from "../models/Metadata";
import { MdHelpOutline } from "react-icons/md";

export const ItemPage = (): JSX.Element => {
  const { signerAddress } = useContext(SignerContext);
  const { itemId } = useParams<{ itemId: string }>();
  const [nft, setNft] = useState<Nft>();
  const [copiesOwned, setCopiesOwned] = useState(0);

  useEffect(() => {
    if (!itemId) return;
    getNft();
  }, [itemId]);

  const getNft = (): void => {
    axios
      .get(`${apiUrl()}/nft/${itemId}`)
      .then((response) => {
        const _nft = response.data as Nft;
        setNft(_nft);
        const index = _nft.users.findIndex(
          (owner: User) => owner.address === signerAddress
        );
        setCopiesOwned(index > -1 ? _nft.users[index].UserNft!.copies : 0);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="px-12 py-8">
      {nft && (
        <div className="flex flex-wrap">
          <div className="w-full md:w-1/2 max-h-screen-75 flex justify-center">
            <img
              src={getIpfsUri(nft.imageUri)}
              className="object-contain rounded-xl"
            />
          </div>

          <div className="w-full md:w-1/2 flex flex-col">
            <div className="outline outline-sec-bg rounded-lg shadow-lg px-12 py-8">
              <div className="pb-2">
                <Link to={`/collection/${nft.collectionId}`}>
                  <img
                    src={nft.collection?.logoUrl}
                    className="w-6 h-6 rounded-full overflow-hidden ring-2 ring-gray-100 inline 
                      mr-3 bg-gray-900 object-cover"
                  ></img>
                  <span className="font-bold">{nft.collection?.name}</span>
                </Link>
              </div>
              <div className="pb-2">
                <span className="text-3xl font-bold">{nft.name}</span>
              </div>
              <div className="pb-3">
                <span>{nft.description}</span>
              </div>
              {nft.users?.length > 0 && (
                <div className="pb-3">
                  <span className="block text-sm text-sec-text pb-1">
                    Owners
                  </span>
                  <div className="flex -space-x-3">
                    {nft.users.map((owner: User) => (
                      <Tooltip
                        key={owner.address}
                        content={
                          owner.address == signerAddress ? "You" : owner.address
                        }
                      >
                        <Link
                          className="transition-all ease-in-out hover:-translate-y-1 duration-300"
                          to={COLLECTION_USER_ROUTE.replace(
                            ":collectionId",
                            nft.collectionId.toString()
                          ).replace(":userAddress", owner.address)}
                        >
                          {owner.avatarUrl ? (
                            <img
                              src={owner.avatarUrl}
                              className="w-8 h-8 rounded-full ring-2 ring-white mb-2 
                                bg-gray-900 object-cover"
                            ></img>
                          ) : (
                            <Jazzicon
                              paperStyles={{ border: "solid 2px #fff" }}
                              diameter={35}
                              seed={jsNumberForAddress(owner.address)}
                            />
                          )}
                        </Link>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              )}

              <div className="pb-3">
                <span className="text-sec-text">Chances:</span>
                <span className="px-1">
                  {formatPercentage(
                    (nft.rarity / nft.collection!.raritySum) * 100
                  )}
                  %
                </span>
                <Tooltip content="Chances of getting this item when buying one unit of the collection.">
                  <span className="relative bottom-0.5">
                    <MdHelpOutline className="text-sec-text inline h-5 w-5"></MdHelpOutline>
                  </span>
                </Tooltip>
              </div>

              <div className="pb-3">
                <span className="block text-sec-text">Properties</span>
                <div className="flex flex-wrap">
                  {nft.properties.map(
                    (property: MetadataProperty, index: number) => (
                      <div
                        key={index}
                        className="flex flex-col md:w-1/2 text-center pl-6 py-2 text-sm"
                      >
                        <div
                          key={index}
                          className="flex flex-col h-full rounded-lg bg-sec-bg p-1"
                        >
                          <span className="text-sec-text">{property.key}</span>
                          <span>{property.value.toString()}</span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
