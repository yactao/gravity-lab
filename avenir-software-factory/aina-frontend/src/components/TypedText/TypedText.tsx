import { useState, useEffect } from "react";


  
  export default function TypedText({ text, speed, start, className, asHTML }: any) {
    const [displayed, setDisplayed] = useState("");
  
    useEffect(() => {
      if (!start) return;
      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayed(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
        }
      }, speed);
      return () => clearInterval(interval);
    }, [text, start, speed]);
  
    if (asHTML) {
      return <div className={className} dangerouslySetInnerHTML={{ __html: displayed }} />;
    }
    return <div className={className}>{displayed}</div>;
  }