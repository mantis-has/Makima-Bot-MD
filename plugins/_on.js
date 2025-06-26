import fetch from 'node-fetch'

let linkRegex = /chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}/i
let linkRegex1 = /whatsapp\.com\/channel\/[0-9A-Za-z]{20,24}/i
const defaultImage = 'https://qu.ax/eOCUt.jpg'

async function isAdminOrOwner(m, conn) {
  try {
    const metadata = await conn.groupMetadata(m.chat)
    const user = metadata.participants.find(p => p.id === m.sender)
    return user?.admin || m.fromMe
  } catch {
    return false
  }
}

const handler = async (m, { conn, command, args, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 Solo en grupos.')
  global.db.data.chats[m.chat] ??= {}
  const chat = global.db.data.chats[m.chat]
  const type = (args[0] || '').toLowerCase()
  const enable = command === 'on'

  if (!['antilink', 'welcome', 'antiarabe'].includes(type)) {
    return m.reply(`✳️ Usa:\n*.on antilink* / *.off antilink*\n*.on welcome* / *.off welcome*\n*.on antiarabe* / *.off antiarabe*`)
  }

  if (!(isAdmin || isOwner)) return m.reply('❌ Solo admins pueden cambiar esto.')

  chat[type] = enable
  return m.reply(`✅ ${type} ${enable ? 'activado' : 'desactivado'}.`)
}

handler.command = ['on', 'off']
handler.group = true
handler.tags = ['group']
handler.help = ['on/off antilink', 'on/off welcome', 'on/off antiarabe']

handler.before = async (m, { conn }) => {
  if (!m.isGroup) return
  global.db.data.chats[m.chat] ??= {}
  const chat = global.db.data.chats[m.chat]

  // 🚫 Antiarabe
  if (chat.antiarabe && m.messageStubType === 27) {
    const newUser = m.messageStubParameters?.[0]
    if (/^(\+212|\+91|\+92|\+98|\+20|\+234|\+60|\+62|\+971)/.test(newUser)) {
      await conn.sendMessage(m.chat, { text: `🚷 ${newUser} será expulsado por tener número sospechoso.` })
      await conn.groupParticipantsUpdate(m.chat, [newUser], 'remove')
      return true
    }
  }

  // 🚫 Antilink
  if (chat.antilink) {
    const metadata = await conn.groupMetadata(m.chat)
    const user = metadata.participants.find(p => p.id === m.sender)
    const isAdmin = user?.admin
    const text = m.text || ''

    if (!isAdmin && (linkRegex.test(text) || linkRegex1.test(text))) {
      const userTag = `@${m.sender.split('@')[0]}`
      const delet = m.key.participant
      const msgID = m.key.id

      try {
        const groupLink = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`
        if (text.includes(groupLink)) return
      } catch {}

      try {
        await conn.sendMessage(m.chat, {
          text: `🚫 ${userTag}, los links no están permitidos.`,
          mentions: [m.sender]
        }, { quoted: m })

        await conn.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: msgID,
            participant: delet
          }
        })

        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      } catch {
        await conn.sendMessage(m.chat, {
          text: `⚠️ No pude expulsar a ${userTag}.`,
          mentions: [m.sender]
        }, { quoted: m })
      }
      return true
    }
  }

  // 🌸 Welcome & Bye
  if (chat.welcome && [27, 28, 32].includes(m.messageStubType)) {
    const metadata = await conn.groupMetadata(m.chat)
    const groupSize = metadata.participants.length
    const userId = m.messageStubParameters?.[0] || m.sender
    const userTag = `@${userId.split('@')[0]}`
    let profilePic

    try {
      profilePic = await conn.profilePictureUrl(userId, 'image')
    } catch {
      profilePic = defaultImage
    }

    if (m.messageStubType === 27) {
      const bienvenida = `
🌸 𝙱𝙸𝙴𝙽𝚅𝙴𝙽𝙸𝙳@ 🌸

✿ *Bienvenid@* a *${metadata.subject}* 🌺

✰ ${userTag} ¡qué gusto verte por aquí!

✦ Somos *${groupSize}* integrantes 🧑‍🤝‍🧑

> Usa *#help* para comandos 👾
      `.trim()

      await conn.sendMessage(m.chat, {
        image: { url: profilePic },
        caption: bienvenida,
        contextInfo: { mentionedJid: [userId] }
      })
    }

    if ([28, 32].includes(m.messageStubType)) {
      const despedida = `
🌸 𝙰𝙳𝙸Ó𝚂 🌸

✿ *Adiós* de *${metadata.subject}* 🥀

✰ ${userTag} esperamos verte pronto ✨

✦ Somos *${groupSize}*, cuidemos el grupo.

💌 Que tengas buen día 🙌
      `.trim()

      await conn.sendMessage(m.chat, {
        image: { url: profilePic },
        caption: despedida,
        contextInfo: { mentionedJid: [userId] }
      })
    }
  }
}

export default handler