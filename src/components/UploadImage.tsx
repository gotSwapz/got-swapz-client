import { useState } from "react";
import { classNames } from "../utils/util";
import { FileInput } from "./common/FileInput";

const MAX_FILE_SIZE = 1024 * 1024 * 10; // 10MB = 1024 * 1024 * 10

interface Props {
  callbackFunc: (file: File) => void;
  circular?: boolean;
  initialImage?: string;
}

export const UploadImage = ({
  callbackFunc,
  circular,
  initialImage,
}: Props): JSX.Element => {
  const [dropZoneActive, setDropZoneActive] = useState<boolean>(false);
  const [fileData, setFileData] = useState<string>(initialImage || "");

  const processFile = (newFile: File): void => {
    if (!newFile.type.match(/image.*/)) throw new Error("Invalid file type");
    if (newFile.size > MAX_FILE_SIZE) throw new Error("File too large");

    const reader = new FileReader();
    reader.onload = (readerEvent: ProgressEvent<FileReader>) =>
      setFileData(readerEvent.target?.result as string);
    reader.readAsDataURL(newFile);

    callbackFunc(newFile);
  };

  return (
    <div>
      <div
        className={`h-40 overflow-hidden flex justify-center items-center text-sec-text border-2 border-dashed
               ${dropZoneActive ? "border-gray-300" : "border-sec-text"}
               ${circular ? "rounded-full w-40" : "rounded-lg"}
          `}
        onDragOver={(e) => {
          e.preventDefault();
          setDropZoneActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDropZoneActive(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          processFile(e.dataTransfer.files[0]);
        }}
      >
        {fileData ? (
          <img src={fileData} className="object-cover h-40 w-full" />
        ) : (
          <div className="flex flex-col text-center">
            <span>Drop or upload image file</span>
            <span>max size 10MB</span>
          </div>
        )}
      </div>
      <div
        className={classNames(
          circular ? "bottom-8 right-8" : "bottom-12 left-3",
          "relative"
        )}
      >
        <FileInput
          onFileUpload={(file: File) => processFile(file)}
          accept="image/*"
        ></FileInput>
      </div>
    </div>
  );
};
