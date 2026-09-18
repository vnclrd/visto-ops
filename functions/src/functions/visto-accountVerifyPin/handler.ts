import { onRequest } from "firebase-functions/v2/https";
import type { AccountVerifyPinRequest } from "./request";
import { accountVerifyPinAction } from "./action";
import { AccountMiddleware } from "../../middlewares/AccountMiddleware";

export const accountVerifyPin = onRequest(
  { cors: true, region: "asia-southeast1" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    try {
      const payload = req.body as AccountVerifyPinRequest;
      const verified = await accountVerifyPinAction(payload);

      res.status(200).json({
        success: true,
        verified,
      });
    } catch (error) {
      AccountMiddleware.handleError(res, error);
    }
  }
);