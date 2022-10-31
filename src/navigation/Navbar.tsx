import { Disclosure } from "@headlessui/react";
import {
  MdMenu,
  MdClose,
  MdOutlineAccountBalanceWallet,
  MdAccountCircle,
  MdOutlineLogout,
} from "react-icons/md";
import {
  Button,
  Popover,
  PopoverHandler,
  PopoverContent,
} from "@material-tailwind/react";
import { pages } from "./Pages";
import { NavLink, useNavigate } from "react-router-dom";
import { classNames, trim } from "../utils/util";
import { logIn, logOut } from "../utils/userSession";
import { SignerContext } from "../context/SignerProvider";
import { useContext } from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { USER_ROUTE } from "./Routes";

export const Navbar = (): JSX.Element => {
  const navigate = useNavigate();
  const {
    setProvider,
    setSigner,
    setSignerAddress,
    signerAddress,
    setSignerAvatar,
    signerAvatar,
  } = useContext(SignerContext);

  return (
    <>
      <Disclosure as="nav" className="bg-prim-bg">
        {({ open }) => (
          <>
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
              <div className="relative flex items-center justify-between h-16">
                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                  {/* Mobile menu button*/}
                  <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <MdClose className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <MdMenu className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
                <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                  <div className="flex-shrink-0 flex items-center">
                    <img
                      className="block lg:hidden h-8 w-auto"
                      src="/images/logo_192.png"
                      alt="gotSwapz"
                    />
                    <img
                      className="hidden lg:block h-8 w-auto"
                      src="/images/logo_192.png"
                    />
                    <img
                      className="hidden lg:block h-8 w-auto pl-2"
                      src="/images/gs_title.png"
                      alt="gotSwapz"
                    />
                  </div>
                  <div className="hidden sm:block sm:ml-6">
                    <div className="flex space-x-4">
                      {pages.map(
                        (page) =>
                          page.showInMenu && (
                            <NavLink
                              key={page.key}
                              to={page.route}
                              className={({ isActive }) =>
                                classNames(
                                  isActive
                                    ? "border-b-4 border-solid border-primary text-white"
                                    : "text-gray-300 hover:text-white",
                                  "block px-3 py-2 font-medium text-lg"
                                )
                              }
                            >
                              {page.label}
                            </NavLink>
                          )
                      )}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                  {signerAddress ? (
                    <Popover placement="bottom">
                      <PopoverHandler>
                        <button id="toggle-btn">
                          {signerAvatar ? (
                            <img
                              src={signerAvatar}
                              className="w-9 h-9 rounded-full ring-2 ring-white mb-2 bg-gray-900 object-cover"
                            ></img>
                          ) : (
                            <Jazzicon
                              paperStyles={{ border: "solid 2px #fff" }}
                              diameter={38}
                              seed={jsNumberForAddress(signerAddress)}
                            />
                          )}
                        </button>
                      </PopoverHandler>
                      <PopoverContent className="w-52 bg-sec-bg border-sec-text flex flex-col text-center">
                        <div className="mb-3 text-white text-lg font-semibold">
                          {trim(signerAddress)}
                        </div>
                        <Button
                          variant="gradient"
                          onClick={() => {
                            navigate(
                              USER_ROUTE.replace(":userAddress", signerAddress)
                            );
                            document.getElementById("toggle-btn")?.click();
                          }}
                          className="flex justify-center items-center"
                        >
                          <MdAccountCircle className="mr-2 h-4 w-5" />
                          My Profile
                        </Button>
                        <Button
                          variant="gradient"
                          color="pink"
                          onClick={() =>
                            logOut(setSigner, setSignerAddress, setSignerAvatar)
                          }
                          className="flex justify-center items-center mt-6"
                        >
                          <MdOutlineLogout className="mr-2 h-4 w-5" />
                          Log out
                        </Button>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <button
                      onClick={() =>
                        logIn(
                          setProvider,
                          setSigner,
                          setSignerAddress,
                          setSignerAvatar
                        )
                      }
                      type="button"
                      className="bg-stone-700 p-1 rounded-full text-gray-300 hover:text-white focus:outline-none"
                    >
                      <span className="sr-only">Connect</span>
                      <MdOutlineAccountBalanceWallet className="h-8 w-8" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {pages.map((page) => (
                  <NavLink
                    key={page.key}
                    to={page.route}
                    className={({ isActive }) =>
                      classNames(
                        isActive
                          ? "border-b-4 border-solid border-primary text-white"
                          : "text-gray-300 hover:text-white",
                        "block px-3 py-2 font-medium"
                      )
                    }
                  >
                    {page.label}
                  </NavLink>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </>
  );
};
