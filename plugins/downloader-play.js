import fetch from "node-fetch"
import yts from "yt-search"

const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/
const limit = 100 // MB máximo permitido

// Canal (personalizalo si querés)
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
  if (!text) return m.reply(`*🌐 Ejemplo de uso:*\n\n${command} Rick Astley`, null, rcanal)

  await m.react("🕒")
  console.log("💎 Buscando en YouTube...")

  try {
    const res = await yts(text)
    if (!res?.all?.length) return m.reply("🌻 No se encontraron resultados para tu búsqueda.", null, rcanal)

    const video = res.all[0]
    if (!video) return m.reply("❌ No se pudo obtener información del video.", null, rcanal)

    const { title, author, duration, views, thumbnail } = video
    const durationTimestamp = duration?.timestamp || "Desconocida"
    const authorName = author?.name || "Desconocido"

    const msg = `「✦」${title}\n\n❀ Canal: ${authorName}\n✐ Duración: ${durationTimestamp}\n☄︎ Vistas: ${views || 'N/A'}\n\n✿ Aguarde, unos segundos..`

    try {
      await conn.sendFile(m.chat, thumbnail, "thumb.jpg", msg, m, false, rcanal)
    } catch {
      await m.reply(msg, null, rcanal)
    }

    if (["play", "playaudio", "ytmp3"].includes(command)) {
      await downloadAudio(conn, m, video, title)
    } else if (["play2", "mp4", "ytv", "ytmp4"].includes(command)) {
      await downloadVideo(conn, m, video, title)
    }

  } catch (error) {
    console.error("❌ Error general:", error)
    await m.reply(`❌ Hubo un error:\n\n${error.message}`, null, rcanal)
    await m.react("❌")
  }
}

// AUDIO con nueva API Stellar
const downloadAudio = async (conn, m, video, title) => {
  try {
    console.log("✦ Solicitando audio...")

    const res = await fetch(`https://theadonix-api.vercel.app/api/ytmp3?url=${encodeURIComponent(video.url)}`)
    const json = await res.json()

    if (json.status !== 200 || !json.result?.audio) throw new Error("No se pudo obtener el audio")

    const { audio, filename } = json.result
    const safeName = sanitizeFilename(filename || title)

    await conn.sendFile(
      m.chat,
      audio,
      safeName,
      null,
      m,
      { mimetype: 'audio/mpeg', ptt: true }
    )

    await m.react("✅")
    console.log("✅ Audio enviado con éxito")

  } catch (error) {
    console.error("❌ Error descargando audio:", error)
    await m.reply(`❌ Error al descargar el audio:\n\n${error.message}`, null, rcanal)
    await m.react("❌")
  }
}

// VIDEO (sin cambios)
const downloadVideo = async (conn, m, video, title) => {
  try {
    const api = `https://theadonix-api.vercel.app/api/ytmp42?url=${encodeURIComponent(video.url)}`
    const res = await fetch(api)
    const json = await res.json()

    if (json?.status !== 200) throw new Error(json?.mensaje || 'No se pudo obtener el video')

    const { title: videoTitle, video: videoUrl, filename, quality, size } = json.result

    await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } })

    const caption = `📹 *${videoTitle}*\n🎞️ Calidad: ${quality || 'Desconocida'}\n📦 Tamaño aprox: ${size || 'Desconocido'}\n\n📽️`

    await conn.sendFile(m.chat, videoUrl, filename, caption, m, {
      mimetype: 'video/mp4',
      asDocument: false
    })

    await m.react("✅")
    console.log("✅ Video enviado con éxito")

  } catch (error) {
    console.error("❌ Error descargando video:", error)
    await m.reply(`❌ Error al descargar el video:\n\n${error.message}`, null, rcanal)
    await m.react("❌")
  }
}

handler.command = handler.help = ['play', 'playaudio', 'ytmp3']
handler.tags = ['downloader']

export default handler