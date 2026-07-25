import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Pantry</h1>
      <form action={login} className="flex w-full max-w-xs flex-col gap-3">
        <input
          type="password"
          inputMode="numeric"
          name="passcode"
          autoFocus
          placeholder="Passcode"
          className="w-full rounded-xl border border-zinc-300 bg-transparent px-4 py-3 text-center text-lg tracking-widest outline-none focus:border-emerald-600 dark:border-zinc-700"
        />
        {error && (
          <p className="text-center text-sm text-red-500">Wrong passcode, try again.</p>
        )}
        <button
          type="submit"
          className="w-full rounded-xl bg-emerald-600 py-3 text-lg font-medium text-white active:bg-emerald-700"
        >
          Enter
        </button>
      </form>
    </div>
  );
}
