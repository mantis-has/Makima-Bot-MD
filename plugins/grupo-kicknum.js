const handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('🔒 Solo en grupos.');

  const groupMetadata = await conn.groupMetadata(m.chat);
  const prefijosArabes = ['212', '971', '20', '234', '60', '62', '92', '98', '91'];

  function tienePrefijoExacto(numero, prefijo) {
    if (!numero.startsWith(prefijo)) return false;
    if (numero.length === prefijo.length) return true;
    const nextChar = numero.charAt(prefijo.length);
    return !/[0-9]/.test(nextChar);
  }

  const arabes = groupMetadata.participants.filter(p => {
    let numero = p.id.split('@')[0].replace(/\D/g, '');
    return prefijosArabes.some(pref => tienePrefijoExacto(numero, pref));
  });

  if (arabes.length === 0) return m.reply('No se encontraron usuarios con prefijo árabe.');

  let texto = '🔍 Usuarios con prefijo árabe detectados:\n\n';
  arabes.forEach(u => {
    texto += `• @${u.id.split('@')[0]}\n`;
  });

  await conn.sendMessage(m.chat, { text: texto, mentions: arabes.map(u => u.id) });
};

handler.command = ['checkarab'];
handler.group = true;

export default handler;