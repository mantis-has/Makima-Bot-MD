import { igdl } from 'ruhend-scraper';

const handler = async (m, { args, conn }) => {
  if (!args[0] || !args[0].includes('instagram.com')) {
    return conn.reply(m.chat, `✍️ Ingresa un enlace válido de Instagram.`, m);
  }

  try {
    await m.react("🕒");
    const res = await igdl(args[0]);
    const data = res.data;

    if (!data || data.length === 0) {
      await m.react("❌");
      return conn.reply(m.chat, '⚠️ No se encontró contenido descargable.', m);
    }

    for (let media of data) {
      await conn.sendFile(m.chat, media.url, 'instagram.mp4', `*Aquí tienes ฅ^•ﻌ•^ฅ.*`, m);
    }

    await m.react("✅");
  } catch (e) {
    console.error('⛔ Error en instagram:', e);
    await m.react("😭");
    return conn.reply(m.chat, `❌ Ocurrió un error al descargar.`, m);
  }
};

handler.command = ['instagram', 'ig'];
handler.tags = ['descargas'];
handler.help = ['instagram <url>', 'ig <url>'];
handler.group = true;

export default handler;