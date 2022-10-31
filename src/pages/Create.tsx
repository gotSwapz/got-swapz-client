import { useContext, useState } from "react";
import { FieldValues, useFieldArray, useForm } from "react-hook-form";
import axios from "axios";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  IconButton,
  Input,
  Textarea,
} from "@material-tailwind/react";
import { SignerContext } from "../context/SignerProvider";
import { BigNumber, Contract, utils } from "ethers";
import { factoryAbi } from "../contracts/factory";
import { apiUrl, networks } from "../Config";
import { UploadImage } from "../components/UploadImage";
import { Package } from "../models/Package";
import { UploadCollection } from "../components/UploadCollection";
import { CollectionCreate } from "../models/CollectionCreate";
import { MdAddCircle, MdDelete, MdHelpOutline } from "react-icons/md";
import { launchToast, ToastType } from "../utils/util";
import { COLLECTION_ROUTE } from "../navigation/Routes";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../components/common/Spinner";
import { getActiveNetwork } from "../utils/localStorage";

type FormValues = {
  name: string;
  description: string;
  packages: Package[];
};

const registerOptions = {
  name: { required: "Name of the collection is required." },
  description: { required: "Description of the collection is required." },
  packageUnits: {
    required: "Package units is required.",
    min: { value: 1, message: "Minimum units per package is 1." },
    max: { value: 100, message: "Max units per package is 100." },
  },
  packagePrice: {
    required: "Package price is required.",
    min: { value: 0.001, message: "Minimum package price is 0.001 MATIC." },
  },
};

