import ytSearch from 'yt-search'
import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`*🧩 Uso correcto:*\n\n${usedPrefix + command} nombre de la canción o video`)

  try {
    await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

    const searchResult = await ytSearch(text)
    const video = searchResult.videos.length > 0 ? searchResult.videos[0] : null

    if (!video) return m.reply('❌ No encontré ningún video con ese nombre')

    // Aquí usamos la URL corta tipo https://youtu.be/VIDEOID para evitar rollos con la API
    const cleanUrl = `https://youtu.be/${video.videoId}`

    const api = `https://theadonix-api.vercel.app/api/ytmp4?url=${encodeURIComponent(cleanUrl)}`

    const res = await fetch(api)
    const json = await res.json()

    if (json?.status !== 200 || !json?.result) {
      return m.reply(`❌ Error al procesar el video\n${json?.mensaje || 'Prueba con otro nombre'}`)
    }

    const { title, video: videoFile, filename, quality, size } = json.result

    await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } })

    await conn.sendFile(m.chat, videoFile, filename, `✧ *${title}*\n❀ Calidad: ${quality}\n✐ Tamaño aprox: ${size}`, m)

  } catch (e) {
    console.error('[play2]', e)
    m.reply(`❌ Error al buscar o descargar\n\n${e.message}`)
  }
}

handler.help = ['play2 <nombre>']
handler.tags = ['downloader']
handler.command = ['play2']

export default handler