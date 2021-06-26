import React, { useCallback } from 'react'
import { useEffect } from 'react';
import { useRef } from 'react';
import { useMountedState, useUnmount } from 'react-use';


type FileInputHook = {
  refInput: React.RefObject<HTMLInputElement>;
  onInputChange: React.ChangeEventHandler<HTMLInputElement>;
}


type UseFileInputParams = {
  mode: 'readAsDataURL';
  maxSize?: number;
  onload?: (result: string) => void;
  onerror?: (err: any) => void;
  onabort?: () => void;
}

interface FileInputProps {
  fileInput: FileInputHook;
  accept: string;
  multiple?: boolean;
}

const styleInput: React.CSSProperties = {
  display: "none",
};

const style = {
  input: styleInput,
};


export default function FileInput(props: FileInputProps) {
  const {
    fileInput,
    accept,
  } = props;

  return (
    <input
      ref={fileInput.refInput}
      type="file"
      style={style.input}
      onChange={fileInput.onInputChange}
      accept="image/png, image/jpeg"
    />
  )
}

export function useFileInput(params: UseFileInputParams) {
  const refInput = useRef<HTMLInputElement>(null);
  const refFileReader = useRef<FileReader>(new FileReader());
  const isMount = useMountedState();

  const browseFile: React.MouseEventHandler<HTMLButtonElement> =
    useCallback(() => {
      const inputEl = refInput.current;
      if (inputEl) {
        inputEl.click();
      }
    }, []);
  
  const onInputChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    async (ev) => {
      const files = ev.target.files;
      if (files) {
        const fileReader = refFileReader.current;
        for (const file of files) {
          await new Promise((resolve, reject) => {
            if (!isMount()) {
              resolve(null);
              return;
            }
            fileReader.readAsDataURL(file);
            fileReader.onload = (ev) => {
              if (isMount()) {
                params.onload?.(fileReader.result as string);
              }
              resolve(null);
            };
            fileReader.onerror = (ev) => {
              if (isMount()) {
                params.onerror?.(fileReader.error);
              }
              resolve(null);
            }
            fileReader.onabort = () => {
              if (isMount()) {
                params?.onabort?.();
              }
              resolve(null);
            }
          });
        }
      }
    },
    []
  );

  return {
    refInput,
    browseFile,
    onInputChange,
  }
}
