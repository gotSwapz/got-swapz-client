import { MdErrorOutline } from "react-icons/md";
import { getActiveNetwork } from "../utils/localStorage";

export const NetworkBanner = (): JSX.Element => {
  switch (getActiveNetwork()) {
    case "local":
      return (
        <div className={"flex justify-center items-center bg-green-400 p-2"}>
          <MdErrorOutline className="h-5 w-5 mr-1" />
          <span>You are using gotSwapz in local network.</span>
        </div>
      );
    case "testnet":
      return (
        <div className={"flex justify-center items-center bg-primary p-2"}>
          <MdErrorOutline className="h-5 w-5 mr-1" />
          <span>You are using gotSwapz in Mumbai test network.</span>
        </div>
      );
    default:
      return <></>;
  }
};
