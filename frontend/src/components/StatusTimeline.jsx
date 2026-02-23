import { CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react'
import { STATUS_LABELS, STATUS_COLORS, STATUS_ORDER } from '../constants'
import { formatDistanceToNow } from 'date-fns'

export default function StatusTimeline({ currentStatus, history = [] }) {
  const isTerminal = ['resolved', 'rejected'].includes(currentStatus)
  const isDelayed  = currentStatus === 'delayed'

  const getStepState = (step) => {
    if (currentStatus === 'rejected') return step === 'submitted' ? 'done' : step === 'rejected' ? 'rejected' : 'pending'
    const currentIdx = STATUS_ORDER.indexOf(currentStatus)
    const stepIdx    = STATUS_ORDER.indexOf(step)
    if (stepIdx < currentIdx) return 'done'
    if (stepIdx === currentIdx) return 'active'
    return 'pending'
  }

  const steps = [...STATUS_ORDER, ...(currentStatus === 'rejected' ? ['rejected'] : []),
                 ...(currentStatus === 'resolved' ? [] : [])]

  return (
    <div className="space-y-1">
      {STATUS_ORDER.map((step, i) => {
        const state = getStepState(step)
        const historyEntry = history.filter(h => h.new_status === step).pop()

        return (
          <div key={step} className="flex gap-3">
            {/* Icon */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2
                ${state === 'done'   ? 'bg-green-500 border-green-500 text-white' :
                  state === 'active' ? 'border-blue-500 bg-blue-50 text-blue-600' :
                  state === 'rejected' ? 'bg-red-500 border-red-500 text-white' :
                  'border-gray-200 bg-white text-gray-300'}`}>
                {state === 'done' ? <CheckCircle className="w-4 h-4" /> :
                 state === 'active' ? <Clock className="w-4 h-4" /> :
                 state === 'rejected' ? <XCircle className="w-4 h-4" /> :
                 <div className="w-2 h-2 rounded-full bg-gray-300" />}
              </div>
              {i < STATUS_ORDER.length - 1 && (
                <div className={`w-0.5 h-8 mt-1 ${state === 'done' ? 'bg-green-300' : 'bg-gray-100'}`} />
              )}
            </div>

            {/* Content */}
            <div className="pb-4 flex-1 min-w-0">
              <div className={`text-sm font-medium ${
                state === 'active' ? 'text-blue-700' :
                state === 'done'   ? 'text-green-700' :
                state === 'rejected' ? 'text-red-700' : 'text-gray-400'}`}>
                {STATUS_LABELS[step]}
                {step === currentStatus && isDelayed && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3 h-3" /> SLA Breached
                  </span>
                )}
              </div>
              {historyEntry && (
                <div className="text-xs text-gray-400 mt-0.5">
                  {formatDistanceToNow(new Date(historyEntry.timestamp), { addSuffix: true })}
                  {historyEntry.remark && <span className="ml-2 text-gray-500">— {historyEntry.remark}</span>}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {currentStatus === 'rejected' && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-red-500 border-2 border-red-500 text-white flex items-center justify-center flex-shrink-0">
            <XCircle className="w-4 h-4" />
          </div>
          <div className="pb-4">
            <div className="text-sm font-medium text-red-700">Rejected</div>
            {history.filter(h => h.new_status === 'rejected').map(h => (
              <div key={h.id} className="text-xs text-gray-400 mt-0.5">
                {formatDistanceToNow(new Date(h.timestamp), { addSuffix: true })}
                {h.remark && <span className="ml-2 text-gray-500">— {h.remark}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
