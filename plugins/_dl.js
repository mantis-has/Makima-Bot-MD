let handler = async (m, { conn }) => {
  // Lista de frases random
  let frases = [
    '✦ La vida es un viaje, disfruta cada paso.',
    '❀ No dejes para mañana lo que puedes hacer hoy.',
    '✧ Sonríe, que la vida es corta y dulce.',
    '✿ Cada día es una nueva oportunidad.',
    '❏ Sigue tus sueños con valentía.',
    '☁︎ A veces, la calma es la respuesta.',
    '✐ Nunca subestimes el poder de una palabra amable.',
    '✦ Lo mejor está por venir, confía.',
  ];

  // Elegir frase random
  let fraseRandom = frases[Math.floor(Math.random() * frases.length)];

  // Enlace del grupo (invisible pero funciona con el botón)
  let inviteLink = 'https://chat.whatsapp.com/If3WAOMJqZp2WLqDp9n4Cw?mode=r_t';

  // Botones con solo el botón de unirse al grupo (url button)
  let buttons = [
    {
      urlButton: {
        displayText: '✧ Unirme al grupo',
        url: inviteLink
      }
    }
  ];

  // Enviar mensaje con frase y botón
  await conn.sendMessage(m.chat, {
    text: fraseRandom,
    footer: 'YuruYuri Bot',
    templateButtons: buttons,
    headerType: 1
  }, { quoted: m });
};

handler.command = ['frasegrupo', 'frasebot'];

export default handler;