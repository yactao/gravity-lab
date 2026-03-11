import { useEffect, useState } from "react";

type Props = { text: string };

interface TypedTextProps {
  text: string;
  speed?: number;
  start?: boolean;
  className?: string;
}

/** Composant TypedText */
export function TypedText({ text, speed = 20, start = false, className }: TypedTextProps) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!start) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, start]);

  return <div className={className} dangerouslySetInnerHTML={{ __html: displayed }} />;
}

/** FormattedAnswer avec TypedText */
export default function FormattedAnswer({ text }: Props) {
  // Formater le texte : nombres et dates en gras
  const formatted = text
    .replace(/\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/g, "<strong>$1</strong>") // dates
    .replace(/\b(\d+)\.\s+/g, "<strong>$1.</strong> ") // numéros
    .replace(/\[([0-9]+)\]/g, "🔗 [$1]")
    .replace(/Sources\s*:/gi, "📚 <strong>Sources :</strong>");

  return <TypedText text={formatted} start={true} />;
}