export const CreatePage = (): JSX.Element => {
  const { signer, signerAddress } = useContext(SignerContext);
  const navigate = useNavigate();
  const [collectionId, setCollectionId] = useState<number>();
  const [uri, setUri] = useState<string>();
  const [rarity, setRarity] = useState<number[]>();
  const [banner, setBanner] = useState<File>();
  const [logo, setLogo] = useState<File>();
  const [creating, setCreating] = useState<boolean>(false);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { packages: [{}] },
  });

  const { fields, append, remove } = useFieldArray({
    name: "packages",
    control,
    rules: { required: "Add at least one package" },
  });

  const onErrors = (errors: FieldValues) => {
    console.error(errors);
  };

  const onFormSubmit = async (data: FieldValues): Promise<void> => {
    if (!signer || !signerAddress) {
      launchToast("Please login to create a collection.", ToastType.Error);
      return;
    }
    if (!logo) {
      launchToast("Logo image missing.", ToastType.Error);
      return;
    }
    if (!banner) {
      launchToast("Banner image missing.", ToastType.Error);
      return;
    }
    if (!rarity?.length) {
      launchToast("Rarity values missing.", ToastType.Error);
      return;
    }

    setCreating(true);

    const packageUnits: number[] = [];
    const packagePrices: BigNumber[] = [];
    data.packages.forEach((packageData: { units: number; price: number }) => {
      packageUnits.push(packageData.units);
      packagePrices.push(utils.parseEther(packageData.price.toString()));
    });

    const factory = new Contract(
      networks[getActiveNetwork()].factoryAddress,
      factoryAbi,
      signer
    );

    try {
      const tx = await factory.createCollection(
        signerAddress,
        data.name,
        uri,
        packageUnits,
        packagePrices,
        rarity
      );
      const events = (await tx.wait()).events;

      const collection: CollectionCreate = {
        id: collectionId!,
        address: events[1].args.addr as string,
        name: data.name,
        description: data.description,
        owner: signerAddress,
        packages: data.packages,
      };

      const formData: FormData = new FormData();
      formData.append("collection", JSON.stringify(collection));
      formData.append("logo", logo);
      formData.append("banner", banner);

      axios
        .put(`${apiUrl()}/collection`, formData)
        .then((response) => {
          if (response.data.success) {
            setCreating(false);
            launchToast("Collection created successfully.");
            navigate(
              COLLECTION_ROUTE.replace(
                ":collectionId",
                collectionId!.toString()
              )
            );
          } else {
            setCreating(false);
            launchToast(
              "An error occurred creating the collection.",
              ToastType.Error
            );
          }
        })
        .catch((err) => {
          console.log(err);
          setCreating(false);
          launchToast(
            "An error occurred creating the collection.",
            ToastType.Error
          );
        });
    } catch (err) {
      console.log(err);
      setCreating(false);
      launchToast(
        "An error occurred creating the collection.",
        ToastType.Error
      );
    }
  };

  return (
    <div className="p-16 flex flex-col items-center">
      <h1 className="text-3xl pb-8 font-bold text-center">
        Create new collection
      </h1>
      <form
        onSubmit={handleSubmit(onFormSubmit, onErrors)}
        className="w-full max-w-xl"
      >
        <div className="flex flex-wrap mb-6">
          {/* Name */}
          <div className="w-full py-3">
            <Input
              {...register("name", registerOptions.name)}
              {...(errors.name && { error: true })}
              variant="outlined"
              label="Name"
              size="lg"
              name="name"
              type="text"
              className="!text-white bg-sec-bg error"
            />
            <div className="text-red-400 text-sm">
              {errors?.name && errors.name.message}
            </div>
          </div>
          {/* Description */}
          <div className="w-full py-3">
            <Textarea
              {...register("description", registerOptions.description)}
              {...(errors.description && { error: true })}
              variant="outlined"
              label="Description"
              size="lg"
              className="!text-white bg-sec-bg"
              name="description"
              maxLength={650}
            />
            <div className="text-red-400 text-sm">
              {errors?.description && errors.description.message}
            </div>
          </div>
          {/* Collection files */}
          <div className="mt-2 w-full">
            <div className="mb-1 font-normal">
              <span>Collection files ZIP</span>
              <button
                type="button"
                className="relative bottom-0.5 ml-1"
                onClick={() => setOpenDialog(!openDialog)}
              >
                <MdHelpOutline className="text-sec-text inline h-5 w-5"></MdHelpOutline>
              </button>
            </div>
            <UploadCollection
              callbackFunc={(data: any) => {
                setUri(data.metadataUri);
                setCollectionId(data.collectionId);
                setRarity(data.rarity);
              }}
            ></UploadCollection>
            <Dialog
              open={openDialog}
              handler={() => setOpenDialog(!openDialog)}
              className="bg-sec-bg"
              size="lg"
            >
              <DialogHeader className="text-white border-b border-sec-text px-6">
                Collection files
              </DialogHeader>
              <DialogBody className="text-white font-normal block px-6">
                <p className="pb-2">
                  The files of the NFT images and metadata has to be compressed
                  in a ZIP archive with <b>no directories inside</b>.
                </p>
                <p className="pb-2">
                  You have to include a <b>[unique_name].[image_extension]</b>{" "}
                  and <b>[unique_name].json</b> file for each NFT.
                </p>
                <p className="pb-2">
                  The <b>metadata JSON</b> file has to be in the following
                  format:
                  <ul>
                    <li className="pl-4">
                      <b>Name</b>: name of the NFT.
                    </li>
                    <li className="pl-4">
                      <b>Description</b>: description of the NFT.
                    </li>
                    <li className="pl-4">
                      <b>Properties</b>: object of key-value pairs
                    </li>
                    <li className="pl-4">
                      <b>Rarity</b>: value for the rarity of the NFT inside the
                      collection, from 1 (more rare) to 100 (less rare). This
                      value will determine how likely is to get an NFT in
                      purchase. This field is optional (default: 100).
                    </li>
                  </ul>
                  <code className="block whitespace-pre px-8 py-4 m-2 mb-0 bg-prim-bg text-sec-text rounded-xl">
                    {"{\n" +
                      '  "name": "Cool NFT",\n' +
                      '  "description": "A really cool NFT",\n' +
                      '  "properties": {\n' +
                      '    "coolness": 100\n' +
                      '    "awesomeness": "A lot"\n' +
                      "  },\n" +
                      '  "rarity": 30\n' +
                      "}"}
                  </code>
                </p>
              </DialogBody>
              <DialogFooter className="pt-0 px-6">
                <Button
                  variant="gradient"
                  onClick={() => setOpenDialog(!openDialog)}
                >
                  OK
                </Button>
              </DialogFooter>
            </Dialog>
          </div>
          {/* Banner */}
          <div className="w-full">
            <span className="block font-normal mb-1">Banner</span>
            <UploadImage
              callbackFunc={(_image: File) => {
                setBanner(_image);
              }}
            ></UploadImage>
          </div>
          {/* Logo */}
          <div className="w-full">
            <span className="block font-normal mb-1">Logo</span>
            <div className="flex justify-center">
              <UploadImage
                circular={true}
                callbackFunc={(_image: File) => {
                  setLogo(_image);
                }}
              ></UploadImage>
            </div>
          </div>
          {/* Packages */}
          <div className="mb-4 w-full pt-1">
            <span className="border-b border-primary block font-normal">
              Packages
            </span>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center pt-3">
                <div>
                  <Input
                    {...register(
                      `packages.${index}.units`,
                      registerOptions.packageUnits
                    )}
                    variant="outlined"
                    label="Units"
                    size="lg"
                    type="number"
                    step={1}
                    className="!text-white bg-sec-bg"
                  />
                </div>
                <div className="pl-2">
                  <Input
                    {...register(
                      `packages.${index}.price`,
                      registerOptions.packagePrice
                    )}
                    variant="outlined"
                    label="Price"
                    size="lg"
                    type="number"
                    step={0.01}
                    className="!text-white bg-sec-bg"
                  />
                </div>
                {fields.length > 1 && (
                  <IconButton
                    variant="gradient"
                    color="pink"
                    size="sm"
                    onClick={() => {
                      remove(index);
                    }}
                    className="ml-2"
                  >
                    <MdDelete className="h-5 w-5" />
                  </IconButton>
                )}
                {index === fields.length - 1 && (
                  <IconButton
                    variant="gradient"
                    size="sm"
                    onClick={() => {
                      append({});
                    }}
                    className="ml-2"
                  >
                    <MdAddCircle className="h-5 w-5" />
                  </IconButton>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Submit */}
        <div className="flex justify-center my-12">
          <Button variant="gradient" type="submit" disabled={creating}>
            Create Collection
            {creating && <Spinner inButton={true} />}
          </Button>
        </div>
      </form>
    </div>
  );
};
