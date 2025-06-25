import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args || !args[0]) {
    return conn.reply(m.chat, '🚩 Ingresa el enlace del video de *TikTok* junto al comando.\n\n`Ejemplo:`\n' +
      `> *${usedPrefix + command}* https://www.tiktok.com/@user/video/1234567890`, m)
  }

  await m.react('🕓')
  try {
    let res = await fetch(`https://api.sylphy.xyz/download/tiktok?url=${encodeURIComponent(args[0])}`)
    let json = await res.json()

    if (!json || !json.result || !json.result.video) {
      throw '❌ No se pudo obtener el video. Verifica el enlace.'
    }

    let videoUrl = json.result.video
    await conn.sendFile(m.chat, videoUrl, 'tiktok.mp4', m)
    await m.react('✅')
  } catch (e) {
    await m.react('✖️')
    conn.reply(m.chat, '❌ Error al descargar el video. Puede que el enlace no sea válido o la API no esté disponible.', m)
  }
}

handler.help = ['tiktok']
handler.tags = ['downloader'] 
handler.command = /^(tiktok|tt|tiktokdl|ttdl)$/i
export default handler
