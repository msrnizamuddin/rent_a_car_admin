"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePayments } from "@/hooks/usePayments";
import { updatePaymentStatus, refundPayment } from "@/services/paymentService";
import { formatApiError } from "@/lib/errorMessages";

const statusStyle: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600",
  paid: "bg-green-50 text-green-600",
  failed: "bg-red-50 text-red-600",
  refunded: "bg-slate-100 text-black",
};

export default function PaymentList() {
  const { token } = useAuth();
  const { payments, loading, error, reload } = usePayments();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const markPaid = async (id: string) => {
    if (!token) return;
    setActionError("");
    setBusyId(id);
    try {
      await updatePaymentStatus(id, "paid", token);
      await reload();
    } catch (err) {
      setActionError(formatApiError(err));
    } finally {
      setBusyId(null);
    }
  };

  const refund = async (id: string) => {
    if (!token) return;
    setActionError("");
    setBusyId(id);
    try {
      await refundPayment(id, "Refunded by admin", token);
      await reload();
    } catch (err) {
      setActionError(formatApiError(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-black">Payments</h1>
        <p className="text-sm text-black">{payments.length} total transactions</p>
      </div>

      {actionError && (
        <p className="mb-4 text-sm font-medium text-red-500">{actionError}</p>
      )}

      {loading ? (
        <p className="text-sm text-black">Loading payments…</p>
      ) : error ? (
        <p className="text-sm text-red-500">Couldn&apos;t load payments.</p>
      ) : payments.length === 0 ? (
        <p className="text-sm text-black">No payments recorded yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-black">
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Trip</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-medium text-black">
                    {p.id.slice(0, 8)}
                  </td>
                  <td className="py-3 px-4 text-black">{p.tripId.slice(0, 8)}</td>
                  <td className="py-3 px-4 text-black">৳{p.amount}</td>
                  <td className="py-3 px-4 capitalize text-black">{p.method}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        statusStyle[p.status] || "bg-slate-100 text-black"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {p.status === "pending" && (
                        <button
                          disabled={busyId === p.id}
                          onClick={() => markPaid(p.id)}
                          className="h-8 px-3 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-xs font-semibold transition"
                        >
                          Mark paid
                        </button>
                      )}
                      {p.status === "paid" && (
                        <button
                          disabled={busyId === p.id}
                          onClick={() => refund(p.id)}
                          className="h-8 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60 text-xs font-semibold transition"
                        >
                          Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
