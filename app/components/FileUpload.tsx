"use client";
import React, { useRef, useState } from "react";
import { ImageKitProvider, IKUpload } from "imagekitio-next";
import { FileType, Loader, Loader2} from "lucide-react";
import { IKUploadResponse } from "imagekitio-next/dist/types/components/IKUpload/props";
import { set } from "mongoose";


interface FileUploadProps {
    onSuccess: (res:IKUploadResponse) => void;
    onProgress? : (progress:number) => void;
    fileType? : "image" | "video";


}
const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;
const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;


export default function FileUpload({
    onSuccess,
    onProgress,
    fileType = "image"
}: FileUploadProps) {

    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)


const onError = (err: {message: string}) => {
    console.log("Error", err);
    setError(err.message)
    setUploading(false)
  };
  
  const handleSuccess = (response: IKUploadResponse) => {
    console.log("Success", response);
    setUploading(false)
    setError(null)
    onSuccess(response)
  };
  
  const handleStartUpload = () => {
    setUploading(true)
    setError(null)
  };
  const handleProgress =  (evt: ProgressEvent) =>{
    if(evt.lengthComputable && onProgress){
        const percentComplete = (evt.loaded / evt.total)*100;
        onProgress(Math.round(percentComplete))
    }
  }
//   const handleStartUpload = (evt : ProgressEvent) => {
//     console.log("Start", evt);
//   };

  const validateFile = (file: File) =>{
    if(fileType === "video"){
        if(!file.type.startsWith("video/")){
            setError("Please upload a video")
            return false
        }
        if(file.size > 100 * 1024 * 1024){
            setError("video must be less than 100 mb")
            return false
        }
        else{
            const validTypes = ["image/jpeg","image/png", "image/webp"]
            if(!validTypes.includes(file.type)){
                setError("please upload valid format jpeg, webp, png")
                return false

        }
            if(!file.size > 5 * 1024 * 1024){
                setError("video must be less than 5 mb")
                return false
            }
    }
  }
}
  return (
    <div className="space-y-2">
      <h1>ImageKit Next.js quick start</h1>
        <p>Upload an image with advanced options</p>
        <IKUpload
          fileName={fileType === "video" ? "video": "image"}
          useUniqueFileName={true}
          validateFile={validateFile}

        //   webhookUrl="https://www.example.com/imagekit-webhook" // replace with your webhookUrl
        //   overwriteFile={true}
        //   overwriteAITags={true}
        //   overwriteTags={true}
        //   overwriteCustomMetadata={true}
        //   {/* customMetadata={{
        //     "brand": "Nike",
        //     "color": "red",
        //   }} */}
          onError={onError}
          onSuccess={handleSuccess}
          onUploadProgress={handleProgress}
          onUploadStart={handleStartUpload}
          folder={fileType === "video"? "/videos":"images"}
          
        />
        {
            uploading &&(
                <div className="flex items-center gap-2 text-sm text-primary">
                    <Loader2 className="animate-spin w-4 h-4"/>
                    <span>Uploading...</span>
                </div>
            )
        }
        {error && (
            <div className="text-error text-sm"></div>
        )}
    </div>
  );
}