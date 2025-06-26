import fetch from 'node-fetch'

const linkRegex = /chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}/i
const linkRegex1 = /whatsapp\.com\/channel\/[0-9A-Za-z]{20,24}/i
const defaultImage = 'https://qu.ax/eOCUt.jpg'

const handler = async (m, { conn, command, args, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 Solo funciona en grupos.')

  const chat = global.db.data.chats[m.chat] ??= {}
  const type = (args[0] || '').toLowerCase()
  const enable = command === 'on'

  if (!['antilink', 'welcome', 'antiarabe'].includes(type)) {
    return m.reply(`✳️ Usa:\n*.on antilink* / *.off antilink*\n*.on welcome* / *.off welcome*\n*.on antiarabe* / *.off antiarabe*`)
  }

  if (!(isAdmin || isOwner)) return m.reply('❌ Solo admins pueden cambiar la configuración.')

  if (type === 'antilink') {
    chat.antilink = enable
    return m.reply(`✅ Antilink ${enable ? 'activado' : 'desactivado'}.`)
  }

  if (type === 'welcome') {
    chat.welcome = enable
    return m.reply(`✅ Welcome ${enable ? 'activado' : 'desactivado'}.`)
  }

  if (type === 'antiarabe') {
    chat.antiarabe = enable
    return m.reply(`✅ Antiarabe ${enable ? 'activado' : 'desactivado'}.`)
  }
}

handler.command = ['on', 'off']
handler.group = true
handler.tags = ['group']
handler.help = ['on welcome', 'off welcome', 'on antilink', 'off antilink', 'on antiarabe', 'off antiarabe']

handler.before = async (m, { conn }) => {
  if (!m.isGroup) return
  const chat = global.db.data.chats[m.chat] ??= {}

  // Antiarabe (cuando entra alguien)
  if (chat.antiarabe && m.messageStubType === 27) {
    const newJid = m.messageStubParameters?.[0]
    if (/^\+?(212|91|92|98|20|234|60|62|971)/.test(newJid)) {
      await conn.sendMessage(m.chat, {
        text: `⚠️ Número sospechoso detectado: ${newJid}\nSerá eliminado del grupo.`
      })
      await conn.groupParticipantsUpdate(m.chat, [newJid], 'remove')
      return
    }
  }

  // Antilink
  if (chat.antilink) {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const isUserAdmin = groupMetadata.participants.find(p => p.id === m.sender)?.admin

    const text = m?.text || ''
    if (!isUserAdmin && (linkRegex.test(text) || linkRegex1.test(text))) {
      const userTag = `@${m.sender.split('@')[0]}`

      try {
        const ownGroupLink = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`
        if (text.includes(ownGroupLink)) return
      } catch {}

      await conn.sendMessage(m.chat, {
        text: `🚫 ${userTag}, los enlaces no están permitidos aquí.`,
        mentions: [m.sender]
      }, { quoted: m })

      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {
        conn.sendMessage(m.chat, {
          text: `⚠️ No pude expulsar a ${userTag}. Verifica si tengo permisos.`,
          mentions: [m.sender]
        }, { quoted: m })
      })
      return
    }
  }

  // Welcome & Bye
  if (chat.welcome && [27, 28, 32].includes(m.messageStubType)) {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const groupSize = groupMetadata.participants.length
    const userId = m.messageStubParameters?.[0] || m.sender
    const userMention = `@${userId.split('@')[0]}`
    let profilePic

    try {
      profilePic = await conn.profilePictureUrl(userId, 'image')
    } catch {
      profilePic = defaultImage
    }

    if (m.messageStubType === 27) {
      const caption = `🌸 𝙱𝙸𝙴𝙽𝚅𝙴𝙽𝙸𝙳@ 🌸\n\n✿ *Bienvenid@* a *${groupMetadata.subject}* 🌺\n✰ ${userMention} ¡qué gusto verte por aquí!\n\n✦ Ahora somos *${groupSize}* miembros.\n🐾 Disfrutá y compartí lo que quieras.\n\n> Usa *#help* para ver los comandos 👾`

      await conn.sendMessage(m.chat, {
        image: { url: profilePic },
        caption,
        contextInfo: { mentionedJid: [userId] }
      })
    }

    if (m.messageStubType === 28 || m.messageStubType === 32) {
      const caption = `🌸 𝙰𝙳𝙸Ó𝚂 🌸\n\n✿ *${userMention}* salió del grupo *${groupMetadata.subject}* 🥀\n✦ Ahora somos *${groupSize}* miembros.\n💌 ¡Te esperamos pronto de vuelta!\n\n> Usa *#help* si quieres volver 🙌`

      await conn.sendMessage(m.chat, {
        image: { url: profilePic },
        caption,
        contextInfo: { mentionedJid: [userId] }
      })
    }
  }
}

export default handler