import { Link } from "react-router-dom";
import { Collection } from "../models/Collection";
import { COLLECTION_ROUTE } from "../navigation/Routes";

export const CollectionCard = (collection: Collection): JSX.Element => {
  return (
    <div
      className="group my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3 transition-transform 
      ease-in-out hover:-translate-y-1 duration-300"
    >
      <Link
        key={collection.id}
        to={COLLECTION_ROUTE.replace(
          ":collectionId",
          collection.id!.toString()
        )}
      >
        <article className="overflow-hidden rounded-lg shadow-lg bg-sec-bg">
          <div className="overflow-hidden">
            <img
              className="block object-cover h-40 w-full transition-transform ease-in-out group-hover:scale-105 
                duration-300"
              src={collection.bannerUrl}
            />
          </div>
          <header className="flex items-center leading-tight px-2 md:px-4">
            <img
              className="w-16 h-16 rounded-full ring-2 ring-gray-100 relative bottom-4
              transition-transform ease-in-out group-hover:scale-105 duration-300 mr-3 object-cover"
              src={collection.logoUrl}
            />
            <h1 className="text-md">{collection.name}</h1>
          </header>
        </article>
      </Link>
    </div>
  );
};
