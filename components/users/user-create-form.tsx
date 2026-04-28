"use client";

import { useState } from "react";

import { ADMIN_CREATABLE_USER_ROLES } from "@/lib/validators/user";

interface UserCreateFormProps {
  action: (formData: FormData) => void;
}

export function UserCreateForm({ action }: UserCreateFormProps) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="ui-btn-primary h-9 w-fit px-3 text-sm font-medium">
        Create User
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Create User Account</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700"
              >
                Close
              </button>
            </div>

            <form action={action} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm text-slate-700">
                  Full Name
                  <input
                    name="name"
                    required
                    minLength={2}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                  />
                </label>

                <label className="block text-sm text-slate-700">
                  Email
                  <input
                    name="email"
                    type="email"
                    required
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm text-slate-700">
                  Password
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      className="w-full rounded-md border border-slate-300 px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="rounded border border-slate-300 px-2 py-2 text-xs text-slate-700"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>

                <label className="block text-sm text-slate-700">
                  Role
                  <select
                    name="role"
                    defaultValue="mentor"
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                  >
                    {ADMIN_CREATABLE_USER_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded border border-slate-300 px-3 py-1.5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
