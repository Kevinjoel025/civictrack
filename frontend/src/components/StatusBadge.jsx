import { STATUS_LABELS } from '../utils/helpers'
const classMap = { submitted:'bg-gray-100 text-gray-700', assigned:'bg-blue-100 text-blue-700', acknowledged:'bg-purple-100 text-purple-700', in_progress:'bg-yellow-100 text-yellow-700', resolved:'bg-green-100 text-green-700', rejected:'bg-red-100 text-red-700', delayed:'bg-orange-100 text-orange-700' }
export default function StatusBadge({ status }) {
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classMap[status] || 'bg-gray-100 text-gray-700'}`}>{STATUS_LABELS[status] || status}</span>
}