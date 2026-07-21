export default async function Login({ searchParams }: { searchParams: Promise<{ bad?: string }> }) {
  const { bad } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <form
        method="POST"
        action="/api/login"
        className="w-full max-w-xs rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
      >
        <h1 className="font-serif text-3xl">Pulse</h1>
        <p className="mt-1 text-sm text-slate-400">Noel&rsquo;s site analytics.</p>
        <input
          type="password"
          name="pass"
          placeholder="Password"
          autoFocus
          className="mt-5 w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-sky-500"
        />
        {bad && <p className="mt-2 text-xs text-rose-400">Wrong password.</p>}
        <button className="mt-4 w-full rounded-xl bg-sky-600 py-2.5 text-sm font-medium text-white hover:bg-sky-500">
          Open dashboard
        </button>
      </form>
    </main>
  );
}
