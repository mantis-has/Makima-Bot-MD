import axios from 'axios'

let handler = async (m, { conn, usedPrefix, command, text, args }) => {
  if (!text) return conn.reply(m.chat, `𖧊 Hola, necesito que me proporciones el nombre del video *Tiktok* que deseas Buscar.`, m, rcanal)

  await m.react('🕓')
  let img = `./storage/img/menu.jpg`

  try {
    // Llamada a la API externa de búsqueda de TikTok
    const { data } = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(text)}`)

    const results = data?.data || []

    if (results.length > 0) {
      let txt = `「 *• Searchs* 」`

      for (let i = 0; i < (results.length >= 15 ? 15 : results.length); i++) {
        const video = results[i]
        txt += `\n\n`
        txt += `*◦Nro →* ${i + 1}\n`
        txt += `*◦Título →* ${video.title || 'Sin título'}\n`
        txt += `*◦Url →* ${video.url}`
      }

      await conn.sendFile(m.chat, img, 'thumbnail.jpg', txt, m, null, rcanal)
      await m.react('✅')
    } else {
      await conn.react('✖️')
    }
  } catch {
    await m.react('✖️')
  }
}

handler.tags = ['search']
handler.help = ['tiktoksearch']
handler.command = ['tiktoksearch', 'tiktoks', 'tts']

export default handler
