const handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('🚫 Solo se puede usar en grupos.');

  const groupMetadata = await conn.groupMetadata(m.chat);
  const participantes = groupMetadata.participants;

  const prefijosArabes = ['212', '971', '20', '234', '60', '62', '92', '98', '91'];

  function tienePrefijoExacto(numero, prefijo) {
    if (!numero.startsWith(prefijo)) return false;
    if (numero.length === prefijo.length) return true;
    const nextChar = numero.charAt(prefijo.length);
    return !/[0-9]/.test(nextChar);
  }

  let detectados = [];

  for (let p of participantes) {
    const jid = p.id;
    let numero;

    try {
      // Esto trata de obtener info real del usuario (si el jid es tipo @lid)
      const vcard = await conn.onWhatsApp(jid.split('@')[0]);
      if (vcard && vcard[0] && vcard[0].jid) {
        numero = vcard[0].jid.split('@')[0];
        console.log(`✅ Se resolvió jid de ${jid} ➤ ${numero}`);
      } else {
        console.log(`❌ No se pudo resolver jid de ${jid}`);
        continue;
      }
    } catch (e) {
      console.log(`❌ Error resolviendo ${jid}:`, e);
      continue;
    }

    const tienePrefijo = prefijosArabes.some(pref => tienePrefijoExacto(numero, pref));
    if (tienePrefijo) {
      detectados.push({ jid, numero });
    }
  }

  if (detectados.length === 0) return m.reply('✅ No se encontraron números árabes en el grupo.');

  let mensaje = '🧨 Se detectaron números con prefijos árabes:\n\n';
  for (let u of detectados) {
    mensaje += `• @${u.numero} (${u.jid})\n`;
  }

  await conn.sendMessage(m.chat, {
    text: mensaje.trim(),
    mentions: detectados.map(u => u.jid)
  });

  // Ahora los expulsa
  for (let u of detectados) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [u.jid], 'remove');
      await m.reply(`✅ @${u.numero} fue expulsado.`, null, {
        mentions: [u.jid]
      });
      await new Promise(res => setTimeout(res, 1500));
    } catch (e) {
      await m.reply(`⚠️ No se pudo expulsar a @${u.numero}. Puede que no tenga permisos.`, null, {
        mentions: [u.jid]
      });
    }
  }
};

handler.command = ['kickarab'];
handler.tags = ['group'];
handler.group = true;
handler.help = ['kickarab'];

export default handler;