import fetch from "node-fetch"
import yts from "yt-search"


const rcanal = {
  contextInfo: {
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: idcanal,
      serverMessageId: 100,
      newsletterName: namecanal,
    }
  }
}

const sanitizeFilename = (name) => {
  return name
    .replace(/[\\\/:*?"<>|]/g, '')
    .replace(/[^a-zA-Z0-9\s\-_\.]/g, '')
    .substring(0, 64)
    .trim()
}

const handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`📌 Usa el comando así:\n${command} Believer`, null, rcanal)

  await m.react('🕒')
  console.log("🔍 Buscando video...")

  try {
    const search = await yts(text)
    const video = search?.videos?.[0]
    if (!video) return m.reply("❌ No encontré resultados", null, rcanal)

    const { title, timestamp, views, author, thumbnail, url } = video
    const caption = `「☁︎」 *${title}*\n\n☄︎ Duración: ${timestamp}\n➩ Canal: ${author.name}\n✐ Vistas: ${views}\n\n✿ Descargando...`

    try {
      await conn.sendFile(m.chat, thumbnail, 'yt.jpg', caption, m, false, rcanal)
    } catch {
      await m.reply(caption, null, rcanal)
    }

    const api = `https://theadonix-api.vercel.app/api/ytmp4?url=${encodeURIComponent(url)}`
    const res = await fetch(api)
    const json = await res.json()

    if (json?.status !== 200 || !json.result?.video) {
      throw new Error(json?.mensaje || 'No se pudo obtener el video')
    }

    const { video: videoUrl, title: vtitle, filename, quality, size } = json.result

    const info = `✧ *${vtitle}*`

    await conn.sendMessage(m.chat, { react: { text: '🕐', key: m.key } })
    await conn.sendFile(m.chat, videoUrl, sanitizeFilename(filename || vtitle) + '.mp4', info, m, {
      mimetype: 'video/mp4',
      asDocument: false
    })

    await m.react('✅')
    console.log('✅ Video enviado con éxito')

  } catch (e) {
    console.error('❌ Error:', e)
    await m.reply(`❌ Error al descargar:\n\n${e.message}`, null, rcanal)
    await m.react('❌')
  }
}

handler.command = handler.help = ['play2', 'mp4', 'ytv']
handler.tags = ['downloader']

export default handler
