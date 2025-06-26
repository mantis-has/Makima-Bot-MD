let handler = async (m, { conn, args, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🚫 Este comando solo sirve en grupos.')
  if (!isAdmin) return m.reply('❌ Solo los admins pueden usar este comando.')
  
  const prefix = args[0]
  if (!prefix || !prefix.startsWith('+')) return m.reply('✳️ Usa el formato:\n.kicknum +54')

  const groupMetadata = await conn.groupMetadata(m.chat)
  const participants = groupMetadata.participants

  let usersToKick = participants
    .map(p => p.id)
    .filter(jid => jid.startsWith(prefix.replace('+', '')))

  if (usersToKick.length === 0) return m.reply('😌 No encontré a nadie con ese prefijo.')

  m.reply(`🚨 Eliminando a ${usersToKick.length} usuarios con número que empieza con *${prefix}*...`)

  for (let user of usersToKick) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
    } catch (e) {
      console.log(`❌ No se pudo eliminar a: ${user}`, e)
    }
  }
}

handler.command = ['kicknum']
handler.group = true
handler.admin = false

export default handler