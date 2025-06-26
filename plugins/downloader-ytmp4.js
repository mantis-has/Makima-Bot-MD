import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let url = args[0]
  if (!url || !url.includes('youtube.com') && !url.includes('youtu.be'))
    return m.reply(`✦ Usa el comando así:\n${usedPrefix + command} <enlace de YouTube>\n\nEjemplo:\n${usedPrefix + command} https://youtube.com/watch?v=abc123`)

  try {
    m.react('⏳') // opcional

    const api = `https://theadonix-api.vercel.app/api/ytmp4?url=${encodeURIComponent(url)}`
    const res = await fetch(api)
    const json = await res.json()

    if (json.status !== 200 || !json.result?.video)
      throw new Error('No se pudo obtener el video')

    let result = json.result
    let caption = `🎬 *Título:* ${result.title}\n👤 *Autor:* ${result.author}\n⏱️ *Duración:* ${result.duration}\n📆 *Subido:* ${result.uploadDate}\n👀 *Vistas:* ${result.views}\n\n📥 *Calidad:* ${result.quality}`

    await conn.sendMessage(m.chat, {
      video: { url: result.video },
      caption: caption,
      mimetype: 'video/mp4'
    }, { quoted: m })

  } catch (err) {
    console.error('Error en ytmp4:', err)
    m.reply('❌ Ocurrió un error al descargar el video.\nAsegúrate de que el enlace sea válido.')
  }
}

handler.command = /^ytmp4$/i
handler.help = ['ytmp4 <enlace>']
handler.tags = ['descargas']
handler.register = false // cámbialo a true si querés que solo usuarios registrados usen

export default handler