const handler = async (m, { conn, args, groupMetadata }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo se usa en grupos.');

  if (!args[0]) return m.reply('📌 Ingresa un prefijo. Ejemplo: *.kicknum 504*');
  if (isNaN(args[0])) return m.reply('🔢 Prefijo inválido, debe ser número.');

  const prefijo = args[0].replace(/[+]/g, '');
  const participantes = groupMetadata?.participants || [];

  let usersToKick = [];

  console.log(`🔍 Analizando miembros del grupo para prefijo +${prefijo}...`);

  for (const p of participantes) {
    let jid = p.id;
    // Soporte @lid, @s.whatsapp.net o @g.us
    if (jid.endsWith('@lid')) {
      try {
        const resolvedJid = await conn.decodeJid(jid);
        console.log(`Se pudo resolver jid de ${jid} a ${resolvedJid}`);
        jid = resolvedJid;
      } catch {
        console.log(`No se pudo resolver jid de ${jid}`);
      }
    }

    if (jid.startsWith(prefijo) || jid.includes(`@${prefijo}`)) {
      usersToKick.push(jid);
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
      await m.reply(`⚠️ No pude expulsar a ${user}. Puede que el bot no sea admin.`);
    }
  }
}

handler.command = ['kicknum'];
handler.group = true;

export default handler;