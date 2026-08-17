import { ShimmerLink } from "@/components/ShimmerLink";

type Social = { label: string; url: string };

export function Intro({
  paragraphs,
  socials,
  email,
}: {
  paragraphs: string[];
  socials: Social[];
  email: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      {paragraphs.map((text) => (
        <p key={text}>{text}</p>
      ))}
      <p>
        You can find me on{" "}
        {socials.map((social, i) => (
          <span key={social.url}>
            <ShimmerLink href={social.url}>{social.label}</ShimmerLink>
            {i < socials.length - 1 ? ", " : ""}
          </span>
        ))}
        , or reach me via{" "}
        <ShimmerLink href={`mailto:${email}`}>email</ShimmerLink>.
      </p>
    </div>
  );
}
