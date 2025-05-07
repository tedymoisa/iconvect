"use client";

import { useEffect } from "react";

const IUBENDA_SCRIPT_SRC = "https://cdn.iubenda.com/iubenda.js";
const IUBENDA_SCRIPT_ID = "iubenda-script";

const IubendaLinks = () => {
  useEffect(() => {
    if (document.getElementById(IUBENDA_SCRIPT_ID)) {
      return;
    }

    const script = document.createElement("script");
    script.id = IUBENDA_SCRIPT_ID;
    script.src = IUBENDA_SCRIPT_SRC;
    script.async = true;

    document.body.appendChild(script);
  }, []);

  return (
    <div className="flex gap-2">
      <a
        href="https://www.iubenda.com/privacy-policy/68695295"
        className="iubenda-black iubenda-noiframe iubenda-embed iubenda-noiframe"
        title="Privacy Policy "
      >
        Privacy Policy
      </a>{" "}
      <a
        href="https://www.iubenda.com/privacy-policy/68695295/cookie-policy"
        className="iubenda-black iubenda-noiframe iubenda-embed iubenda-noiframe"
        title="Cookie Policy "
      >
        Cookie Policy
      </a>
    </div>
  );
};

export default IubendaLinks;
