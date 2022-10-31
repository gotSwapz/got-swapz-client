import { Web3Provider } from "@ethersproject/providers";
import Web3Modal from "web3modal";
import { getActiveNetwork, JWT, removeJwt, unselectJwts } from "./localStorage";
import axios from "axios";
import { Signer } from "ethers";
import { apiUrl, networks } from "../Config";
import { addJwt } from "./localStorage";

let wallet: any;

export const logIn = async (
  setProvider: (value: Web3Provider) => void,
  setSigner: (value: Signer | null) => void,
  setSignerAddress: (value: string | null) => void,
  setSignerAvatar: (value: string | null) => void,
  currentJwt?: JWT
): Promise<void> => {
  let web3Modal;

  web3Modal = new Web3Modal({
    cacheProvider: false,
    theme: "dark",
  });

  wallet = await web3Modal.connect();
  const provider = new Web3Provider(wallet);
  setProvider(provider);
  walletSubscriptions(setSigner, setSignerAddress, setSignerAvatar);
  const signer = await getSigner(provider);

  if (currentJwt?.address) {
    if (currentJwt?.address === (await signer.getAddress())) {
      const isValid = await verifyJwt(
        signer,
        setSigner,
        setSignerAddress,
        setSignerAvatar,
        currentJwt
      );
      if (!isValid) auth(signer, setSigner, setSignerAddress, setSignerAvatar);
    } else {
      unselectJwts();
    }
  } else {
    auth(signer, setSigner, setSignerAddress, setSignerAvatar);
  }
};

export const logOut = async (
  setSigner: (value: null) => void,
  setSignerAddress: (value: null) => void,
  setSignerAvatar: (value: null) => void
) => {
  unselectJwts();
  setSigner(null);
  setSignerAddress(null);
  setSignerAvatar(null);
};

const getSigner = async (provider: Web3Provider) => {
  const signer = provider.getSigner();
  const chainId = networks[getActiveNetwork()].chainId;
  if ((await signer.getChainId()) !== chainId) {
    await changeNetwork();
  }
  return signer;
};

const auth = async (
  signer: Signer,
  setSigner: (value: Signer) => void,
  setSignerAddress: (value: string) => void,
  setSignerAvatar: (value: string) => void
) => {
  const address = await signer.getAddress();
  const response = await axios.get(`${apiUrl()}/auth?address=${address}`);
  const signature = await signer.signMessage(`${response.data.message}`);
  verifySignature(
    address,
    signature,
    signer,
    setSigner,
    setSignerAddress,
    setSignerAvatar
  );
};

const verifySignature = async (
  address: string,
  signature: string,
  signer: Signer,
  setSigner: (value: Signer) => void,
  setSignerAddress: (value: string) => void,
  setSignerAvatar: (value: string) => void
) => {
  const response = await axios.post(`${apiUrl()}/auth/verifySignature`, {
    address,
    signature,
  });
  if (response.data.authenticated) {
    setSigner(signer);
    setSignerAddress(address);
    setSignerAvatar(response.data.avatar);
    addJwt({ address, token: response.data.token, isCurrent: true });
  } else {
    throw new Error("Authentication failed");
  }
};

const verifyJwt = async (
  signer: Signer,
  setSigner: (value: Signer) => void,
  setSignerAddress: (value: string) => void,
  setSignerAvatar: (value: string) => void,
  currentJwt: JWT
): Promise<boolean> => {
  const response = await axios.post(`${apiUrl()}/auth/verifyJwt`, {
    token: currentJwt.token,
  });
  if (response.data.authenticated) {
    setSigner(signer);
    setSignerAddress(currentJwt.address);
    setSignerAvatar(response.data.data.avatar);
    return true;
  }
  removeJwt(currentJwt.address);
  return false;
};

const walletSubscriptions = async (
  setSigner: (value: Signer | null) => void,
  setSignerAddress: (value: string | null) => void,
  setSignerAvatar: (value: string | null) => void
) => {
  if (!wallet) return;

  wallet.on("accountsChanged", async (_accounts: string[]) => {
    logOut(setSigner, setSignerAddress, setSignerAvatar);
  });

  wallet.on("chainChanged", async (_chainId: number) => {
    const chainId = networks[getActiveNetwork()].chainId;
    if (_chainId !== chainId) {
      logOut(setSigner, setSignerAddress, setSignerAvatar);
    }
  });

  wallet.on("disconnect", (_error: { code: number; message: string }) => {
    logOut(setSigner, setSignerAddress, setSignerAvatar);
  });
};

const changeNetwork = async () => {
  if (!wallet) return;
  const chainId = networks[getActiveNetwork()].chainId;
  await wallet.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: `0x${chainId.toString(16)}` }],
  });
};
