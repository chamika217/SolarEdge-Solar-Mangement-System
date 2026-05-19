import { useEffect, useState } from 'react'
import { ClipboardList, CheckCircle, XCircle, Sun, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '@/utils/api'
import { formatDistanceToNow } from 'date-fns'
import { TableRowSkeleton } from '@/components/common/Skeleton'

const ACTION_COLORS = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-solar-100 text-solar-700',
  GET: 'bg-gray-100 text-gray-600'
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const { data } = await api.get(`/audit?limit=15&page=${page}`)
        setLogs(data.logs)
        setTotal(data.total)
        setPages(data.pages)
      } catch {}
      finally { setLoading(false) }
    }
    fetch()
  }, [page])

  const getActionColor = (details = '') => {
    if (details.includes('POST')) return ACTION_COLORS.CREATE
    if (details.includes('PUT')) return ACTION_COLORS.UPDATE
    if (details.includes('DELETE')) return ACTION_COLORS.DELETE
    return ACTION_COLORS.GET
  }

  const getActionLabel = (details = '') => {
    if (details.includes('POST')) return 'CREATE'
    if (details.includes('PUT')) return 'UPDATE'
    if (details.includes('DELETE')) return 'DELETE'
    return 'VIEW'
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total actions recorded</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
          <ClipboardList size={14} />
          All system activities
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
            <tr>
              {['User','Action','Resource','Status','Time'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({length:8}).map((_,i) => <TableRowSkeleton key={i} cols={5} />)
              : logs.length === 0
              ? <tr><td colSpan={5} className="text-center py-12 text-gray-400">No audit logs yet</td></tr>
              : logs.map(log => (
                <tr key={log._id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-solar-100 rounded-full flex items-center justify-center text-solar-700 text-xs font-bold">
                        {log.userName?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-gray-800 dark:text-gray-200">{log.userName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getActionColor(log.details)}`}>
                      {getActionLabel(log.details)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400 font-mono max-w-[200px] truncate">{log.details}</td>
                  <td className="px-5 py-3.5">
                    {log.status === 'success'
                      ? <CheckCircle size={15} className="text-green-500" />
                      : <XCircle size={15} className="text-red-500" />
                    }
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</td>
                </tr>
              ))
            }
          </tbody>
        </table>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <button disabled={page===1} onClick={() => setPage(p=>p-1)}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                <ChevronLeft size={14} />
              </button>
              <button disabled={page===pages} onClick={() => setPage(p=>p+1)}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
