import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../Config";
import { User } from "../models/User";
import { getCurrentJwt } from "../utils/localStorage";
import {
  Button,
  Checkbox,
  Input,
  Textarea,
  Tooltip,
} from "@material-tailwind/react";
import { MdHelpOutline } from "react-icons/md";
import { UploadImage } from "../components/UploadImage";
import { Spinner } from "../components/common/Spinner";
import { FieldValues, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { launchToast, ToastType } from "../utils/util";
import { USER_ROUTE } from "../navigation/Routes";
import { SignerContext } from "../context/SignerProvider";

type FormValues = {
  name: string;
  bio: string;
  email: string;
  receiveNotifications: boolean;
};

const registerOptions = {
  name: { required: "A name is required." },
  email: {
    pattern: {
      value:
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      message: "Please enter a valid email address.",
    },
  },
};

export const UserEditPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { userAddress } = useParams<{ userAddress: string }>();
  const [user, setUser] = useState<User>();
  const [banner, setBanner] = useState<File>();
  const [avatar, setAvatar] = useState<File>();
  const [saving, setSaving] = useState<boolean>(false);
  const { setSignerAvatar } = useContext(SignerContext);

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {},
  });

  const getUser = (): void => {
    const currentJwt = getCurrentJwt();
    if (currentJwt?.address !== userAddress) {
      navigate("/");
      return;
    }

    axios
      .get(`${apiUrl()}/user/full/${userAddress}`, {
        headers: {
          Authorization: `Bearer ${currentJwt!.token}`,
        },
      })
      .then((response) => {
        setUser(response.data);
        reset(response.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onErrors = (errors: FieldValues) => {
    console.error(errors);
  };

  const onFormSubmit = async (data: FieldValues): Promise<void> => {
    if (
      !banner &&
      !avatar &&
      data.name === user?.name &&
      data.bio === user?.bio &&
      data.email === user?.email &&
      data.receiveNotifications === user?.receiveNotifications
    ) {
      toast("No changes to save.", { type: "info" });
      return;
    }

    const userEdit: User = {
      address: userAddress!,
      name: data.name,
      bio: data.bio,
      email: data.email,
      receiveNotifications: data.receiveNotifications,
    };
    const formData: FormData = new FormData();
    formData.append("user", JSON.stringify(userEdit));
    avatar && formData.append("avatar", avatar);
    banner && formData.append("banner", banner);

    setSaving(true);

    axios
      .put(`${apiUrl()}/user`, formData, {
        headers: {
          Authorization: `Bearer ${getCurrentJwt()?.token}`,
        },
      })
      .then((response) => {
        if (response.data.success) {
          setSaving(false);
          if (response.data.newAvatar) {
            setSignerAvatar(response.data.newAvatar);
          }
          launchToast("Profile updated successfully.");
          navigate(USER_ROUTE.replace(":userAddress", userAddress!));
        } else {
          setSaving(false);
          launchToast("An error occurred saving changes.", ToastType.Error);
        }
      })
      .catch((err) => {
        console.log(err);
        setSaving(false);
      });
  };

  useEffect(() => {
    if (!userAddress) return;
    getUser();
  }, [userAddress]);

  return (
    <div className="p-16 flex flex-col items-center">
      <h1 className="text-3xl pb-8 font-bold text-center">Edit profile</h1>
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
              {...register("bio")}
              variant="outlined"
              label="Bio"
              size="lg"
              className="!text-white bg-sec-bg"
              name="bio"
              maxLength={650}
            />
          </div>
          {/* Email */}
          <div className="w-full py-3">
            <Input
              {...register("email", registerOptions.email)}
              {...(errors.email && { error: true })}
              variant="outlined"
              label="Email"
              size="lg"
              name="email"
              type="string"
              className="!text-white bg-sec-bg error"
            />
            <div className="text-red-400 text-sm">
              {errors?.email && errors.email.message}
            </div>
          </div>
          {/* Notifications */}
          <div className="w-full py-3">
            <div className="flex items-center">
              <span className="font-normal">Receive notifications</span>
              <Tooltip content="You will receive emails when there are updates in your swap offers.">
                <span className="relative bottom-0.5 ml-1">
                  <MdHelpOutline className="text-sec-text inline h-5 w-5"></MdHelpOutline>
                </span>
              </Tooltip>
              <Checkbox {...register("receiveNotifications")} />
            </div>
          </div>
          {/* Banner */}
          <div className="mt-6 w-full">
            <span className="block font-normal mb-1">Banner</span>
            {user && (
              <UploadImage
                initialImage={user.bannerUrl}
                callbackFunc={(_image: File) => {
                  setBanner(_image);
                }}
              ></UploadImage>
            )}
          </div>
          {/* Avatar */}
          <div className="mb-4 w-full">
            <span className="block font-normal mb-1">Avatar</span>
            <div className="flex justify-center">
              {user && (
                <UploadImage
                  circular={true}
                  initialImage={user?.avatarUrl}
                  callbackFunc={(_image: File) => {
                    setAvatar(_image);
                  }}
                ></UploadImage>
              )}
            </div>
          </div>
        </div>
        {/* Submit */}
        <div className="flex justify-center my-12">
          <Button variant="gradient" type="submit" disabled={saving}>
            Save changes
            {saving && <Spinner inButton={true} />}
          </Button>
        </div>
      </form>
    </div>
  );
};
