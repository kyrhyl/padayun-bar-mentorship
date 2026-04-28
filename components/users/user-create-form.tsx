import { ADMIN_CREATABLE_USER_ROLES } from "@/lib/validators/user";

interface UserCreateFormProps {
  action: (formData: FormData) => void;
}

export function UserCreateForm({ action }: UserCreateFormProps) {
  return (
    <form action={action} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-700">
          Full Name
          <input name="name" required minLength={2} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
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
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm text-slate-700">
          Role
          <select name="role" defaultValue="mentor" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2">
            {ADMIN_CREATABLE_USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
        Create User
      </button>
    </form>
  );
}
