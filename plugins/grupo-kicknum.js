let handler = async (m, { conn, args }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo se usa en grupos.')

  const groupMetadata = await conn.groupMetadata(m.chat)
  console.log('🔎 Participantes del grupo:')
  groupMetadata.participants.forEach(p => {
    console.log(`- ${p.id} admin: ${p.admin || 'miembro'}`)
  })

  const userParticipant = groupMetadata.participants.find(p => p.id === m.sender)
  console.log('🔎 Info usuario que manda:', userParticipant)

  const isUserAdmin = userParticipant?.admin === 'admin' || userParticipant?.admin === 'superadmin' || m.sender === groupMetadata.owner
  if (!isUserAdmin) return m.reply('❌ Solo los admins pueden usar este comando.')

  const prefix = args[0]
  if (!prefix || !prefix.startsWith('+')) return m.reply('✳️ Usa el formato:\n.kicknum +212')

  const usersToKick = groupMetadata.participants
    .map(p => p.id)
    .filter(jid => jid.startsWith(prefix.replace('+', '')) && !groupMetadata.participants.find(u => u.id === jid)?.admin)

  if (usersToKick.length === 0) return m.reply(`😌 No encontré usuarios que empiecen con *${prefix}* y no sean admin.`)

  await m.reply(`🚨 Expulsando a *${usersToKick.length}* con prefijo *${prefix}*...`)

  for (let user of usersToKick) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
      console.log(`✅ Expulsado: ${user}`)
    } catch (e) {
      console.log(`❌ No se pudo expulsar a: ${user}`, e)
    }
  }
}

handler.help = ['kicknum +XXX']
handler.tags = ['group']
handler.command = ['kicknum']
handler.group = true

export default handler