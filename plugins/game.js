import fetch from "node-fetch"
import yts from "yt-search"

let handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) return m.reply(`*🌐 Ejemplo de uso:*\n\n${usedPrefix + command} https://youtu.be/aBfUFr9SBY0`)

  await m.react("🔎")

  const res = await yts(text)
  const video = res?.all?.[0]
  if (!video) return m.reply("❌ No se encontró el video.")

  await m.react("📥")

  const api = `https://theadonix-api.vercel.app/api/ytmp42?url=${encodeURIComponent(video.url)}`

  try {
    const r = await fetch(api)
    const json = await r.json()

    if (json?.status !== 200 || !json.result?.video) {
      throw new Error(json?.mensaje || "No se pudo descargar el video.")
    }

    const { title, video: videoUrl, quality, size } = json.result

    // 🔒 NO usar emojis ni caracteres raros en el nombre del archivo
    const cleanTitle = title.replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 50)
    const caption = `📹 *${title}*\n🎞️ Calidad: ${quality || "Desconocida"}\n📦 Tamaño aprox: ${size || "N/A"}`

    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption,
      mimetype: 'video/mp4'
    }, { quoted: m })

    await m.react("✅")
    console.log("✅ Video enviado correctamente")

  } catch (e) {
    console.error("[play2]", e)
    await m.reply(`❌ Error al procesar el video:\n${e.message}`)
    await m.react("❌")
  }
}

handler.command = ['play2']
handler.help = ['play2 <nombre o url>']
handler.tags = ['downloader']

export default handler