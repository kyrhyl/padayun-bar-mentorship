"use client";

import { useState } from "react";

interface UpdateUserDialogProps {
  userId: string;
  currentName: string;
  onUpdateManagedUser: (formData: FormData) => void;
}

export function UpdateUserDialog({ userId, currentName, onUpdateManagedUser }: UpdateUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="rounded border border-slate-300 px-2 py-1 text-xs">
        Edit name/password
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Update User Credentials</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700"
              >
                Close
              </button>
            </div>

            <form action={onUpdateManagedUser} className="space-y-3">
              <input type="hidden" name="userId" value={userId} />
              <label className="block text-xs text-slate-700">
                Name
                <input
                  type="text"
                  name="name"
                  required
                  minLength={2}
                  defaultValue={currentName}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-2 text-sm"
                />
              </label>
              <label className="block text-xs text-slate-700">
                New password
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="newPassword"
                    required
                    minLength={8}
                    className="w-full rounded border border-slate-300 px-2 py-2 text-sm"
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
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded border border-slate-300 px-3 py-1.5 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded bg-slate-900 px-3 py-1.5 text-xs text-white">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
