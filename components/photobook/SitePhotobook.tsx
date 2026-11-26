"use client";

import Image from "next/image";
import { Photobook, type PhotobookImageProps, type PhotobookProps } from "./Photobook";

function SiteImage(props: PhotobookImageProps) {
  // The reader's zoom dialog uses the full-size file.
  return <Image {...props} unoptimized={!props.sizes} />;
}

export function SitePhotobook(props: Omit<PhotobookProps, "imageRenderer">) {
  return <Photobook {...props} imageRenderer={SiteImage} />;
}
