import { Link } from "react-router-dom";
import { TERMS_ROUTE, PRIVACY_ROUTE } from "../navigation/Routes";
import { setActiveNetwork } from "../utils/localStorage";
import { ToggleNetwork } from "./ToggleNetwork";

export const Footer = (): JSX.Element => {
  return (
    <div className="flex flex-row justify-around items-center p-6 font-light">
      <div>
        <div>
          <Link to={TERMS_ROUTE}>Terms</Link>
        </div>
        <div className="pt-1">
          <Link to={PRIVACY_ROUTE}>Privacy</Link>
        </div>
      </div>
      <div>
        <img
          src="/images/logo_192_white.png"
          className="h-10 inline pr-3"
        ></img>
        <span className="text-xl relative top-1">© </span>
        <span>gotSwapz 2022</span>
      </div>
      <div>
        <div className="flex">
          <ToggleNetwork />
          {process.env.NODE_ENV === "development" && (
            <button
              onClick={() => {
                setActiveNetwork("local");
                window.location.reload();
              }}
              type="button"
              className="bg-green-400 px-2 ml-6 font-semibold"
            >
              Swith to Local
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
