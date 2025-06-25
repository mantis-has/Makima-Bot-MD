let linkRegex = /chat\.whatsapp\.com\/[0-9A-Za-z]{20,24}/i;
let linkRegex1 = /whatsapp\.com\/channel\/[0-9A-Za-z]{20,24}/i;

const handler = async (m, { conn, command, args, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo funciona en grupos.');

  const type = (args[0] || '').toLowerCase();
  const chat = global.db.data.chats[m.chat] || {};

  const isAutoread = type === 'autoread';
  const isAntilink = type === 'antilink';

  if (!isAutoread && !isAntilink) {
    return m.reply(`✳️ Usa:\n*.on antilink* / *.off antilink*\n*.on autoread* / *.off autoread*`);
  }

  const enable = command === 'on';

  if (isAntilink) {
    if (!(isAdmin || isOwner)) return m.reply('❌ Solo los admins pueden activar o desactivar el Antilink.');
    chat.antilink = enable;
    return m.reply(`✅ Antilink ${enable ? 'activado' : 'desactivado'} correctamente.`);
  }

  if (isAutoread) {
    if (!isOwner) return m.reply('🔐 Solo el dueño del bot puede activar o desactivar el AutoRead.');
    chat.autoread = enable;
    return m.reply(`✅ AutoRead ${enable ? 'activado' : 'desactivado'} correctamente.`);
  }
};

handler.command = ['on', 'off'];
handler.group = true;
handler.help = ['on antilink', 'off antilink', 'on autoread', 'off autoread'];
handler.tags = ['group'];

// 🧠 Hook que se ejecuta en cada mensaje antes de comandos
handler.before = async function (m, { conn, isAdmin, isOwner }) {
  if (!m.isGroup) return;

  const chat = global.db.data.chats[m.chat] || {};

  // ✅ Auto lectura si está activado
  if (chat.autoread) {
    try {
      if (typeof conn.chatRead === 'function') {
        await conn.chatRead(m.chat);
        console.log('📖 Chat marcado como leído (✓✓ azul)');
      } else if (m.key?.id) {
        await conn.sendMessage(m.chat, { read: true });
        console.log('📖 Chat marcado como leído (modo alterno)');
      }
    } catch (e) {
      console.error('❌ Error al marcar como leído:', e);
    }
  }

  // 🚫 Si Antilink no está activado, salir
  if (!chat.antilink) return;

  // 🚫 Ignorar si es admin, owner o el mismo bot
  if (isAdmin || isOwner || m.fromMe) return;

  const text = m?.text || '';
  const isGroupLink = linkRegex.test(text) || linkRegex1.test(text);
  if (!isGroupLink) return;

  const userTag = `@${m.sender.split('@')[0]}`;
  const delet = m.key.participant;
  const msgID = m.key.id;

  // ❎ Ignora si es el link del mismo grupo
  try {
    const ownGroupLink = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`;
    if (text.includes(ownGroupLink)) return;
  } catch (e) {
    console.error('⚠️ Error al obtener el link del grupo:', e);
  }

  try {
    // 🗣️ Mensaje de advertencia
    await conn.sendMessage(m.chat, {
      text: `🚫 Hey ${userTag}, los enlaces no están permitidos acá. Chau w`,
      mentions: [m.sender]
    }, { quoted: m });

    // 🧹 Eliminar mensaje
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: msgID,
        participant: delet
      }
    });

    // 👢 Expulsar
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