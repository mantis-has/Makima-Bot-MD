import { sticker } from '../lib/sticker.js'
import axios from 'axios'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  let text = args.length ? args.join(' ') : m.quoted?.text
  if (!text) return conn.reply(m.chat, `❀ Ingresa o responde un texto para hacer el sticker.`, m)

  const mentionedUser = m.quoted ? m.quoted.sender : m.sender
  const pp = await conn.profilePictureUrl(mentionedUser).catch(_ => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')
  const nombre = await conn.getName(mentionedUser)

  const mentionRegex = new RegExp(`@${mentionedUser.split('@')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'g')
  const mishi = text.replace(mentionRegex, '').trim()

  if (!mishi) return conn.reply(m.chat, `✧ El texto no puede estar vacío.`, m)
  if (mishi.length > 30) return conn.reply(m.chat, `✧ Máximo 30 caracteres.`, m)

  const obj = {
    type: "quote",
    format: "png",
    backgroundColor: "#000000",
    width: 512,
    height: 768,
    scale: 2,
    messages: [{
      entities: [],
      avatar: true,
      from: {
        id: 1,
        name: nombre,
        photo: { url: pp }
      },
      text: mishi,
      replyMessage: {}
    }]
  }

  const res = await axios.post('https://bot.lyo.su/quote/generate', obj, { headers: { 'Content-Type': 'application/json' } })
  const imgBase64 = res?.data?.result?.image
  if (!imgBase64) return conn.reply(m.chat, `❎ No se pudo generar el sticker.`, m)

  const buffer = Buffer.from(imgBase64, 'base64')
  const userId = m.sender
  const packData = global.db.data.users[userId] || {}
  const texto1 = packData.text1 || global.packsticker
  const texto2 = packData.text2 || global.packsticker2

  const stiker = await sticker(buffer, false, texto1, texto2)
  if (stiker) return conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
}

handler.help = ['qc']
handler.tags = ['sticker']
handler.command = ['qc']
handler.group = true

export default handler