import { onRequest } from "firebase-functions/v2/https";
import { AccountLoginRequest } from "./request";
import { accountLoginAction } from "./action";
import { AccountMiddleware } from "../../middlewares/AccountMiddleware";

export const accountLogin = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const payload = req.body as AccountLoginRequest;
    const account = await accountLoginAction(payload);

    res.status(200).json({
      success: true,
      account,
    });
  } catch (error) {
    AccountMiddleware.handleError(res, error);
  }
});