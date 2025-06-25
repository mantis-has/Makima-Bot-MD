import yts from "yt-search"
import { ytv, yta } from "./_dl.js"

const limit = 100 // MB

const handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply("> Ingresa el nombre de un video o una URL de YouTube.")

  await m.react("🕛")
  console.log("💎 Buscando en YouTube...")

  try {
    let res = await yts(text)

    if (!res || !res.all || !Array.isArray(res.all) || res.all.length === 0) {
      return m.reply("🌻 No se encontraron resultados para tu búsqueda.")
    }

    let video = res.all[0]

    if (!video) {
      return m.reply("❌ No se pudo obtener información del video.")
    }

    const durationTimestamp = video.duration?.timestamp || "Desconocida"
    const authorName = video.author?.name || "Desconocido"
    const title = video.title || "Sin título"
    const views = video.views || "Desconocidas"
    const thumbnail = video.thumbnail || ""

    const processingMessage = `*「✦」${title}*
> *❀ Canal:* ${authorName}
> *✐ Duración:* ${durationTimestamp}
> *☄︎ Vistas:* ${views}

✿ Aguarde, unos segundos...`

    let sentMessage
    if (thumbnail) {
      try {
        sentMessage = await conn.sendFile(m.chat, thumbnail, "thumb.jpg", processingMessage, m)
      } catch {
        sentMessage = await m.reply(processingMessage)
      }
    } else {
      sentMessage = await m.reply(processingMessage)
    }

    if (command === "play" || command === "playaudio" || command === "ytmp3") {
      await downloadAudio(conn, m, video, title)
    } else if (command === "play2" || command === "playvid" || command === "ytv" || command === "ytmp4") {
      await downloadVideo(conn, m, video, title)
    }

  } catch (error) {
    console.error("❌ Error general:", error)
    await m.reply(`❌ Hubo un error al procesar tu solicitud:\n\n${error.message}`)
    await m.react("❌")
  }
}

// 🔊 Audio rápido como nota de voz
const downloadAudio = async (conn, m, video, title) => {
  try {
    console.log("✦ Solicitando audio rápido...")
    const api = await yta(video.url)

    if (!api?.result?.download) throw new Error("No se pudo obtener el audio")

    console.log("🚀 Enviando audio súper rápido...")

    await conn.sendMessage(m.chat, {
      audio: { url: api.result.download },
      mimetype: 'audio/mpeg',
      ptt: true,
      fileName: `${(api.result.title || title).replace(/[^\w\s]/gi, '')}.mp3`,
    }, { quoted: m })

    await m.react("✅")
    console.log("✅ Audio rápido enviado")
  } catch (error) {
    console.error("❌ Error enviando audio:", error)
    await m.reply(`❌ Error al enviar el audio:\n\n${error.message}`)
    await m.react("❌")
  }
}

// 🎥 Video con validación de peso
const downloadVideo = async (conn, m, video, title) => {
  try {
    console.log("❀ Solicitando video...")
    const api = await ytv(video.url)

    if (!api || !api.url) throw new Error("No se pudo obtener el enlace del video")

    let sizemb = 0
    try {
      const res = await fetch(api.url, { method: 'HEAD' })
      const cont = res.headers.get('content-length')
      if (cont) {
        sizemb = parseInt(cont, 10) / (1024 * 1024)
      }
    } catch (e) {
      console.log("⚠ No se pudo obtener el tamaño del archivo:", e.message)
    }

    if (sizemb > limit && sizemb > 0) {
      return m.reply(`✤ El archivo es muy pesado (${sizemb.toFixed(2)} MB). El límite es ${limit} MB. Intenta con un video más corto.`)
    }

    const doc = sizemb >= limit && sizemb > 0

    console.log("✧ Enviando video...")

    await conn.sendFile(
      m.chat,
      api.url,
      `${(api.title || title).replace(/[^\w\s]/gi, '')}.mp4`,
      `✦ *${api.title || title}*`,
      m,
      null,
      {
        asDocument: doc,
        mimetype: "video/mp4",
      }
    )

    await m.react("✅")
    console.log("✅ Video enviado exitosamente")

  } catch (error) {
    console.error("❌ Error descargando video:", error)
    await m.reply(`❌ Error al descargar el video:\n\n${error.message}`)
    await m.react("❌")
  }
}

handler.command = handler.help = ['play', 'playaudio', 'ytmp3', 'play2', 'ytv', 'ytmp4']
handler.tags = ['downloader']

export default handler