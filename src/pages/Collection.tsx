import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Contract, ethers } from "ethers";
import { Button, Switch } from "@material-tailwind/react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { SignerContext } from "../context/SignerProvider";
import { collectionAbi } from "../contracts/collection";
import { Collection } from "../models/Collection";
import { apiUrl } from "../Config";
import { NftCard } from "../components/NftCard";
import { Nft } from "../models/Nft";
import { User } from "../models/User";
import { Package } from "../models/Package";
import { launchToast, ToastType, trim } from "../utils/util";
import { Spinner } from "../components/common/Spinner";
import { getHighlightOwned, setHighlightOwned } from "../utils/localStorage";
import { SWAP_ROUTE } from "../navigation/Routes";

export const CollectionPage = (): JSX.Element => {
  const { signer, signerAddress } = useContext(SignerContext);
  const navigate = useNavigate();
  const { collectionId } = useParams<{ collectionId: string }>();
  const { userAddress } = useParams<{ userAddress: string }>();
  const [collection, setCollection] = useState<Collection>();
  const [highlight, setHighlight] = useState(getHighlightOwned());
  const [offeredNftIds, setofferedNftIds] = useState<number[]>([]);
  const [offeredNftIdsInCol, setofferedNftIdsInCol] = useState<number[]>([]);
  const [demandedNftIds, setdemandedNftIds] = useState<number[]>([]);
  const [demandedNftIdsInCol, setdemandedNftIdsInCol] = useState<number[]>([]);
  const [creatingOffer, setCreatingOffer] = useState(false);
  const [contractBalance, setContractBalance] = useState<string>();

  useEffect(() => {
    if (!collectionId) return;
    getCollection();
  }, [collectionId]);

  const getCollection = (): void => {
    axios
      .get(`${apiUrl()}/collection/${collectionId}`)
      .then((response) => {
        const _collection = response.data as Collection;
        setCollection(_collection);
        if (signer && signerAddress === _collection.owner) {
          signer.provider
            ?.getBalance(_collection.address)
            .then((contractBalance) => {
              if (contractBalance.gt(0)) {
                const formattedBalance = Number(
                  ethers.utils.formatEther(contractBalance)
                ).toFixed(2);
                setContractBalance(formattedBalance);
              }
            });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getContractWithSigner = (): Contract | null => {
    if (!signer) {
      launchToast("Please login.", ToastType.Error);
      return null;
    }
    return new Contract(collection!.address, collectionAbi, signer);
  };

  const buyPackage = async (_package: Package): Promise<void> => {
    const collectionContract = getContractWithSigner();
    if (!collectionContract) return;

    try {
      const tx = await collectionContract.buyPackage(_package.units, {
        value: ethers.utils.parseEther(_package.price!.toString()),
      });
      launchToast("Your purchase is being processed.", ToastType.Info);
      const events = (await tx.wait()).events;
      const requestId = events[3].args.requestId;

      const interval = setInterval(() => {
        axios
          .get(`${apiUrl()}/collection/purchase/${requestId}`)
          .then((response) => {
            if (response.data.processed) {
              getCollection();
              clearInterval(interval);
            }
          })
          .catch((err) => {
            console.log(err);
            launchToast(
              "An error occurred registring your purchase in the server.",
              ToastType.Error
            );
          });
      }, 5000);
    } catch (err) {
      console.log(err);
      launchToast(
        "An error occurred registring your purchase in the server.",
        ToastType.Error
      );
    }
  };

  const updateOfferedNftIds = (nft: Nft, selected: boolean): void => {
    if (selected) {
      setofferedNftIds([...offeredNftIds, nft.id]);
      setofferedNftIdsInCol([...offeredNftIdsInCol, nft.idInCollection]);
    } else {
      setofferedNftIds(offeredNftIds.filter((id) => id !== nft.id));
      setofferedNftIdsInCol(
        offeredNftIdsInCol.filter((id) => id !== nft.idInCollection)
      );
    }
  };

  const updateDemandedNftIds = (nft: Nft, selected: boolean): void => {
    if (selected) {
      setdemandedNftIds([...demandedNftIds, nft.id]);
      setdemandedNftIdsInCol([...demandedNftIds, nft.idInCollection]);
    } else {
      setdemandedNftIds(demandedNftIds.filter((id) => id !== nft.id));
      setdemandedNftIdsInCol(
        demandedNftIds.filter((id) => id !== nft.idInCollection)
      );
    }
  };

  const createSwap = async (): Promise<void> => {
    const collectionContract = getContractWithSigner();
    if (!collectionContract) return;
    setCreatingOffer(true);

    try {
      const tx = await collectionContract.createSwapOffer(
        offeredNftIdsInCol,
        demandedNftIdsInCol,
        userAddress
      );
      const events = (await tx.wait()).events;
      if (events[0].event !== "SwapOfferCreated") {
        setCreatingOffer(false);
        launchToast(
          "An error occurred creating the swap offer.",
          ToastType.Error
        );
        return;
      }
      axios
        .post(`${apiUrl()}/swap`, {
          creator: signerAddress,
          receiver: userAddress,
          creatorNfts: offeredNftIds,
          receiverNfts: demandedNftIds,
          collectionId,
          swapIdInCollection: Number(events[0].args.swapId),
        })
        .then((response) => {
          setCreatingOffer(false);
          launchToast("Swap offer created.");
          navigate(SWAP_ROUTE.replace(":swapId", response.data.swapId));
        })
        .catch((err) => {
          setCreatingOffer(false);
          console.log(err);
          launchToast(
            "The swap offer has been created, but an error occurred registering it in the server.",
            ToastType.Error
          );
        });
    } catch (err) {
      console.log(err);
      setCreatingOffer(false);
      launchToast(
        "An error occurred creating the swap offer.",
        ToastType.Error
      );
    }
  };

  const getCopies = (nft: Nft, address: string | null) => {
    if (!address) return 0;
    const index = nft.users.findIndex((user) => user.address === address);
    return index !== -1 ? nft.users[index].UserNft!.copies : 0;
  };

  const withdraw = async (): Promise<void> => {
    const collectionContract = getContractWithSigner();
    if (!collectionContract) return;

    const tx = await collectionContract.withdraw();
    await tx.wait();
    launchToast("Withdrawal successful.");
    setContractBalance(undefined);
  };

  return (
    <div>
      <div
        className="h-64 bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgb(28, 25, 23) 0%, rgba(28, 25, 23, 0.4) 50%, 
            rgb(28, 25, 23) 100%), url(${collection?.bannerUrl})`,
        }}
      >
        <img
          src={collection?.logoUrl}
          className="w-24 h-24 rounded-full ring-4 ring-white flex"
        ></img>
        <h1 className="text-4xl font-bold p-3">{collection?.name}</h1>
      </div>

      {collection && (
        <div className="px-24 pt-5">
          <div className="pb-2">
            <span>{collection.description}</span>
          </div>
          <div className="pb-2">
            <span className="text-sec-text">Creator: </span>
            {collection?.owner !== signerAddress && (
              <span>
                <Jazzicon
                  paperStyles={{ position: "relative", top: "3px" }}
                  diameter={18}
                  seed={jsNumberForAddress(collection.owner)}
                />{" "}
                {collection.owner}
              </span>
            )}
            {collection?.owner === signerAddress && <span>You</span>}
          </div>
          {!!contractBalance && (
            <div className="pb-2">
              <span className="text-sec-text">Contract balance: </span>
              <span>{contractBalance}</span>
              <Button
                variant="gradient"
                size="sm"
                className="rounded-full text-xs ml-2 px-2 py-1"
                onClick={() => withdraw()}
              >
                Withdraw fees
              </Button>
            </div>
          )}
          <div className="pb-2 flex">
            <span className="text-sec-text block">Available packages: </span>
            <div>
              {collection.packages.map((_package: Package, index: number) => (
                <div className="pl-4 mb-1" key={index}>
                  <span>{`${_package.units} units:`}</span>
                  <img
                    src="/images/matic-icon.webp"
                    className="inline px-1 h-4"
                  />
                  <span>{_package.price}</span>
                  <Button
                    variant="gradient"
                    size="sm"
                    className="rounded-full text-xs ml-2 px-2 py-1"
                    onClick={() => buyPackage(_package)}
                  >
                    Buy
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="container my-6 mx-auto px-4 md:px-12">
        {signerAddress && signerAddress !== userAddress && (
          <div className="flex justify-end mb-3">
            <Switch
              color="pink"
              checked={highlight}
              onChange={(e) => {
                setHighlight(e.target.checked);
                setHighlightOwned(e.target.checked);
              }}
            />
            <span className="ml-2 text-sec-text">Highlight my items</span>
          </div>
        )}

        {!userAddress && (
          <div>
            <div className="border-b border-sec-text">
              <span className="text-xl font-bold">
                Items: {collection?.numberOfItems}
              </span>
            </div>
            <div className="flex flex-wrap -mx-1 lg:-mx-4">
              {collection?.nfts?.map((nft: Nft) => (
                <NftCard
                  key={nft.id}
                  nft={nft}
                  highlight={highlight}
                  ownedByCurrent={getCopies(nft, signerAddress)}
                />
              ))}
            </div>
          </div>
        )}

        {userAddress && (
          <div>
            <div className="border-b border-sec-text">
              <span className="text-xl font-bold">
                Owned by{" "}
                <Jazzicon
                  paperStyles={{ position: "relative", top: "3px" }}
                  diameter={20}
                  seed={jsNumberForAddress(userAddress)}
                />{" "}
                <span className="font-normal">{trim(userAddress)}</span>
              </span>
            </div>
            <div className="flex flex-wrap -mx-1 lg:-mx-4">
              {collection?.nfts
                ?.filter(
                  (nft: Nft) =>
                    nft.users.findIndex(
                      (user: User) => user.address === userAddress
                    )! > -1
                )
                .map((nft: Nft) => (
                  <NftCard
                    key={nft.id}
                    nft={nft}
                    highlight={highlight}
                    swap={signerAddress !== userAddress}
                    ownedByCurrent={getCopies(nft, signerAddress)}
                    ownedByOther={getCopies(nft, userAddress)}
                    onSelectionChange={(selected: boolean) => {
                      updateDemandedNftIds(nft, selected);
                    }}
                  />
                ))}
            </div>
            <div className="border-b border-sec-text mt-8">
              <span className="text-xl font-bold">
                Not owned by{" "}
                <Jazzicon
                  paperStyles={{ position: "relative", top: "3px" }}
                  diameter={20}
                  seed={jsNumberForAddress(userAddress)}
                />{" "}
                <span className="font-normal">{trim(userAddress)}</span>
              </span>
            </div>
            <div className="flex flex-wrap -mx-1 lg:-mx-4">
              {collection?.nfts
                ?.filter(
                  (nft: Nft) =>
                    nft.users.findIndex(
                      (user: User) => user.address === userAddress
                    ) === -1
                )
                .map((nft: Nft) => (
                  <NftCard
                    key={nft.id}
                    nft={nft}
                    highlight={highlight}
                    swap={true}
                    ownedByCurrent={getCopies(nft, signerAddress)}
                    onSelectionChange={(selected: boolean) => {
                      updateOfferedNftIds(nft, selected);
                    }}
                  />
                ))}
            </div>
            {offeredNftIds.length > 0 && demandedNftIds.length > 0 && (
              <div className="flex justify-center m-6">
                <Button
                  variant="gradient"
                  onClick={createSwap}
                  disabled={creatingOffer}
                >
                  Create Swap offer
                  {creatingOffer && <Spinner inButton={true} />}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
