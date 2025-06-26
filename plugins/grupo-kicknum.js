const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo funciona en grupos.')
  if (!args[0]) return m.reply(`🔎 Ingresa un prefijo. Ej: ${usedPrefix + command} 504`)
  const prefix = args[0].replace(/[^\d]/g, '')
  if (!prefix) return m.reply('⚠️ Prefijo inválido.')

  await m.reply(`🔍 Analizando miembros del grupo para prefijo +${prefix}...`)

  const groupMetadata = await conn.groupMetadata(m.chat)
  const participants = groupMetadata.participants.map(p => p.id)
  const toKick = []

  for (const id of participants) {
    if (id === conn.user.jid) continue // no se patea el bot

    if (id.endsWith('@lid')) {
      try {
        console.log(`🔁 Intentando resolver ${id}`)
        const resolved = await conn.onWhatsApp(id)
        if (resolved && resolved.length && resolved[0].jid) {
          const realJid = resolved[0].jid
          const realNumber = realJid.split('@')[0]
          console.log(`✅ Coincide lid: ${id} => ${realNumber}`)
          if (realNumber.startsWith(prefix)) {
            toKick.push(realJid)
          }
        } else {
          console.log(`❌ No se pudo resolver jid de ${id}`)
        }
      } catch (e) {
        console.log(`⚠️ Error al resolver ${id}:`, e)
      }
    } else {
      const number = id.split('@')[0]
      if (number.startsWith(prefix)) {
        toKick.push(id)
      }
    }
  }

  if (!toKick.length) return m.reply(`🤷‍♂️ No hay nadie con el prefijo +${prefix} (o están ocultos)`)

  await m.reply(`👢 Expulsando a ${toKick.length} usuario(s) con prefijo +${prefix}...`)

  for (const jid of toKick) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [jid], 'remove')
      await new Promise(res => setTimeout(res, 3000)) // delay entre kicks
    } catch (e) {
      console.log(`⚠️ No se pudo expulsar a ${jid}`, e)
      await m.reply(`❌ No pude expulsar a @${jid.split('@')[0]}. Puede que no tenga permisos.`, null, {
        mentions: [jid]
      })
    }
  }
}

handler.command = ['kicknum']
handler.group = true

export default handler