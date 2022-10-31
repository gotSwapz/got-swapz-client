import { HomePage } from "../pages/Home";
import { CreatePage } from "../pages/Create";
import { CollectionPage } from "../pages/Collection";
import { ItemPage } from "../pages/Item";
import { SwapPage } from "../pages/Swap";
import { UserPage } from "../pages/User";
import { UserEditPage } from "../pages/UserEdit";
import { PrivacyPage } from "../pages/Privacy";
import { TermsPage } from "../pages/Terms";
import {
  COLLECTION_ROUTE,
  COLLECTION_USER_ROUTE,
  CREATE_ROUTE,
  HOME_ROUTE,
  ITEM_ROUTE,
  SWAP_ROUTE,
  USER_ROUTE,
  USER_EDIT_ROUTE,
  PRIVACY_ROUTE,
  TERMS_ROUTE,
} from "./Routes";
export interface Page {
  key: string;
  route: string;
  component: JSX.Element;
  showInMenu: boolean;
  icon?: string;
  label?: string;
}

export const pages: Page[] = [
  {
    key: "home",
    route: HOME_ROUTE,
    component: <HomePage />,
    showInMenu: true,
    icon: "",
    label: "Explore",
  },
  {
    key: "create",
    route: CREATE_ROUTE,
    component: <CreatePage />,
    showInMenu: true,
    icon: "",
    label: "Create",
  },
  {
    key: "collection",
    route: COLLECTION_ROUTE,
    component: <CollectionPage />,
    showInMenu: false,
    icon: "",
    label: "",
  },
  {
    key: "collection-user",
    route: COLLECTION_USER_ROUTE,
    component: <CollectionPage />,
    showInMenu: false,
    icon: "",
    label: "",
  },
  {
    key: "item",
    route: ITEM_ROUTE,
    component: <ItemPage />,
    showInMenu: false,
  },
  {
    key: "swap",
    route: SWAP_ROUTE,
    component: <SwapPage />,
    showInMenu: false,
  },
  {
    key: "user-edit",
    route: USER_EDIT_ROUTE,
    component: <UserEditPage />,
    showInMenu: false,
  },
  {
    key: "user",
    route: USER_ROUTE,
    component: <UserPage />,
    showInMenu: false,
  },
  {
    key: "privacy",
    route: PRIVACY_ROUTE,
    component: <PrivacyPage />,
    showInMenu: false,
  },
  {
    key: "terms",
    route: TERMS_ROUTE,
    component: <TermsPage />,
    showInMenu: false,
  },
];
