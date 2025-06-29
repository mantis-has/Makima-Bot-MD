import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) return m.reply(`✐ Ingresa un texto para buscar en YouTube\n> *Ejemplo:* ${usedPrefix + command} ozuna`);

  try {
    let api = await (await fetch(`https://delirius-apiofc.vercel.app/search/ytsearch?q=${encodeURIComponent(text)}`)).json();
    if (!api.data || !api.data.length) return m.reply('❌ No se encontraron resultados para tu búsqueda.');

    let results = api.data[0];
    let txt = `*「✦」 ${results.title}*\n\n` +
              `> ✦ *Canal:* ${results.author?.name || 'Desconocido'}\n` +
              `> ⴵ *Duración:* ${results.duration || 'Desconocida'}\n` +
              `> ✰ *Vistas:* ${results.views || 'Desconocidas'}\n` +
              `> ✐ *Publicado:* ${results.publishedAt || 'Desconocida'}\n` +
              `> 🜸 *Link:* ${results.url || 'No disponible'}`;

    let img = results.image || null;
    if (img) {
      await conn.sendMessage(m.chat, { image: { url: img }, caption: txt }, { quoted: m });
    } else {
      await m.reply(txt);
    }

    // Ahora la descarga del audio
    let api2 = await (await fetch(`https://theadonix-api.vercel.app/api/ytmp3?url=${encodeURIComponent(results.url)}`)).json();

    if (!api2.result || !api2.result.download || !api2.result.download.url) {
      return m.reply('❌ No se pudo obtener el audio del video.');
    }

    await conn.sendMessage(m.chat, {
      document: { url: api2.result.download.url },
      mimetype: 'audio/mpeg',
      fileName: `${results.title}.mp3`
    }, { quoted: m });

  } catch (e) {
    m.reply(`❌ Error: ${e.message}`);
    await m.react('✖️');
  }
};

handler.command = ['play'];

export default handler;