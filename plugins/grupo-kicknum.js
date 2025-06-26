const handler = async (m, { conn, args, command }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo se usa en grupos.');

  const groupMetadata = await conn.groupMetadata(m.chat);
  
  // Validar que quien manda el comando es admin
  const userParticipant = groupMetadata.participants.find(p => p.id === m.sender);
  const isUserAdmin = userParticipant?.admin === 'admin' || userParticipant?.admin === 'superadmin' || m.sender === groupMetadata.owner;
  if (!isUserAdmin) return m.reply('❌ Solo los admins pueden usar este comando.');

  const prefijosArabes = ['212', '971', '20', '234', '60', '62', '92', '98', '91']; // +212, +971, etc
  const arabesParaKickear = [];

  // Buscar participantes con prefijo árabe, incluyendo soporte para @lid y @s.whatsapp.net
  for (const participante of groupMetadata.participants) {
    let id = participante.id;

    // En caso de @lid, tratar de resolver el número base (quitando @lid)
    // A veces viene con @lid, a veces no, solo toma la parte del número
    let numero = id.split('@')[0];

    // Quitar cualquier prefijo tipo + o caracteres extra (por si acaso)
    numero = numero.replace(/\D/g, '');

    // Validar si el número empieza con alguno de los prefijos árabes
    if (prefijosArabes.some(pref => numero.startsWith(pref))) {
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
handler.admin = true;

export default handler;