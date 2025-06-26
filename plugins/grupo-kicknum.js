const handler = async (m, { conn, args, groupMetadata }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo se usa en grupos.');

  if (!args[0]) return m.reply('📌 Ingresa un prefijo. Ejemplo: *.kicknum 504*');
  if (isNaN(args[0])) return m.reply('🔢 Prefijo inválido, debe ser número.');

  const prefijo = args[0].replace(/[+]/g, '');
  const participantes = groupMetadata?.participants || [];

  let usersToKick = [];

  console.log(`🔍 Analizando miembros del grupo para prefijo +${prefijo}...`);

  for (const p of participantes) {
    let jid = p.id; // ejemplo: 156981591593126@lid o 504123456789@s.whatsapp.net
    let number = jid.split('@')[0]; // extrae solo el número

    if (number.startsWith(prefijo)) {
      // Armar el jid real para expulsar
      let realJid = number + '@s.whatsapp.net';
      usersToKick.push(realJid);
      console.log(`Usuario con prefijo encontrado: ${jid} -> expulsar ${realJid}`);
    } else {
      console.log(`Usuario sin prefijo: ${jid}`);
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
    } catch (e) {
      console.log(`❌ No pude expulsar a ${user}. Puede que no tenga permisos.`);
      await m.reply(`⚠️ No pude expulsar a @${user.split('@')[0]}. Puede que el bot no sea admin.`, null, { mentions: [user] });
    }
  }
}

handler.command = ['kicknum'];
handler.group = true;

export default handler;