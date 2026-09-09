"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useDriverApplications } from "@/hooks/useDriverApplications";
import { approveDriverApplication, rejectDriverApplication } from "@/services/driverApplicationService";
import { formatApiError } from "@/lib/errorMessages";

const statusStyle: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600",
  approved: "bg-green-50 text-green-600",
  rejected: "bg-red-50 text-red-600",
};

export default function DriverApplicationList() {
  const { token } = useAuth();
  const { applications, loading, error, reload } = useDriverApplications();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const handleApprove = async (id: string, fullName: string) => {
    if (!token) return;
    if (!window.confirm(`Approve "${fullName}"? This creates their driver account.`)) return;

    setActionError("");
    setBusyId(id);

    try {
      await approveDriverApplication(id, token);
      await reload();
    } catch (err) {
      setActionError(formatApiError(err, "Could not approve application."));
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id: string, fullName: string) => {
    if (!token) return;
    const reason = window.prompt(`Reason for rejecting "${fullName}"?`);
    if (!reason) return;

    setActionError("");
    setBusyId(id);

    try {
      await rejectDriverApplication(id, reason, token);
      await reload();
    } catch (err) {
      setActionError(formatApiError(err, "Could not reject application."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Driver Applications</h1>
          <p className="text-sm text-slate-500">{applications.length} total applications</p>
        </div>
      </div>

      {actionError && <p className="mb-4 text-sm font-medium text-red-500">{actionError}</p>}

      {loading ? (
        <p className="text-sm text-slate-400">Loading applications…</p>
      ) : error ? (
        <p className="text-sm text-red-500">Couldn&apos;t load applications.</p>
      ) : applications.length === 0 ? (
        <p className="text-sm text-slate-400">No applications yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">License</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Applied</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-medium text-slate-900">{a.fullName}</td>
                  <td className="py-3 px-4 text-slate-600">{a.mobileNumber}</td>
                  <td className="py-3 px-4 text-slate-600">{a.email || "—"}</td>
                  <td className="py-3 px-4 text-slate-600">{a.licenseNumber}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        statusStyle[a.status] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {a.status}
                    </span>
                    {a.status === "rejected" && a.rejectionReason && (
                      <p className="text-xs text-slate-400 mt-1 max-w-[200px]">{a.rejectionReason}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{a.createdAt.slice(0, 10)}</td>
                  <td className="py-3 px-4">
                    {a.status === "pending" && (
                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          disabled={busyId === a.id}
                          onClick={() => handleApprove(a.id, a.fullName)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 hover:text-green-700 disabled:opacity-60 transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={busyId === a.id}
                          onClick={() => handleReject(a.id, a.fullName)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 disabled:opacity-60 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </div>
                    )}
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
