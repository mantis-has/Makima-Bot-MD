let linkRegex = /chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}/i;
let linkRegex1 = /whatsapp\.com\/channel\/[0-9A-Za-z]{20,24}/i;

const handler = async (m, { conn, command, args, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 Solo funciona en grupos.');
  if (!(isAdmin || isOwner)) return m.reply('❌ Solo admins pueden usar este comando.');

  const chat = global.db.data.chats[m.chat];
  const type = (args[0] || '').toLowerCase();

  if (!['antilink'].includes(type)) {
    return m.reply(`✳️ Usa: *.on antilink* o *.off antilink*`);
  }

  const enable = command === 'on';
  chat.antilink = enable;
  m.reply(`✅ Antilink ${enable ? 'activado' : 'desactivado'} correctamente.`);
};

handler.command = ['on', 'off'];
handler.group = true;
handler.admin = true;
handler.botAdmin = false;
handler.help = ['on antilink', 'off antilink'];
handler.tags = ['group'];

// 👇 Esta parte es la magia: se ejecuta en cada mensaje antes del resto
handler.before = async function (m, { conn, isAdmin, isOwner }) {
  if (!m.isGroup) return;

  const chat = global.db.data.chats[m.chat];
  if (!chat.antilink) return;

  if (isAdmin || isOwner || m.fromMe) return;

  const text = m?.text || '';
  const isGroupLink = linkRegex.test(text) || linkRegex1.test(text);
  if (!isGroupLink) return;

  const userTag = `@${m.sender.split('@')[0]}`;
  const delet = m.key.participant;
  const msgID = m.key.id;

  // Ignora si el link es del mismo grupo
  try {
    const ownGroupLink = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`;
    if (text.includes(ownGroupLink)) return;
  } catch (e) {
    console.error('❌ Error al obtener el link del grupo:', e);
  }

  try {
    // Mensaje de advertencia
    await conn.sendMessage(m.chat, {
      text: `🚫 ${userTag} envió un enlace prohibido.`,
      mentions: [m.sender]
    }, { quoted: m });

    // Intentar eliminar mensaje
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: msgID,
        participant: delet
      }
    });

    // Intentar expulsar
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
  } catch (e) {
    console.error('❌ No pude eliminar o expulsar:', e);
    await conn.sendMessage(m.chat, {
      text: `⚠️ No pude eliminar ni expulsar a ${userTag}. Puede que no tenga permisos.`,
      mentions: [m.sender]
    }, { quoted: m });
  }

  return true;
};

export default handler;