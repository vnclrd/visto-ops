export interface AccountVerifyPinRequest {
  clientId: string;
  storeId?: string;
  pin?: string;
  storePin?: string;
}