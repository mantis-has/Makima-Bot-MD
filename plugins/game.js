import fetch from "node-fetch"
import yts from "yt-search"

let handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) {
    return m.reply(`🌐 Ejemplo de uso:\n\n${usedPrefix + command} https://youtu.be/aBfUFr9SBY0`)
  }

  await m.react("🔎")

  const search = await yts(text)
  const video = search?.all?.[0]
  if (!video) return m.reply("❌ No se encontró el video.")

  await m.react("📥")

  const api = `https://theadonix-api.vercel.app/api/ytmp42?url=${encodeURIComponent(video.url)}`
  
  try {
    const res = await fetch(api)
    const json = await res.json()

    if (json?.status !== 200 || !json.result?.video) {
      throw new Error(json?.mensaje || "No se pudo obtener el enlace del video.")
    }

    const { title, video: videoUrl, quality, size } = json.result

    // Mensaje de espera con título
    const caption = `📹 *${title}*\n🎞️ Calidad: ${quality || "Desconocida"}\n📦 Tamaño aprox: ${size || "N/A"}\n\n📽️ Video descargado por *Yuru Yuri* bot.`

    // Intenta enviar como archivo normal
    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        mimetype: 'video/mp4',
        caption: caption,
      },
      { quoted: m }
    )

    await m.react("✅")

  } catch (err) {
    console.error("[play2 error]", err)
    await m.reply(`❌ Error al procesar el video:\n${err.message}`)
    await m.react("❌")
  }
}

handler.command = ['play2']
handler.help = ['play2 <nombre o url>']
handler.tags = ['downloader']

export default handler