const handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('🔒 Este comando solo funciona en grupos.');

  const groupMetadata = await conn.groupMetadata(m.chat);
  const participantes = groupMetadata.participants;

  const prefijosArabes = ['212', '971', '20', '234', '60', '62', '92', '98', '91'];

  function tienePrefijoExacto(numero, prefijo) {
    if (!numero.startsWith(prefijo)) return false;
    if (numero.length === prefijo.length) return true;
    const nextChar = numero.charAt(prefijo.length);
    return !/[0-9]/.test(nextChar);
  }

  const detectados = [];

  for (let p of participantes) {
    const jid = p.id;
    const numero = jid.split('@')[0]; // no intenta resolver lid

    const sospechoso = prefijosArabes.some(pref => tienePrefijoExacto(numero, pref));
    if (sospechoso) {
      detectados.push({ jid, numero });
      console.log(`🚨 Detectado sospechoso: ${numero}`);
    } else {
      console.log(`✅ Seguro: ${numero}`);
    }
  }

  if (detectados.length === 0) {
    m.reply('✅ No se detectaron números con prefijos árabes en el grupo.');
    return;
  }

  // Anuncia al grupo
  let msg = '🚫 Números árabes detectados:\n\n';
  msg += detectados.map(u => `• @${u.numero}`).join('\n');
  msg += '\n\n⏳ Expulsando...';

  await conn.sendMessage(m.chat, {
    text: msg,
    mentions: detectados.map(u => u.jid)
  });

  for (let u of detectados) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [u.jid], 'remove');
      console.log(`✅ Expulsado: ${u.numero}`);
      await new Promise(res => setTimeout(res, 1000));
    } catch (e) {
      console.log(`⚠️ Error al expulsar a ${u.numero}:`, e.message);
      await conn.sendMessage(m.chat, {
        text: `⚠️ No se pudo expulsar a @${u.numero}. Puede que no tenga permisos.`,
        mentions: [u.jid]
      });
    }
  }
};

handler.command = ['kickarab'];
handler.tags = ['group'];
handler.help = ['kickarab'];
handler.group = true;

export default handler;