import { StylesProps } from "../../../../util/style";
import { Button } from "../../../../ui";
import { FileImageOutlined } from "@ant-design/icons";
import { useRef } from "react";
import { useCallback } from "react";
import { useMount } from "react-use";
import { FileInput, useFileInput } from "../../../../ui/FileInput";

interface ImageAddButtonProps extends StylesProps {
  onload?: (result: string) => void;
  onerror?: (err: any) => void;
  onabort?: () => void;
}

export function ImageAddButton(props: ImageAddButtonProps) {
  const { onload, onerror, onabort } = props;

  const fileInputHook = useFileInput({
    mode: 'readAsDataURL',
    onload,
    onerror,
    onabort,
  });

  return (
    <>
      <Button onClick={fileInputHook.browseFile} prefix={<FileImageOutlined />}></Button>
      <FileInput fileInput={fileInputHook} accept="image/png, image/jpeg" />
    </>
  );
}
