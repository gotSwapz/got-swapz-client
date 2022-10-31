import { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "../Config";
import { Spinner } from "./common/Spinner";
import {
  secondsToTime,
  getIpfsUri,
  launchToast,
  ToastType,
} from "../utils/util";
import { MdOutlineOpenInNew } from "react-icons/md";
import { FileInput } from "./common/FileInput";

const CHUNK_SIZE = 1024 * 512; // 0.5MB = 1024 * 512 bytes
const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB = 1024 * 1024 * 1024
const IPFS_BASE_TIME = 10; // Base processing time of IPFS storage request (in seconds)
const IPFS_CHUNK_TIME = 0.2; // Processing time of IPFS storage request for chunk of data (in seconds)

export const UploadCollection = ({ callbackFunc }: any): JSX.Element => {
  const [dropZoneActive, setDropZoneActive] = useState<boolean>(false);
  const [file, setFile] = useState<File>();
  const [currentChunkIndex, setCurrentChunkIndex] = useState<number>(-1);
  const [metadataUri, setMetadataUri] = useState<string>();
  const [imagesUri, setImagesUri] = useState<string>();
  const [totalChunks, setTotalChunks] = useState<number>(0);

  useEffect(() => {
    if (file) {
      setTotalChunks(Math.ceil(file.size / CHUNK_SIZE));
      setCurrentChunkIndex(0);
    }
  }, [file]);

  useEffect(() => {
    if (currentChunkIndex > -1) {
      readAndUploadCurrentChunk();
    }
  }, [currentChunkIndex]);

  const processFile = (newFile: File): void => {
    if (newFile.type !== "application/zip")
      throw new Error("Invalid file type");
    if (newFile.size > MAX_FILE_SIZE) throw new Error("File too large");

    setFile(newFile);
  };

  const readAndUploadCurrentChunk = (): void => {
    if (!file) return;
    const reader = new FileReader();
    const from = currentChunkIndex * CHUNK_SIZE;
    const to = from + CHUNK_SIZE;
    const blob = file.slice(from, to);
    reader.onload = (readerEvent: ProgressEvent<FileReader>) =>
      uploadChunk(readerEvent);
    reader.readAsDataURL(blob);
  };

  const uploadChunk = (readerEvent: ProgressEvent<FileReader>): void => {
    if (!file) return;
    const data = readerEvent.target?.result;

    const params = new URLSearchParams();
    params.set("fileName", file.name);
    params.set("currentChunkIndex", currentChunkIndex.toString());
    params.set("totalChunks", totalChunks.toString());

    const headers = { "Content-Type": "application/octet-stream" };

    axios
      .post(`${apiUrl()}/uploadFiles?${params}`, data, { headers })
      .then((response) => {
        const chunks = totalChunks - 1;
        const isLastChunk = currentChunkIndex === chunks;
        if (isLastChunk) {
          setCurrentChunkIndex(-1);
          storeInIpfs(response.data.filename);
        } else {
          setCurrentChunkIndex(currentChunkIndex + 1);
        }
      })
      .catch((err) => {
        console.log(err);
        setCurrentChunkIndex(-1);
        launchToast("Error uploading file.", ToastType.Error);
      });
  };

  const storeInIpfs = (fileName: string): void => {
    const params = new URLSearchParams();
    params.set("fileName", fileName);

    axios
      .get(`${apiUrl()}/ipfsStorage?${params}`)
      .then((response) => {
        setMetadataUri(getIpfsUri(response.data.metadataUri).split("/{id}")[0]);
        setImagesUri(getIpfsUri(response.data.imagesUri).split("/{id}")[0]);
        callbackFunc(response.data);
      })
      .catch((err) => {
        console.log(err);
        let errorMessage = "Error storing file in IPFS.";
        if (err.response?.data?.metaData) {
          errorMessage = `Error: ${err.response.data.metaData}.`;
        }
        launchToast(errorMessage, ToastType.Error);
        setFile(undefined);
      });
  };

  return (
    <div>
      <div
        className={`h-36 flex justify-center items-center px-6 text-sec-text border-2 border-dashed rounded-lg 
        ${dropZoneActive ? "border-gray-300" : "border-sec-text"}`}
        onDragOver={(e) => {
          e.preventDefault();
          currentChunkIndex === -1 && setDropZoneActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          currentChunkIndex === -1 && setDropZoneActive(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          currentChunkIndex === -1 && processFile(e.dataTransfer.files[0]);
        }}
      >
        {!file && (
          <div className="flex flex-col text-center">
            <span>Drop or upload ZIP file</span>
            <span>max size 1GB</span>
          </div>
        )}

        {file && (
          <>
            {currentChunkIndex > -1 && (
              <div className="flex flex-col w-full">
                <div className="name">Uploading {file.name}</div>
                <div className="w-full bg-sec-text rounded-full">
                  <div
                    className="bg-primary text-xl font-medium text-center p-0.5 leading-none rounded-full"
                    style={{
                      width: `${Math.round(
                        (currentChunkIndex / totalChunks) * 100
                      )}%`,
                    }}
                  >
                    {Math.round((currentChunkIndex / totalChunks) * 100)}%
                  </div>
                </div>
              </div>
            )}

            {currentChunkIndex === -1 && !imagesUri && (
              <>
                <div className="mx-2">
                  <Spinner />
                </div>
                <div>
                  Files uploaded into server. Storing files in IPFS. Please, do
                  not close this window. Estimated time:{" "}
                  {secondsToTime(
                    IPFS_BASE_TIME + totalChunks * IPFS_CHUNK_TIME
                  )}
                </div>
              </>
            )}

            {imagesUri && metadataUri && (
              <div className="text-primary">
                <div className="flex items-center">
                  <span>Metadata files uploaded to IPFS</span>
                  <a href={metadataUri} target="_blank" className="inline">
                    <MdOutlineOpenInNew className="inline w-5 h-5 ml-1 relative bottom-0.5" />
                  </a>
                </div>
                <div>
                  <span>Image files uploaded to IPFS</span>
                  <a href={imagesUri} target="_blank" className="inline">
                    <MdOutlineOpenInNew className="inline w-5 h-5 ml-1 relative bottom-0.5" />
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <div className="relative bottom-12 left-3">
        <FileInput
          onFileUpload={(file: File) => processFile(file)}
          accept="application/zip"
        ></FileInput>
      </div>
    </div>
  );
};
