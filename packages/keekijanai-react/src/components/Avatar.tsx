import { FaUser } from "react-icons/fa";
import clsx from "clsx";
import { isNil } from "@keekijanai/frontend-core";
import styles from "./avatar.module.scss";

interface AvatarProps {
  src?: string;
  alt?: string;
}

export function Avatar({ src, alt }: AvatarProps) {
  const isSrcDef = !isNil(src);
  return (
    <div className={clsx(styles.avatarRoot, !isSrcDef && styles.fallbackAvatar)}>
      {!isSrcDef ? <FaUser /> : <img src={src} alt={alt} />}
    </div>
  );
}
