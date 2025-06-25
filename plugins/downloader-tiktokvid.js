import fetch from 'node-fetch';

const handler = async (m, { conn, args }) => {
  if (!args[0]) return conn.reply(m.chat, '𖧊 Hola, necesito que me proporciones el nombre del video *Tiktok* que deseas Buscar.', m, rcanal)
  await m.react('🕓')
  try {
    const url = `https://api-pbt.onrender.com/api/download/tiktokQuery?query=${encodeURIComponent(args.join(' '))}&apikey=a7q587awu57`;
    const res = await fetch(url)
    if (!res.ok) {
      throw await res.text()
    }
    
    const json = await res.json()
    const result = json.data
    if (!result || !result.sin_marca_de_agua) {
      await m.react('✖️')
      return
    }
    await conn.sendFile(m.chat, result.sin_marca_de_agua, 'tiktok.mp4', null, m, null, rcanal)
    await m.react('✅')
  } catch {
    await m.react('✖️')
  }
}

handler.help = ['tiktokvid']
handler.tags = ['downloader'];
handler.command = /^(ttvid|tiktokvid)$/i
export default handler
