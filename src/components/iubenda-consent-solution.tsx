"use client";

import { useEffect } from "react";

const IUBENDA_SITE_ID = 4015840;
const IUBENDA_COOKIE_POLICY_ID = 68695295;
const IUBENDA_LANG = "en";

const SCRIPT_ID_AUTOBLOCKING = "iubenda-autoblocking-script";
const SCRIPT_SRC_AUTOBLOCKING = `https://cs.iubenda.com/autoblocking/${IUBENDA_SITE_ID}.js`;

const SCRIPT_ID_GPP_STUB = "iubenda-gpp-stub-script";
const SCRIPT_SRC_GPP_STUB = "//cdn.iubenda.com/cs/gpp/stub.js";

const SCRIPT_ID_CS = "iubenda-cs-script";
const SCRIPT_SRC_CS = "//cdn.iubenda.com/cs/iubenda_cs.js";

interface CsConfiguration {
  siteId: number;
  cookiePolicyId: number;
  lang: string;
  storage: {
    useSiteId: boolean;
  };
}

type IubendaGlobal = Array<unknown> & {
  csConfiguration?: CsConfiguration;
};

declare global {
  interface Window {
    _iub?: IubendaGlobal;
  }
}

const IubendaConsentSolution = () => {
  useEffect(() => {
    const csConfiguration: CsConfiguration = {
      siteId: IUBENDA_SITE_ID,
      cookiePolicyId: IUBENDA_COOKIE_POLICY_ID,
      lang: IUBENDA_LANG,
      storage: { useSiteId: true }
    };

    window._iub = window._iub ?? [];

    window._iub.csConfiguration = csConfiguration;

    const loadScript = (id: string, src: string, async = false, charset: string | null = null) => {
      if (document.getElementById(id)) {
        return;
      }
      const script = document.createElement("script");
      script.id = id;
      script.src = src;
      script.type = "text/javascript";
      script.async = async;
      if (charset) {
        script.charset = charset;
      }
      document.body.appendChild(script);
    };

    loadScript(SCRIPT_ID_AUTOBLOCKING, SCRIPT_SRC_AUTOBLOCKING);
    loadScript(SCRIPT_ID_GPP_STUB, SCRIPT_SRC_GPP_STUB);
    loadScript(SCRIPT_ID_CS, SCRIPT_SRC_CS, true, "UTF-8");
  }, []);

  return null;
};

export default IubendaConsentSolution;
