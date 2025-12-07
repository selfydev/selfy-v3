export default function DashboardHeader() {
  return (
    <header className="flex h-16 items-center border-b border-neutral-200 bg-white px-6">
      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-900">Dashboard</h1>
        <div className="flex items-center gap-4">
          <button className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500">
            New Item
          </button>
        </div>
      </div>
    </header>
  );
}
