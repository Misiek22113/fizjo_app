import { serverEnv } from "@/lib/env";
import twilio from "twilio";

type TwilioMessageResponse = {
  sid: string;
  status: string;
  error_code: string | null;
  error_message: string | null;
};

export async function sendTwilioSms(params: {
  to: string;
  body: string;
  statusCallbackUrl: string;
}): Promise<TwilioMessageResponse> {
  const accountSid = serverEnv.twilioAccountSid;
  const authToken = serverEnv.twilioAuthToken;

  const client = twilio(accountSid, authToken);
  const message = await client.messages.create({
    to: params.to,
    body: params.body,
    messagingServiceSid: serverEnv.twilioMessagingServiceSid,
    statusCallback: params.statusCallbackUrl,
  });

  return {
    sid: message.sid,
    status: message.status,
    error_code: message.errorCode ? String(message.errorCode) : null,
    error_message: message.errorMessage,
  };
}

export async function verifyTwilioSignature(params: {
  fullUrl: string;
  body: string;
  providedSignature: string;
}): Promise<boolean> {
  const authToken = serverEnv.twilioAuthToken;

  const parsedBody = new URLSearchParams(params.body);
  const requestParams: Record<string, string | string[]> = {};

  for (const key of new Set(Array.from(parsedBody.keys()))) {
    const values = parsedBody.getAll(key);
    requestParams[key] = values.length > 1 ? values : values[0] ?? "";
  }

  return twilio.validateRequest(authToken, params.providedSignature, params.fullUrl, requestParams);
}
