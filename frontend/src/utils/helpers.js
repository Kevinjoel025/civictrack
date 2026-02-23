import { formatDistanceToNow, isPast } from 'date-fns'
export const STATUS_LABELS = { submitted:'Submitted', assigned:'Assigned', acknowledged:'Acknowledged', in_progress:'In Progress', resolved:'Resolved', rejected:'Rejected', delayed:'Delayed' }
export const ISSUE_TYPES = [
  { value:'pothole', label:'Pothole', icon:'🕳️' },
  { value:'garbage', label:'Garbage', icon:'🗑️' },
  { value:'streetlight', label:'Streetlight', icon:'💡' },
  { value:'drainage', label:'Drainage', icon:'🌊' },
  { value:'other', label:'Other', icon:'📋' },
]
export const STATUS_COLORS = { submitted:'#6B7280', assigned:'#2563EB', acknowledged:'#7C3AED', in_progress:'#D97706', resolved:'#16A34A', rejected:'#DC2626', delayed:'#EA580C' }
export const timeAgo = d => formatDistanceToNow(new Date(d), { addSuffix: true })
export const isSlaBreached = d => d ? isPast(new Date(d)) : false
export const priorityColor = p => ({ low:'text-green-600', medium:'text-yellow-600', high:'text-red-600' })[p] || ''
export const issueIcon = t => ISSUE_TYPES.find(i => i.value === t)?.icon || '📋'