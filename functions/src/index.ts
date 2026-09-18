import { setGlobalOptions } from "firebase-functions/v2";
import "./config/firebase";

setGlobalOptions({ region: "asia-southeast1" });

export { accountLogin } from "./functions/visto-accountLogin/handler";
export { accountVerifyPin } from "./functions/visto-accountVerifyPin/handler";