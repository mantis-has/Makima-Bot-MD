const handler = async (m, { conn, args, command }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo se usa en grupos.');

  const groupMetadata = await conn.groupMetadata(m.chat);

  // Validar que quien manda el comando es admin
  const userParticipant = groupMetadata.participants.find(p => p.id === m.sender);
  const isUserAdmin = userParticipant?.admin === 'admin' || userParticipant?.admin === 'superadmin' || m.sender === groupMetadata.owner;
  if (!isUserAdmin) return m.reply('❌ Solo los admins pueden usar este comando.');

  // Prefijos árabes comunes
  const prefijosArabes = ['212', '971', '20', '234', '60', '62', '92', '98', '91'];

  // Función para validar que el prefijo es exacto y no parte de otro número
  function tienePrefijoExacto(numero, prefijo) {
    if (!numero.startsWith(prefijo)) return false;
    if (numero.length === prefijo.length) return true; // número justo igual al prefijo
    // El siguiente carácter debe no ser dígito o no existir para ser exacto
    const nextChar = numero.charAt(prefijo.length);
    return !/[0-9]/.test(nextChar);
  }

  const arabesParaKickear = [];

  for (const participante of groupMetadata.participants) {
    let id = participante.id;
    let numero = id.split('@')[0].replace(/\D/g, ''); // solo números

    // Buscar si coincide con algún prefijo EXACTO
    if (prefijosArabes.some(pref => tienePrefijoExacto(numero, pref))) {
      arabesParaKickear.push(participante.id);
    }
  }

  if (arabesParaKickear.length === 0) {
    return m.reply('😌 No se encontraron usuarios con prefijo árabe en el grupo.');
  }

  console.log(`🔎 Usuarios con prefijo árabe para kickear (${arabesParaKickear.length}):`);
  arabesParaKickear.forEach(u => console.log(`- ${u}`));

  await m.reply(`⚠️ Se expulsará a ${arabesParaKickear.length} usuario(s) con prefijo árabe.`);

  for (const jid of arabesParaKickear) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [jid], 'remove');
      console.log(`✅ Expulsado: ${jid}`);
    } catch {
      m.reply(`❌ No pude expulsar a @${jid.split('@')[0]}. Puede que no tenga permisos de admin.`, null, { mentions: [jid] });
      console.log(`❌ Error expulsando a: ${jid} - posible falta de permisos.`);
    }
  }
};

handler.command = ['kickarab', 'kickarabes'];
handler.group = true;

export default handler;