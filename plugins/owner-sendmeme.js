import axios from 'axios';

const handler = async (m, { conn }) => {
  try {
    const res = await axios.get('https://g-mini-ia.vercel.app/api/meme');
    const memeUrl = res.data.url;

    if (!memeUrl) {
      return m.reply('❌ No se pudo obtener el meme.');
    }

    await conn.sendMessage('120363400360651198@newsletter', {
      image: { url: memeUrl },
      caption: '「🩵」 *MEME PARA TI*\n\n> Makima Bot MD',
    });

    m.reply('「🩵」 Meme enviado al canal con éxito...');
  } catch (e) {
    console.error(e);
    m.reply('⚠️ Hubo un error al intentar enviar el meme.');
  }
};

handler.command = ['memechannel'];
handler.help = ['tools'];
handler.tags = ['owner'];

export default handler;