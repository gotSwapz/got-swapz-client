import { useState, useEffect } from "react";
import { getActiveNetwork, setActiveNetwork } from "../utils/localStorage";
import { Switch } from "@material-tailwind/react";

export const ToggleNetwork = (): JSX.Element => {
  const [isTestnet, setIsTestnet] = useState<boolean>(false);

  useEffect(() => {
    setIsTestnet(getActiveNetwork() === "testnet");
  }, []);

  const toggleChange = (checked: boolean) => {
    setActiveNetwork(checked ? "testnet" : "mainnet");
    window.location.reload();
  };

  return (
    <div className="flex">
      <Switch
        id="network"
        ripple={true}
        checked={isTestnet}
        onChange={(event) => toggleChange(event.target.checked)}
      />
      <label htmlFor="network" className="ml-2">
        Use testnet
      </label>
    </div>
  );
};
