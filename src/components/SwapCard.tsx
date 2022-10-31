import { Link } from "react-router-dom";
import { Tooltip } from "@material-tailwind/react";
import { SWAP_ROUTE } from "../navigation/Routes";
import { classNames, eip1155Id, getIpfsUri } from "../utils/util";
import { Swap } from "../models/Swap";
import { stateBg, stateText } from "../utils/swapState";

export const SwapCard = ({
  swap,
  nftIdsMapping,
}: {
  swap: Swap;
  nftIdsMapping: { [key: string]: number };
}): JSX.Element => {
  return (
    <div
      className="group my-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3 transition-transform 
      ease-in-out hover:-translate-y-1 duration-300"
    >
      <Link
        className="relative"
        key={swap.id}
        to={SWAP_ROUTE.replace(":swapId", swap.id!.toString())}
      >
        <article className="rounded-lg shadow-lg bg-sec-bg p-4">
          <div>
            <div className="flex mb-2">
              <div
                className={classNames("px-2 rounded-md", stateBg(swap.state))}
              >
                {stateText(swap.state)}
              </div>
            </div>
            <div className="flex mb-1">
              <span className="mr-2 text-sec-text">Collection</span>
              <img
                src={swap.collection.logoUrl}
                className="w-5 h-5 rounded-full ring-2 ring-white inline bg-gray-900 object-cover"
              ></img>
              <span className="ml-2">{swap.collection.name}</span>
            </div>
            <div className="flex">
              <span className="mr-2 text-sec-text">Offered</span>
              <span className="flex -space-x-1">
                {swap.creatorNfts.map((id: number) => (
                  <Tooltip key={id} content={nftIdsMapping[id]}>
                    <img
                      src={getIpfsUri(
                        swap.collection.nftImagesUri.replace(
                          "{id}",
                          eip1155Id(nftIdsMapping[id])
                        )
                      )}
                      className="w-5 h-5 rounded-full ring-2 ring-white mb-2 bg-gray-900 object-cover"
                    ></img>
                  </Tooltip>
                ))}
              </span>
            </div>
            <div className="flex">
              <span className="mr-2 text-sec-text">Requested</span>
              <span className="flex -space-x-1">
                {swap.receiverNfts.map((id: number) => (
                  <Tooltip key={id} content={nftIdsMapping[id]}>
                    <img
                      src={getIpfsUri(
                        swap.collection.nftImagesUri.replace(
                          "{id}",
                          eip1155Id(nftIdsMapping[id])
                        )
                      )}
                      className="w-5 h-5 rounded-full ring-2 ring-white mb-2 bg-gray-900 object-cover"
                    ></img>
                  </Tooltip>
                ))}
              </span>
            </div>
            <div className="flex">
              <span className="text-sec-text mr-2">Creation date</span>
              <span>{new Date(swap.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </article>
      </Link>
    </div>
  );
};
