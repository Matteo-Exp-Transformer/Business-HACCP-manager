import { supabase } from './supabase.js'

export const subscribeToTableChanges = ({
  schema = 'public',
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete,
}) => {
  const channel = supabase.channel(
    `realtime:${schema}:${table}:${Math.random().toString(36).slice(2)}`
  )

  const where = typeof filter === 'string' ? filter : undefined

  if (onInsert) {
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema, table, filter: where },
      payload => onInsert(payload.new, payload)
    )
  }

  if (onUpdate) {
    channel.on(
      'postgres_changes',
      { event: 'UPDATE', schema, table, filter: where },
      payload => onUpdate(payload.new, payload.old, payload)
    )
  }

  if (onDelete) {
    channel.on(
      'postgres_changes',
      { event: 'DELETE', schema, table, filter: where },
      payload => onDelete(payload.old, payload)
    )
  }

  channel.subscribe()

  const unsubscribe = async () => {
    await supabase.removeChannel(channel)
  }

  return { channel, unsubscribe }
}

