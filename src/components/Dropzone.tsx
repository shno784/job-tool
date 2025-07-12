"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";

interface FileDropzoneProps {
  onFileChange: (file: File) => void;
  file?: File | null;
}

export function FileDropzone({ onFileChange, file }: FileDropzoneProps) {
  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) => {
      console.log(acceptedFiles[0]);
      if (acceptedFiles.length) onFileChange(acceptedFiles[0]);
    },
    [onFileChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted,
    multiple: false,
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, //5MB
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={
        `border-2 border-dashed rounded-md p-6 w-[50%] h-52 ml-[25%] mt-5 text-center pt-20 ` +
        (isDragActive
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 hover:border-gray-400")
      }
    >
      <input {...getInputProps()} />
      {file ? (
        <p>📄 {file.name}</p>
      ) : isDragActive ? (
        <p>Drop it like it’s hot… 🔥</p>
      ) : (
        <p>
          Drag & drop a PDF or DOCX here, or{" "}
          <Button onClick={() => {}}>click to select</Button>
        </p>
      )}
    </div>
  );
}
