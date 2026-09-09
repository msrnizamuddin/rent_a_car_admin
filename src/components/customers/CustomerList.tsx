"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";

const statusStyle: Record<string, string> = {
  active: "bg-green-50 text-green-600",
  inactive: "bg-slate-100 text-black",
  suspended: "bg-amber-50 text-amber-600",
  blocked: "bg-red-50 text-red-600",
};

export default function CustomerList() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const { users, pagination, loading, error } = useUsers({
    role: "customer",
    search: search || undefined,
    limit: 50,
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-black">Customers</h1>
          <p className="text-sm text-black">
            {pagination?.total ?? users.length} total customers
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers"
            className="h-11 w-full pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-black placeholder:text-black outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-black">Loading customers…</p>
      ) : error ? (
        <p className="text-sm text-red-500">Couldn&apos;t load customers.</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-black">No customers found.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-black">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-semibold shrink-0">
                        {(c.fullName as string)?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-black">
                        {c.fullName as string}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-black">{c.mobileNumber}</td>
                  <td className="py-3 px-4 text-black">
                    {(c.email as string) || "—"}
                  </td>
                  <td className="py-3 px-4 text-black">
                    {c.createdAt ? new Date(c.createdAt as string).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        statusStyle[c.centralStatus as string] || "bg-slate-100 text-black"
                      }`}
                    >
                      {c.centralStatus as string}
                    </span>
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
