"use client";

import { useState, type FormEvent } from "react";
import { useProfile } from "@/hooks/useProfile";

const inputClass =
  "w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition";
const labelClass = "text-xs font-medium text-slate-500 mb-1.5 block";

export default function SettingsPanel() {
  const { user, saving, error, success, updateProfile, changePassword } = useProfile();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleProfileSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateProfile({ fullName, email });
  };

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    changePassword(oldPassword, newPassword).then(() => {
      setOldPassword("");
      setNewPassword("");
    });
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">
          Manage your profile and account security.
        </p>
      </div>

      {(error || success) && (
        <p className={`mb-4 text-sm font-medium ${error ? "text-red-500" : "text-green-600"}`}>
          {error || success}
        </p>
      )}

      <form onSubmit={handleProfileSubmit} className="rounded-2xl border border-slate-100 p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelClass}>Full name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input value={user?.mobileNumber || ""} disabled className={`${inputClass} bg-slate-100 cursor-not-allowed`} />
          </div>
          <div>
            <label className={labelClass}>Role</label>
            <input value={user?.role || ""} disabled className={`${inputClass} bg-slate-100 cursor-not-allowed capitalize`} />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold transition"
        >
          Save profile
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="rounded-2xl border border-slate-100 p-5">
        <h2 className="text-sm font-semibold text-slate-800 mb-4">Change password</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelClass}>Current password</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>New password</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="h-10 px-5 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white text-sm font-semibold transition"
        >
          Change password
        </button>
      </form>
    </div>
  );
}
