import { VideoPlayer } from "@/components/VideoPlayer";

export function Recording({
  caption,
  ...video
}: {
  caption: string;
  src: string;
  poster?: string;
  title?: string;
}) {
  return (
    <figure className="recording">
      <VideoPlayer {...video} />
      <figcaption className="media-caption">{caption}</figcaption>
    </figure>
  );
}
