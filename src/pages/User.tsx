import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { SignerContext } from "../context/SignerProvider";
import { apiUrl } from "../Config";
import { User } from "../models/User";
import { trim } from "../utils/util";
import { MdEdit } from "react-icons/md";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { USER_EDIT_ROUTE } from "../navigation/Routes";
import { getCurrentJwt } from "../utils/localStorage";
import { CollectionCard } from "../components/CollectionCard";
import { SwapCard } from "../components/SwapCard";

export const UserPage = (): JSX.Element => {
  const { signerAddress } = useContext(SignerContext);
  const navigate = useNavigate();
  const { userAddress } = useParams<{ userAddress: string }>();
  const [user, setUser] = useState<User>();

  useEffect(() => {
    if (!userAddress) return;
    getUser();
  }, [userAddress]);

  const getUser = (): void => {
    let headers = {};
    let endPoint = `${apiUrl()}/user/${userAddress}`;

    const currentJwt = getCurrentJwt();
    if (currentJwt?.address === userAddress) {
      headers = {
        Authorization: `Bearer ${currentJwt!.token}`,
      };
      endPoint = `${apiUrl()}/user/full/${userAddress}`;
    }

    axios
      .get(endPoint, { headers })
      .then((response) => {
        setUser(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div>
      <div
        className="h-48 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${
            !user || user.bannerUrl
              ? user?.bannerUrl
              : "/images/default-banner.png"
          })`,
        }}
      ></div>
      <div className="flex">
        <div className="w-36">
          <div className="relative left-8 bottom-8">
            {!user || user.avatarUrl ? (
              <img
                src={user?.avatarUrl}
                className="w-24 h-24 rounded-full ring-4 ring-white mb-2 bg-gray-900"
              ></img>
            ) : (
              <Jazzicon
                paperStyles={{ border: "solid 4px #fff" }}
                diameter={100}
                seed={jsNumberForAddress(user?.address || "")}
              />
            )}
          </div>
          {user?.address === signerAddress && (
            <MdEdit
              className="h-12 w-12 p-2 ml-14 text-primary cursor-pointer border-2 rounded-xl  border-primary"
              onClick={() => {
                navigate(
                  USER_EDIT_ROUTE.replace(":userAddress", signerAddress)
                );
              }}
            />
          )}
        </div>
        <div className="pr-36">
          <h1 className="text-4xl font-bold py-4">{user?.name}</h1>
          <div className="pb-2">
            <span>{user?.bio}</span>
          </div>
          <div className="pb-2">
            <span className="text-sec-text">Account</span>
            {user && <span className="pl-2">{trim(user.address)}</span>}
          </div>
        </div>
      </div>
      {!!user?.collections?.length && (
        <div className="container my-12 mx-auto px-4 md:px-12">
          <h2 className="text-xl font-bold mb-2 border-b-primary border-b-2">
            Collections created
          </h2>
          <div className="flex flex-wrap -mx-1 lg:-mx-4">
            {user.collections &&
              user.collections.map((collection) => (
                <CollectionCard key={collection.id} {...collection} />
              ))}
          </div>
        </div>
      )}
      {!!user?.swapsAsCreator?.length && (
        <div className="container my-12 mx-auto px-4 md:px-12">
          <h2 className="text-xl font-bold mb-2 border-b-primary border-b-2">
            Swap offers created
          </h2>
          <div className="flex flex-wrap -mx-1 lg:-mx-4">
            {user.swapsAsCreator &&
              user.swapsAsCreator.map((swap) => (
                <SwapCard
                  swap={swap}
                  nftIdsMapping={user.nftIdsMapping!}
                ></SwapCard>
              ))}
          </div>
        </div>
      )}
      {!!user?.swapsAsReceiver?.length && (
        <div className="container my-12 mx-auto px-4 md:px-12">
          <h2 className="text-xl font-bold mb-2 border-b-primary border-b-2">
            Swap offers received
          </h2>
          <div className="flex flex-wrap -mx-1 lg:-mx-4">
            {user.swapsAsReceiver &&
              user.swapsAsReceiver.map((swap) => (
                <SwapCard
                  swap={swap}
                  nftIdsMapping={user.nftIdsMapping!}
                ></SwapCard>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
