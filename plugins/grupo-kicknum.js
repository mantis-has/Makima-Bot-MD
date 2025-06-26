const handler = async (m, { conn, args, groupMetadata }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo se usa en grupos.');

  if (!args[0]) return m.reply('📌 Ingresa un prefijo. Ejemplo: *.kicknum 504*');
  if (isNaN(args[0].replace('+', ''))) return m.reply('🔢 Prefijo inválido, debe ser número.');

  const prefijo = args[0].replace(/\D/g, ''); // solo números
  const participantes = groupMetadata?.participants || [];

  console.log(`🔍 Analizando miembros del grupo para prefijo +${prefijo}...`);

  let usersToKick = [];

  for (const p of participantes) {
    let jid = p.id; // puede ser tipo 123456789@lid o 504123456789@s.whatsapp.net
    let number = jid.split('@')[0];

    if (number.startsWith(prefijo)) {
      let realJid = number + '@s.whatsapp.net'; // siempre expulsar con este jid
      usersToKick.push(realJid);
      console.log(`Usuario encontrado: ${jid} -> expulsar con: ${realJid}`);
    }
  }

  if (usersToKick.length === 0) {
    return m.reply(`❌ No encontré usuarios con el prefijo +${prefijo} en este grupo.`);
  }

  await m.reply(`⚠️ Iniciando expulsión de ${usersToKick.length} usuarios con prefijo +${prefijo}...`);

  for (const user of usersToKick) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
      console.log(`✅ Usuario expulsado: ${user}`);
    } catch (error) {
      console.log(`❌ Error expulsando a ${user}:`, error);
      await m.reply(`⚠️ No pude expulsar a @${user.split('@')[0]}. Puede que el bot no tenga admin o permisos.`, null, { mentions: [user] });
    }
  }
};

handler.command = ['kicknum'];
handler.group = true;

export default handler;