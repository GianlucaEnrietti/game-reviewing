"use client";

import { useEffect, useRef } from "react";

type Props = {
  url: string;
};

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => void;
      };
    };
  }
}

export default function XEmbed({ url }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    function renderWidget() {
      window.twttr?.widgets.load(container ?? undefined);
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://platform.twitter.com/widgets.js"]'
    );

    if (existingScript) {
      if (window.twttr) {
        renderWidget();
      } else {
        existingScript.addEventListener("load", renderWidget);
      }
      return () => existingScript.removeEventListener("load", renderWidget);
    }

    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.onload = renderWidget;
    document.body.appendChild(script);
  }, [url]);

  return (
    <div ref={containerRef} className="my-6 flex justify-center">
      <blockquote className="twitter-tweet" data-theme="dark">
        <a href={url} />
      </blockquote>
    </div>
  );
}
