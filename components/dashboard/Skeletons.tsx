export function KPICardSkeleton() {
  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton w-8 h-8 rounded-lg" />
      </div>
      <div className="skeleton h-7 w-28 rounded mb-2" />
      <div className="skeleton h-3 w-24 rounded" />
    </div>
  )
}

export function ChartSkeleton({ height = 240 }: { height?: number }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="skeleton h-4 w-36 rounded mb-2" />
          <div className="skeleton h-3 w-20 rounded" />
        </div>
        <div className="skeleton h-4 w-24 rounded" />
      </div>
      <div className="skeleton rounded-lg w-full" style={{ height }} />
    </div>
  )
}

export function CampaignCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 pr-3">
          <div className="skeleton h-4 w-full max-w-[160px] rounded mb-2" />
          <div className="skeleton h-3 w-20 rounded" />
        </div>
        <div className="skeleton h-6 w-16 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white/3 rounded-lg p-2.5">
            <div className="skeleton h-3 w-14 rounded mx-auto mb-1.5" />
            <div className="skeleton h-4 w-10 rounded mx-auto" />
          </div>
        ))}
      </div>
      <div className="border-t border-white/5 pt-3 flex justify-between">
        <div className="skeleton h-4 w-28 rounded" />
        <div className="skeleton h-6 w-12 rounded" />
      </div>
      <div className="mt-3">
        <div className="skeleton h-1.5 w-full rounded-full" />
      </div>
    </div>
  )
}

export function TableRowSkeleton({ cols = 8 }: { cols?: number }) {
  return (
    <tr className="border-b border-white/3">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-3.5">
          <div className={`skeleton h-4 rounded ${i === 0 ? "w-36" : "w-16"}`} />
        </td>
      ))}
    </tr>
  )
}
