import { checkHealth, getUsers } from "@/lib/api";

export default async function Home() {
  let health = null;
  let users = [];
  let error = null;

  try {
    health = await checkHealth();
    users = await getUsers();
  } catch (err) {
    error = err instanceof Error ? err.message : "Something went wrong";
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-label text-primary">Pet Sitter</p>
        <h1>API Connection</h1>
        <p className="text-caption">
          Frontend connected to{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-700">
            {process.env.NEXT_PUBLIC_API_URL ?? "(missing NEXT_PUBLIC_API_URL)"}
          </code>
        </p>
      </header>

      {error ? (
        <section className="card border-red/30 p-6">
          <h2 className="text-h4 text-red">Connection failed</h2>
          <p className="mt-2 text-caption text-gray-700">{error}</p>
          <p className="mt-4 text-caption">
            Tip: Render Free tier may take ~30s to wake up. Retry after a
            moment.
          </p>
        </section>
      ) : (
        <>
          <section className="card p-6">
            <h2 className="text-h4">Health</h2>
            <p className="mt-2 text-green">{health?.message}</p>
            <p className="mt-1 text-caption">status: {health?.status}</p>
          </section>

          <section className="card p-6">
            <h2 className="text-h4">Users ({users.length})</h2>
            {users.length === 0 ? (
              <p className="mt-2 text-caption">No users returned.</p>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {users.map((user) => (
                  <li
                    key={user.id}
                    className="flex flex-col gap-1 rounded-lg border border-border bg-gray-50 px-4 py-3"
                  >
                    <span className="font-semibold text-foreground">
                      {user.name || "(no name)"}
                    </span>
                    <span className="text-caption">{user.email}</span>
                    <span className="text-label text-muted">
                      role: {user.role ?? "-"} · phone: {user.phone ?? "-"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
