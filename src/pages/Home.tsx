import { useEffect, useState } from "react";
import { apiUrl } from "../Config";
import axios from "axios";
import { CollectionCard } from "../components/CollectionCard";
import { Collection } from "../models/Collection";
import { CollectionCardPlaceholder } from "../components/CollectionCardPlaceholder";

export const HomePage = (): JSX.Element => {
  const [collections, setCollections] = useState<Collection[]>();

  useEffect(() => {
    getCollections();
  }, []);

  const getCollections = (): void => {
    axios
      .get(`${apiUrl()}/collection`)
      .then((response) => {
        setCollections((response.data as Collection[]).reverse());
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div>
      <div
        className="h-96 bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgb(28, 25, 23) 0%, rgba(28, 25, 23, 0.5) 50%, 
            rgb(28, 25, 23) 100%), url("images/home.png")`,
        }}
      >
        <img className="max-h-24 pr-5" src="/images/logo_512_white.png"></img>
        <img className="max-h-24" src="/images/gs_title.png"></img>
      </div>
      <div className="container my-12 mx-auto px-4 md:px-12">
        <div className="flex flex-wrap -mx-1 lg:-mx-4">
          {collections &&
            collections.map((collection) => (
              <CollectionCard key={collection.id} {...collection} />
            ))}
          {!collections &&
            Array.from(Array(12)).map((x, i) => (
              <CollectionCardPlaceholder key={i} />
            ))}
        </div>
      </div>
    </div>
  );
};
