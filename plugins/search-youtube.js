import axios from 'axios'
import fs from 'fs'

let handler = async (m, { conn, usedPrefix, text, command }) => {
  if (!text) return conn.reply(m.chat, `
✲ Hola, por favor proporciona el nombre del video de YouTube que deseas buscar. ✥

Ejemplo:
${usedPrefix + command} canción relajante
`.trim(), m, rcanal)

  await m.react('🕒')

  const imgPath = './storage/img/menu.jpg'

  try {
    const { data } = await axios.get(`https://api.starlights.uk/api/search/youtube?q=${encodeURIComponent(text)}`)
    const results = data?.result || []

    if (!results.length) {
      await conn.reply(m.chat, '❁ No encontré resultados para esa búsqueda, intenta con otro término.', m, rcanal)
      await m.react('✖️')
      return
    }

    let textMsg = `✸ ✢ ✹ *Resultados de búsqueda para:* ✥ ${text} ✹ ✢ ✸\n\n`

    results.slice(0, 15).forEach((video, i) => {
      textMsg += `❀ *${i + 1}.* ❁ ${video.title || 'Sin título'}\n`
      textMsg += `✥ Duración: ${video.duration || 'Desconocida'}\n`
      textMsg += `✢ Canal: ${video.uploader || 'Desconocido'}\n`
      textMsg += `✲ URL: ${video.link}\n\n`
    })

    textMsg += `> ❀ Results By YuruYuri\n`

    const isUrl = /^https?:\/\//.test(imgPath)
    const messagePayload = isUrl ? { image: { url: imgPath } } : { image: fs.readFileSync(imgPath) }

    await conn.sendMessage(m.chat, {
      ...messagePayload,
      caption: textMsg.trim(),
      mentionedJid: conn.parseMention(textMsg),
      ...rcanal
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, '✢ Hubo un error buscando en YouTube, intenta nuevamente más tarde.', m, rcanal)
    await m.react('✖️')
  }
}

handler.tags = ['search']
handler.help = ['yts']
handler.command = ['youtubesearch', 'youtubes', 'yts']

export default handler