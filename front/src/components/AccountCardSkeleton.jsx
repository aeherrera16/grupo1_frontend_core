export function AccountCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md border-l-4 border-banker-blue p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-6 bg-gray-300 rounded w-32"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="h-3 bg-gray-200 rounded w-12 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-20"></div>
        </div>
        <div>
          <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-24"></div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="h-3 bg-gray-200 rounded w-16 mb-3"></div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-300 rounded w-32"></div>
          </div>
          <div className="bg-gray-100 rounded-lg p-3">
            <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-300 rounded w-40"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
