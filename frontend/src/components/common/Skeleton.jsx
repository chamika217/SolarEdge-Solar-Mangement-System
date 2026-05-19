// Reusable Skeleton Loading Components
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
)

export const MetricCardSkeleton = () => (
  <div className="card p-5">
    <Skeleton className="h-4 w-24 mb-3" />
    <Skeleton className="h-8 w-32 mb-2" />
    <Skeleton className="h-3 w-20" />
  </div>
)

export const ChartSkeleton = ({ height = 200 }) => (
  <div className="card p-5">
    <Skeleton className="h-4 w-40 mb-1" />
    <Skeleton className="h-3 w-28 mb-4" />
    <div className="animate-pulse" style={{ height }}>
      <div className="h-full bg-gray-100 rounded-lg flex items-end gap-2 px-4 pb-4">
        {[60,80,45,90,70,85,55,75,65,88,72,60].map((h,i) => (
          <div key={i} className="flex-1 bg-gray-200 rounded-t" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  </div>
)

export const PanelCardSkeleton = () => (
  <div className="card p-5">
    <div className="flex justify-between mb-3">
      <div><Skeleton className="h-4 w-32 mb-1" /><Skeleton className="h-3 w-20" /></div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <Skeleton className="h-1.5 w-full mb-3" />
    <div className="grid grid-cols-2 gap-2">
      {[1,2,3,4].map(i => <div key={i} className="bg-gray-50 rounded-lg p-2.5"><Skeleton className="h-3 w-12 mb-2" /><Skeleton className="h-4 w-16" /></div>)}
    </div>
  </div>
)

export const TableRowSkeleton = ({ cols = 4 }) => (
  <tr className="border-b border-gray-50">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-5 py-4"><Skeleton className="h-4 w-full max-w-[120px]" /></td>
    ))}
  </tr>
)

export const AlertSkeleton = () => (
  <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
    <Skeleton className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  </div>
)

export default Skeleton
