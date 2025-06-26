const handler = async (m, { conn, groupMetadata }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo es para grupos.');

  const arabicPrefixes = ['212', '20', '971', '92', '98', '234', '60', '62', '91']; // +212 (Marruecos), +20 (Egipto), +971 (EAU), +92 (Pakistán), +98 (Irán), +234 (Nigeria), +60 (Malasia), +62 (Indonesia), +91 (India)

  const participants = groupMetadata.participants || [];

  const usersToKick = [];

  console.log(`🔎 Revisando miembros para prefijos árabes...`);

  for (const p of participants) {
    let jid = p.id; // puede ser tipo 123456789@lid o 504123456789@s.whatsapp.net
    let number = jid.split('@')[0].replace(/\D/g, ''); // quitar cualquier no número

    // Revisar si número empieza con alguno de los prefijos árabes
    if (arabicPrefixes.some(prefix => number.startsWith(prefix))) {
      let realJid = number + '@s.whatsapp.net';
      usersToKick.push(realJid);
      console.log(`⚠️ Usuario con prefijo árabe detectado: ${jid} (normalizado a ${realJid})`);
    }
  }

  if (usersToKick.length === 0) {
    return m.reply('✅ No hay usuarios con prefijos árabes en este grupo.');
  }

  await m.reply(`⚠️ Expulsando a ${usersToKick.length} usuarios con prefijos árabes...`);

  for (const user of usersToKick) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
      console.log(`✅ Expulsado: ${user}`);
    } catch (error) {
      console.log(`❌ Error expulsando a ${user}:`, error);
      await m.reply(`⚠️ No pude expulsar a @${user.split('@')[0]}. Puede que no tenga permisos o no sea admin.`, null, { mentions: [user] });
    }
  }
};

handler.command = ['kickarab', 'kickarabe', 'kickarabes'];
handler.group = true;

export default handler;