import { getActiveNetwork } from "./utils/localStorage";

export interface Network {
  name: string;
  chainId: number;
  factoryAddress: string;
  apiUrl: string;
}

export type AvailableNetwork = "local" | "testnet" | "mainnet";

export const networks: { [key: string]: Network } = {
  local: {
    name: "Local network",
    chainId: 31337,
    factoryAddress: "0x394b14ebe3140a5a082f1ef200d055d71a136e0c",
    apiUrl: "http://localhost:8080",
  },
  testnet: {
    name: "Mumbai",
    chainId: 80001,
    factoryAddress: "0x4cd94a3f94b3cb6c623dff21437b1b5755c6df66",
    apiUrl: "aHR0cHM6Ly93d3cud2hhdHN3YXB6LmNvbQ==",
  },
  mainnet: {
    name: "Polygon mainnet",
    chainId: 137,
    factoryAddress: "0x5d7addd96b0ca979b86e5eeb34b45b21cd671027",
    apiUrl: "aHR0cHM6Ly93d3cuY29yYWxtYXJrZXRwbGFjZXN5c3RlbXMueHl6",
  },
};

export const ipfsGatewayUrl = "https://nftstorage.link/ipfs/";

export const apiUrl = (): string => {
  const encodedUrl = networks[getActiveNetwork()].apiUrl;
  return atob(encodedUrl);
};
