declare global {
  interface Window {
    ENV?: {
      VITE_API_URL?: string;
    };
  }
}

interface ImportMetaEnv {
  VITE_API_URL?: string;
}

interface CustomImportMeta {
  env?: ImportMetaEnv;
}

const apiUrl =
  (typeof window !== "undefined"
    ? window.ENV?.VITE_API_URL || (import.meta as unknown as CustomImportMeta).env?.VITE_API_URL
    : process.env.VITE_API_URL) || "http://localhost:5000";

export const env = {
  apiUrl: apiUrl.replace(/\/$/, ""),
};
