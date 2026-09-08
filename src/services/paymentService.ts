// src/services/paymentService.ts

import { apiGet, apiPatch, apiPost } from "@/lib/http";
import { ENDPOINTS } from "@/constants/api.constants";

export type Payment = {
  id: string;
  tripId: string;
  customerId: string;
  amount: string | number;
  method: string;
  status: "pending" | "paid" | "failed" | "refunded";
  paidAt: string | null;
  createdAt: string;
};

export function getAllPayments(token: string) {
  return apiGet<Payment[]>(ENDPOINTS.payment.all, { token });
}

export function updatePaymentStatus(id: string, status: Payment["status"], token: string) {
  return apiPatch<Payment>(ENDPOINTS.payment.updateStatus(id), { status }, { token });
}

export function refundPayment(id: string, reason: string, token: string) {
  return apiPost<Payment>(ENDPOINTS.payment.refund(id), { reason }, { token });
}
