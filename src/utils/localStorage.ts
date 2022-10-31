import { AvailableNetwork } from "../Config";

const STORAGE_BANNER_DISMISSED = "banner-dismissed";
const STORAGE_HIGHLIGHT_OWNED = "highlight-owned";
const STORAGE_ACTIVE_NETWORK = "active-network";
const STORAGE_JWTS = {
  local: "jwts-local",
  testnet: "jwts-testnet",
  mainnet: "jwts-mainnet",
};

export interface JWT {
  isCurrent: boolean;
  address: string;
  token: string;
}

export const getCurrentJwt = (): JWT | undefined => {
  return getJwts().find((jwt) => jwt.isCurrent);
};

export const addJwt = (newJwt: JWT): void => {
  const jwts = getJwts();
  const index = jwts.findIndex((jwt) => jwt.address === newJwt.address);
  if (index > -1) {
    jwts.splice(index, 1);
  }
  jwts.forEach((jwt) => {
    jwt.isCurrent = false;
  });
  jwts.push(newJwt);
  localStorage.setItem(STORAGE_JWTS[getActiveNetwork()], JSON.stringify(jwts));
};

export const removeJwt = (address: string): void => {
  const jwts = getJwts();
  const index = jwts.findIndex((jwt) => jwt.address === address);
  if (index > -1) {
    jwts.splice(index, 1);
    localStorage.setItem(
      STORAGE_JWTS[getActiveNetwork()],
      JSON.stringify(jwts)
    );
  }
};

export const unselectJwts = (): void => {
  const jwts = getJwts();
  jwts.forEach((jwt) => {
    jwt.isCurrent = false;
  });
  localStorage.setItem(STORAGE_JWTS[getActiveNetwork()], JSON.stringify(jwts));
};

const getJwts = (): JWT[] => {
  const jwtsStr = localStorage.getItem(STORAGE_JWTS[getActiveNetwork()]);
  return jwtsStr ? JSON.parse(jwtsStr) : [];
};

export const getBannerDismissed = (): boolean => {
  return localStorage.getItem(STORAGE_BANNER_DISMISSED) ? true : false;
};

export const setBannerDismissed = (): void => {
  localStorage.setItem(STORAGE_BANNER_DISMISSED, "true");
};

export const getHighlightOwned = (): boolean => {
  return localStorage.getItem(STORAGE_HIGHLIGHT_OWNED) === "true"
    ? true
    : false;
};

export const setHighlightOwned = (value: boolean): void => {
  localStorage.setItem(STORAGE_HIGHLIGHT_OWNED, value.toString());
};

export const getActiveNetwork = (): AvailableNetwork => {
  const value = localStorage.getItem(STORAGE_ACTIVE_NETWORK);
  if (value === "local" || value === "testnet" || value === "mainnet") {
    return value;
  }
  return "mainnet";
};

export const setActiveNetwork = (value: AvailableNetwork): void => {
  localStorage.setItem(STORAGE_ACTIVE_NETWORK, value);
};
