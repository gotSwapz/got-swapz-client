import { Button } from "@material-tailwind/react";
import axios from "axios";
import { Contract } from "ethers";
import { useContext, useEffect, useState } from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Spinner } from "../components/common/Spinner";
import { NftCard } from "../components/NftCard";
import { apiUrl } from "../Config";
import { SignerContext } from "../context/SignerProvider";
import { collectionAbi } from "../contracts/collection";
import { Nft } from "../models/Nft";
import { Swap, SwapState } from "../models/Swap";
import { classNames, launchToast, ToastType, trim } from "../utils/util";
import { COLLECTION_ROUTE, USER_ROUTE } from "../navigation/Routes";
import { stateBg, stateText } from "../utils/swapState";

export const SwapPage = (): JSX.Element => {
  const { signer, signerAddress } = useContext(SignerContext);
  const navigate = useNavigate();
  const { swapId } = useParams<{ swapId: string }>();
  const [swap, setSwap] = useState<Swap>();
  const [accepting, setAccepting] = useState<boolean>(false);
  const [rejecting, setRejecting] = useState<boolean>(false);
  const [cancelling, setCancelling] = useState<boolean>(false);

  useEffect(() => {
    if (!swapId) return;
    getSwap();
  }, [swapId]);

  const getContractWithSigner = (): Contract | null => {
    if (!signer) {
      launchToast("Please login.", ToastType.Error);
      return null;
    }
    return new Contract(swap!.collection.address, collectionAbi, signer);
  };

  const getSwap = (): void => {
    axios
      .get(`${apiUrl()}/swap/${swapId}`)
      .then((response) => {
        const _swap = response.data as Swap;
        setSwap(_swap);
      })
      .catch((err) => {
        console.log(err);
        launchToast(
          "An error occurred fetching the data of the swap.",
          ToastType.Error
        );
      });
  };

  const acceptSwap = async (): Promise<void> => {
    const collection = getContractWithSigner();
    if (!collection) return;
    setAccepting(true);

    try {
      const tx = await collection.acceptSwapOffer(swap!.swapIdInCollection);
      const events = (await tx.wait()).events;
      if (events[0].event !== "SwapOfferUpdated") {
        setAccepting(false);
        launchToast("An error occurred executing the swap.", ToastType.Error);
        return;
      }
      axios
        .put(`${apiUrl()}/swap`, {
          id: swapId,
          state: SwapState.EXECUTED,
        })
        .then((response) => {
          if (response.data.success) {
            setAccepting(false);
            launchToast("Swap processed.");
            navigate(
              COLLECTION_ROUTE.replace(
                ":collectionId",
                swap!.collection.id.toString()
              )
            );
          } else {
            setAccepting(false);
            launchToast(
              "The swap has been executed, but an error occurred registering it in the server.",
              ToastType.Error
            );
          }
        })
        .catch((err) => {
          console.log(err);
          setAccepting(false);
          launchToast(
            "The swap has been executed, but an error occurred registering it in the server.",
            ToastType.Error
          );
        });
    } catch (err) {
      console.log(err);
      setAccepting(false);
      launchToast("An error occurred executing the swap.", ToastType.Error);
    }
  };

  const cancelSwap = async (): Promise<void> => {
    const collection = getContractWithSigner();
    if (!collection) return;

    setCancelling(true);

    try {
      const tx = await collection.cancelSwapOffer(swap!.swapIdInCollection);
      const events = (await tx.wait()).events;
      if (events[0].event !== "SwapOfferUpdated") {
        setCancelling(false);
        launchToast(
          "An error occurred cancelling the swap offer.",
          ToastType.Error
        );
        return;
      }
      axios
        .put(`${apiUrl()}/swap`, {
          id: swapId,
          state: SwapState.CANCELLED,
        })
        .then((response) => {
          if (response.data.success) {
            setCancelling(false);
            launchToast("Swap offer cancelled.");
            navigate(
              COLLECTION_ROUTE.replace(
                ":collectionId",
                swap!.collection.id.toString()
              )
            );
          } else {
            setCancelling(false);
            launchToast(
              "The swap offer has been cancelled, but an error occurred registering it in the server.",
              ToastType.Error
            );
          }
        })
        .catch((err) => {
          console.log(err);
          setCancelling(false);
          launchToast(
            "The swap offer has been cancelled, but an error occurred registering it in the server.",
            ToastType.Error
          );
        });
    } catch (err) {
      console.log(err);
      setCancelling(false);
      launchToast(
        "An error occurred cancelling the swap offer.",
        ToastType.Error
      );
    }
  };

  const rejectSwap = async (): Promise<void> => {
    const collection = getContractWithSigner();
    if (!collection) {
      return;
    }
    setRejecting(true);

    try {
      const tx = await collection.rejectSwapOffer(swap!.swapIdInCollection);
      const events = (await tx.wait()).events;
      if (events[0].event !== "SwapOfferUpdated") {
        setRejecting(false);
        launchToast(
          "An error occurred rejecting the swap offer.",
          ToastType.Error
        );
        return;
      }
      axios
        .put(`${apiUrl()}/swap`, {
          id: swapId,
          state: SwapState.REJECTED,
        })
        .then((response) => {
          if (response.data.success) {
            setRejecting(false);
            launchToast("Swap offer rejected.");
            navigate(
              COLLECTION_ROUTE.replace(
                ":collectionId",
                swap!.collection.id.toString()
              )
            );
          } else {
            setRejecting(false);
            launchToast(
              "The swap offer has been rejected, but an error occurred registering it in the server.",
              ToastType.Error
            );
          }
        })
        .catch((err) => {
          console.log(err);
          setRejecting(false);
          launchToast(
            "The swap offer has been rejected, but an error occurred registering it in the server.",
            ToastType.Error
          );
        });
    } catch (err) {
      console.log(err);
      setRejecting(false);
      launchToast(
        "An error occurred rejecting the swap offer.",
        ToastType.Error
      );
    }
  };

  return (
    <div className="container my-6 mx-auto px-4 md:px-12">
      <h1 className="text-3xl font-bold text-center">Swap offer</h1>
      {swap && (
        <>
          {/* Details */}
          <div className="px-24 py-5">
            <div className="flex pb-3">
              <div
                className={classNames("px-2 rounded-md", stateBg(swap.state))}
              >
                {stateText(swap.state)}
              </div>
            </div>
            <div className="pb-2">
              <span className="text-sec-text">Collection:</span>
              <Link
                to={COLLECTION_ROUTE.replace(
                  ":collectionId",
                  swap.collection.id.toString()
                )}
              >
                <img
                  src={swap.collection.logoUrl}
                  className="w-5 h-5 rounded-full overflow-hidden ring-2 ring-gray-100 inline mx-2
                    bg-gray-900 object-cover"
                ></img>
                <span>{swap.collection.name}</span>
              </Link>
            </div>
            <div className="pb-2">
              <span className="text-sec-text">Offer creator: </span>
              <Link to={USER_ROUTE.replace(":userAddress", swap.creator)}>
                <span>
                  {swap.creatorAvatar ? (
                    <img
                      src={swap.creatorAvatar}
                      className="w-5 h-5 rounded-full overflow-hidden ring-2 ring-gray-100 inline 
                        mx-1 bg-gray-900 object-cover"
                    ></img>
                  ) : (
                    <Jazzicon
                      paperStyles={{
                        border: "solid 2px #fff",
                        position: "relative",
                        top: "4px",
                      }}
                      diameter={23}
                      seed={jsNumberForAddress(swap.creator)}
                    />
                  )}{" "}
                </span>
                {swap.creator === signerAddress ? (
                  <span>You</span>
                ) : (
                  <span>{trim(swap.creator)}</span>
                )}
              </Link>
            </div>
            <div className="pb-2">
              <span className="text-sec-text">Offer receiver: </span>
              <Link to={USER_ROUTE.replace(":userAddress", swap.receiver)}>
                <span>
                  {swap.receiverAvatar ? (
                    <img
                      src={swap.receiverAvatar}
                      className="w-5 h-5 rounded-full overflow-hidden ring-2 ring-gray-100 inline 
                        mx-1 bg-gray-900 object-cover"
                    ></img>
                  ) : (
                    <Jazzicon
                      paperStyles={{
                        border: "solid 2px #fff",
                        position: "relative",
                        top: "4px",
                      }}
                      diameter={23}
                      seed={jsNumberForAddress(swap.receiver)}
                    />
                  )}{" "}
                </span>
                {swap.receiver === signerAddress ? (
                  <span>You</span>
                ) : (
                  <span>{trim(swap.receiver)}</span>
                )}
              </Link>
            </div>
            <div className="pb-3">
              <span className="text-sec-text">Creation date: </span>
              <span>{new Date(swap.createdAt).toLocaleDateString()}</span>
            </div>
            {/* Action buttons */}
            {swap.state === 0 && signerAddress === swap.creator && (
              <Button
                variant="gradient"
                color="pink"
                onClick={cancelSwap}
                disabled={cancelling}
              >
                Cancel offer
                {cancelling && <Spinner inButton={true} />}
              </Button>
            )}
            {swap.state === 0 && signerAddress === swap.receiver && (
              <>
                <Button
                  variant="gradient"
                  color="pink"
                  onClick={rejectSwap}
                  disabled={rejecting}
                >
                  Reject offer
                  {rejecting && <Spinner inButton={true} />}
                </Button>
                <Button
                  variant="gradient"
                  className="ml-2"
                  onClick={acceptSwap}
                  disabled={accepting}
                >
                  Accept offer
                  {accepting && <Spinner inButton={true} />}
                </Button>
              </>
            )}
          </div>

          {/* Offered */}
          <div>
            <div className="border-b border-sec-text">
              <span className="text-xl font-bold">Items offered</span>
            </div>
            <div className="flex flex-wrap -mx-1 lg:-mx-4">
              {swap.collection.nfts
                ?.filter((nft: Nft) => {
                  return swap.creatorNfts.includes(nft.id);
                })
                .map((nft: Nft) => (
                  <NftCard key={nft.id} nft={nft} />
                ))}
            </div>
          </div>

          {/* Requested */}
          <div>
            <div className="border-b border-sec-text mt-8">
              <span className="text-xl font-bold">Items requested</span>
            </div>
            <div className="flex flex-wrap -mx-1 lg:-mx-4">
              {swap.collection.nfts
                ?.filter((nft: Nft) => {
                  return swap.receiverNfts.includes(nft.id);
                })
                .map((nft: Nft) => (
                  <NftCard key={nft.id} nft={nft} />
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
