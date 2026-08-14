export default function AdminPetOwnerPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pet Owner Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage and review pet owner accounts across the platform</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-[#FF7037] flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Pet Owner (Admin) Section</h3>
          <p className="text-sm text-gray-500 max-w-md">
            This module is connected to the Admin Navigation sidebar (`/admin/pet-owner`).
          </p>
        </div>
      </div>
    </div>
  );
}
