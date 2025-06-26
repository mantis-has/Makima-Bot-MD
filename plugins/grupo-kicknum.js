import fetch from 'node-fetch';
import FormData from 'form-data';

const handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply('📎 Pasa el link del video de Instagram');

  const url = args[0];
  const form = new FormData();
  form.append('q', url);

  try {
    await m.react("⏳");

    const res = await fetch('https://saveig.app/api/ajaxSearch', {
      method: 'POST',
      body: form,
      headers: {
        'x-requested-with': 'XMLHttpRequest'
      }
    });

    const data = await res.json();
    if (!data || !data.data || !data.data.length) return m.reply('❌ No se encontró el video');

    for (let media of data.data) {
      await conn.sendFile(m.chat, media.url, 'ig.mp4', `✅ Aquí tienes tu video`, m);
    }

    await m.react("✅");
  } catch (e) {
    console.log(e);
    await m.reply('⚠️ Error descargando el video.');
    await m.react("❌");
  }
};

handler.command = ['ig', 'instagram'];
handler.help = ['ig <link>'];
handler.tags = ['descargas'];
handler.group = false;

export default handler;