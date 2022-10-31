import { Signer } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { createContext, Dispatch, useEffect, useState } from "react";
import { getCurrentJwt } from "../utils/localStorage";
import { logIn } from "../utils/userSession";

interface SignerContextProps {
  provider: Web3Provider | null;
  setProvider: Dispatch<React.SetStateAction<Web3Provider | null>>;
  signer: Signer | null;
  setSigner: Dispatch<React.SetStateAction<Signer | null>>;
  signerAddress: string | null;
  setSignerAddress: Dispatch<React.SetStateAction<string | null>>;
  signerAvatar: string | null;
  setSignerAvatar: Dispatch<React.SetStateAction<string | null>>;
}

const signerContextPropsDefaults: SignerContextProps = {
  provider: null,
  setProvider: () => {},
  signer: null,
  setSigner: () => {},
  signerAddress: null,
  setSignerAddress: () => {},
  signerAvatar: null,
  setSignerAvatar: () => {},
};

export const SignerContext = createContext<SignerContextProps>(
  signerContextPropsDefaults
);

export const SignerProvider = (props: any) => {
  const [provider, setProvider] = useState<Web3Provider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [signerAddress, setSignerAddress] = useState<string | null>(null);
  const [signerAvatar, setSignerAvatar] = useState<string | null>(null);

  useEffect(() => {
    const currentJwt = getCurrentJwt();
    if (currentJwt) {
      logIn(
        setProvider,
        setSigner,
        setSignerAddress,
        setSignerAvatar,
        currentJwt
      );
    }
  }, []);

  return (
    <SignerContext.Provider
      value={{
        provider,
        setProvider,
        signer,
        setSigner,
        signerAddress,
        setSignerAddress,
        signerAvatar,
        setSignerAvatar,
      }}
    >
      {props.children}
    </SignerContext.Provider>
  );
};
