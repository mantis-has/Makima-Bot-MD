import fetch from 'node-fetch'

let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`✐ Ejemplo de uso:\n.${command} Autobots transformarse y avanzar`)

  try {
    let res = await fetch(`https://zenzxz.dpdns.org/tools/text2speech?text=${encodeURIComponent(text)}`)
    let json = await res.json()

    // Solo filtrar el modelo deseado
    if (json.model !== 'optimus_prime') return m.reply('No se encontró la voz de Optimus Prime.')

    let audio = await fetch(json.audio_url)
    let buffer = await audio.arrayBuffer()

    await conn.sendMessage(m.chat, {
      audio: Buffer.from(buffer),
      mimetype: 'audio/mpeg',
      ptt: true
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply('✦ Error al generar la voz de Optimus Prime.')
  }
}

handler.help = ['optimus *<texto>*']
handler.tags = ['voz', 'fun']
handler.command = ['tts']
export default handler