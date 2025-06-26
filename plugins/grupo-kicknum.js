const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const handler = async (m, { conn, args, participants, command }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

  if (!args[0]) return m.reply('⚠️ Escribe un prefijo de país, por ejemplo: *.kicknum 212*');
  const prefijo = args[0].replace(/\D/g, '');

  if (!prefijo || isNaN(prefijo)) return m.reply('🚫 Prefijo inválido. Ej: *.kicknum 54*');

  const grupo = m.chat;
  const lista = participants.map((p) => p.id).filter((id) => id && id !== conn.user.jid);

  let encontrados = [];

  console.log(`🟡 Analizando miembros del grupo para prefijo +${prefijo}...`);

  for (const jid of lista) {
    if (/^\d+@s\.whatsapp\.net$/.test(jid)) {
      const numero = jid.split('@')[0];
      if (numero.startsWith(prefijo)) {
        encontrados.push(jid);
        console.log(`✅ Coincide directo: +${numero}`);
      }
    } else if (jid.endsWith('@lid')) {
      // ID oculto, intentamos resolver con onWhatsApp
      try {
        const info = await conn.onWhatsApp(jid);
        const userJid = info?.[0]?.jid || null;
        if (userJid) {
          const numero = userJid.split('@')[0];
          if (numero.startsWith(prefijo)) {
            encontrados.push(jid);
            console.log(`✅ Coincide lid: ${jid} => +${numero}`);
          } else {
            console.log(`❌ No coincide lid: ${jid} => +${numero}`);
          }
        } else {
          console.log(`⚠️ No se pudo resolver jid de ${jid}`);
        }
      } catch (e) {
        console.log(`❌ Error consultando ${jid}:`, e.message);
      }
    }
  }

  if (!encontrados.length) return m.reply(`⚠️ No encontré ningún número con prefijo +${prefijo}.`);

  if (command === 'listnum' || command === 'listanum') {
    let lista = encontrados.map((jid) => `⭔ @${jid.split('@')[0]}`).join('\n');
    return conn.sendMessage(m.chat, {
      text: `📍 Números con prefijo +${prefijo}:\n\n${lista}`,
      mentions: encontrados
    });
  }

  if (command === 'kicknum') {
    await m.reply(`♻️ Iniciando eliminación de ${encontrados.length} número(s) con prefijo +${prefijo}...`);

    for (const jid of encontrados) {
      try {
        await conn.groupParticipantsUpdate(grupo, [jid], 'remove');
        await delay(2000);
      } catch (e) {
        console.log(`❌ No se pudo expulsar a ${jid}: ${e.message}`);
        m.reply(`⚠️ No pude expulsar a @${jid.split('@')[0]}. Puede que no tenga permisos.`, null, {
          mentions: [jid]
        });
      }
    }

    m.reply(`✅ Proceso finalizado. Total: ${encontrados.length} expulsado(s).`);
  }
};

handler.command = ['kicknum', 'listnum', 'listanum'];
handler.group = true;

export default handler;