import { ipfsGatewayUrl } from "../Config";
import { toast } from "react-toastify";

export enum ToastType {
  Success = "success",
  Error = "error",
  Warn = "warn",
  Info = "info",
}

export const launchToast = (
  message: string,
  type: ToastType = ToastType.Success
): void => {
  toast[type](message);
};

export const trim = (value: string, size = 12): string =>
  value.length < size
    ? value
    : `${value.slice(0, size - 5)}...${value.slice(value.length - 5)}`;

export const formatAmount = (
  value: number | undefined,
  decimals = 2
): string => {
  if (value === undefined) return "0";

  return value > 0 && value < 0.01
    ? "<0.01"
    : value.toLocaleString("fullwide", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
};

export const formatPercentage = (value: number): string => {
  if (value === 0) return "0";

  if (value < 0.01) {
    return value < 0.0000000001
      ? "<0.0000000001"
      : value.toFixed(-Math.floor(Math.log(value) / Math.log(10)));
  }

  return value.toLocaleString("fullwide", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const secondsToTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsLeft = Math.floor(seconds % 60);

  const secondsString = secondsLeft > 0 ? `${secondsLeft} sec.` : "";
  if (hours === 0 && minutes === 0) return secondsString;

  const hoursString = hours > 0 ? `${hours} hr. ` : "";
  const minutesString = minutes > 0 ? `${minutes} min.` : "";

  return `${hoursString}${minutesString}`;
};

export const compactNumber = (value: number): string => {
  const formatter = Intl.NumberFormat("en", { notation: "compact" });
  return formatter.format(value);
};

export const timeDiff = (date1: Date, date2: Date): string => {
  const diff = date2.getTime() - date1.getTime();
  const formatter = new Intl.RelativeTimeFormat("en");

  if (Math.abs(diff) < 1000 * 60) {
    return formatter.format(Math.round(-diff / 1000), "seconds");
  }
  if (Math.abs(diff) < 1000 * 60 * 60) {
    return formatter.format(Math.round(-diff / (1000 * 60)), "minutes");
  }
  if (Math.abs(diff) < 1000 * 60 * 60 * 24) {
    return formatter.format(Math.round(-diff / (1000 * 60 * 60)), "hours");
  }
  if (Math.abs(diff) < 1000 * 60 * 60 * 24 * 31) {
    return formatter.format(Math.round(-diff / (1000 * 60 * 60 * 24)), "days");
  }
  if (Math.abs(diff) < 1000 * 60 * 60 * 24 * 365) {
    return formatter.format(
      Math.round(-diff / (1000 * 60 * 60 * 24 * 31)),
      "months"
    );
  }
  return formatter.format(
    Math.round(-diff / (1000 * 60 * 60 * 24 * 365)),
    "years"
  );
};

export const classNames = (...classes: any[]) => {
  return classes.filter(Boolean).join(" ");
};

export const getIpfsUri = (baseUri: string): string => {
  return baseUri.replace("ipfs://", ipfsGatewayUrl);
};

export const eip1155Id = (id: number): string => {
  return id.toString(16).padStart(64, "0");
};
