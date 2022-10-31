export const stateText = (state: number): string => {
  switch (state) {
    case 0:
      return "Open";
    case 1:
      return "Rejected";
    case 2:
      return "Cancelled";
    default:
      return "Executed";
  }
};

export const stateBg = (state: number): string => {
  switch (state) {
    case 0:
      return "bg-green-400";
    case 1:
    case 2:
      return "bg-red-400 ";
    default:
      return "bg-blue-400";
  }
};
