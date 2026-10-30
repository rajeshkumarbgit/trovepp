/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Override the enquiry endpoint (defaults to /enquiry.php on the same host). */
  readonly VITE_ENQUIRY_URL?: string;
}
