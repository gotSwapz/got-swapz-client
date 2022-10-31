import { Link } from "react-router-dom";
import { Checkbox } from "@material-tailwind/react";
import { Nft } from "../models/Nft";
import { ITEM_ROUTE } from "../navigation/Routes";
import { classNames, getIpfsUri } from "../utils/util";

interface Props {
  nft: Nft;
  highlight?: boolean;
  swap?: boolean;
  ownedByCurrent?: number;
  ownedByOther?: number;
  onSelectionChange?: (selected: boolean) => void;
}

export const NftCard = ({
  nft,
  highlight,
  swap,
  ownedByCurrent,
  ownedByOther,
  onSelectionChange,
}: Props): JSX.Element => {
  return (
    <div
      className="group my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3 xl:w-1/5 
        transition-transform ease-in-out hover:-translate-y-1 duration-300"
    >
      <Link
        className="relative"
        key={nft.id}
        to={ITEM_ROUTE.replace(":itemId", nft.id!.toString())}
      >
        {highlight && !!ownedByCurrent && (
          <>
            <article className="absolute inset-0 rounded-lg bg-secondary blur"></article>
            <div className="absolute -inset-2 rounded-full bg-secondary h-6 w-6 z-10 flex justify-center items-center">
              <div className="flex content-end text-sm">{ownedByCurrent}</div>
            </div>
          </>
        )}
        {!!ownedByOther && (
          <div className="absolute -top-2 -right-2 rounded-full bg-primary h-6 w-6 z-10 flex justify-center items-center">
            <div className="flex content-end text-sm">{ownedByOther}</div>
          </div>
        )}
        <article
          className={classNames(
            highlight && !ownedByCurrent && "opacity-50",
            highlight && !!ownedByCurrent && "shadow-secondary/50",
            "relative overflow-hidden rounded-lg shadow-lg bg-sec-bg"
          )}
        >
          <div className="overflow-hidden">
            <img
              className="block h-auto w-full transition-transform ease-in-out group-hover:scale-105 
                duration-300"
              src={getIpfsUri(nft.imageUri)}
            />
          </div>
          <header className="flex items-center leading-tight p-2 md:p-4">
            <h1 className="text-md">{nft.name}</h1>
          </header>
        </article>
      </Link>
      {swap && (
        <div className="-ml-2">
          {highlight && !!ownedByCurrent && !ownedByOther && (
            <Checkbox
              color="pink"
              onChange={(e) =>
                onSelectionChange && onSelectionChange(e.target.checked)
              }
            />
          )}
          {highlight && !ownedByCurrent && !!ownedByOther && (
            <Checkbox
              onChange={(e) =>
                onSelectionChange && onSelectionChange(e.target.checked)
              }
            />
          )}
        </div>
      )}
    </div>
  );
};
