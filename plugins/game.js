import ytSearch from 'yt-search'
import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`*🔎 Uso correcto:*\n\n${usedPrefix + command} nombre de la canción`)

  try {
    await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

    // Buscar con yt-search local
    const searchResult = await ytSearch(text)
    const video = searchResult.videos.length > 0 ? searchResult.videos[0] : null

    if (!video) return m.reply('❌ No encontré ningún video con ese nombre')

    // Descargar con tu API
    const videoUrl = video.url

    const apiURL = `https://theadonix-api.vercel.app/api/ytmp4?url=${encodeURIComponent(videoUrl)}`
    const apiRes = await fetch(apiURL)
    const apiJson = await apiRes.json()

    if (apiJson?.status !== 200 || !apiJson?.result) {
      return m.reply(`❌ Error al procesar el video\n${apiJson?.mensaje || 'Prueba con otro nombre'}`)
    }

    const { title, video: videoFile, filename, quality, size } = apiJson.result

    await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } })

    await conn.sendFile(m.chat, videoFile, filename, `🎵 *${title}*\n📼 Calidad: ${quality}\n📦 Tamaño aprox: ${size}`, m)

  } catch (e) {
    console.error('[play2]', e)
    m.reply(`❌ Error al buscar o descargar\n\n${e.message}`)
  }
}

handler.help = ['play2 <nombre>']
handler.tags = ['downloader']
handler.command = ['play2']

export default handler