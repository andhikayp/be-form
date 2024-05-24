import { Corporate } from "@prisma/client";

export type CorporateResponse = {
  corporateAccountNumber: string;
  corporateName: string;
};

export function toCorporateResponse(corporate: Corporate): CorporateResponse {
  return {
    corporateAccountNumber: corporate.corporateAccountNumber,
    corporateName: corporate.corporateName,
  };
}
