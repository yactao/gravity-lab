import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "../service/authConfig";


let instance: any = null;

try {
    if (typeof window !== "undefined" && window.crypto) {
        instance = new PublicClientApplication(msalConfig);
    } else {
        console.warn("MSAL Initialization skipped: window.crypto is not available (Requires HTTPS or localhost).");
        instance = {} as any; // Fallback mock to prevent crashing
    }
} catch (error) {
    console.warn("MSAL Initialization failed:");
    console.warn(error);
    instance = {} as any;
}

export const msalInstance = instance;