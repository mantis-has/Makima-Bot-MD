/*
Código creado por Félix Manuel - Makima Bot MD
Respeta los créditos
*/

const jugadores = [
  { nombre: "Cristiano Ronaldo", valor: 100, url: "https://files.catbox.moe/fl7ibk.jpg" },
  { nombre: "Luka Modric", valor: 100, url: "https://files.catbox.moe/606f25.jpg" },
  { nombre: "Kevin Benzema", valor: 100, url: "https://qu.ax/JlOOv.jpg" },
  { nombre: "Lamine Yamal", valor: 100, url: "https://qu.ax/KPZrj.jpg" },
  { nombre: "Lionel Messi", valor: 100, url: "https://qu.ax/ggRkD.jpg" },
  { nombre: "Keylan Mbappe", valor: 100, url: "https://qu.ax/XPEDZ.jpg" },
  { nombre: "Bellingang", valor: 100, url: "https://qu.ax/krNHY.jpg" },
  { nombre: "Vinicios JR", valor: 100, url: "https://qu.ax/QHNhz.jpg" },
  { nombre: "Ronaldo", valor: 100, url: "https://qu.ax/jDVGs.jpg" }
];

const channelRD = { id: "120363400360651198@newsletter", name: "MAKIMA - FRASES" };
const MAKIMA_ICON = "https://qu.ax/dXOUo.jpg";
const GITHUB_MAKIMA = "https://github.com/mantis-has/Makima";
const NEWSLETTER_TITLE = '🩵 MAKIMA BOT MD 🩵';
const SOC_CLAIM_TIMEOUT = 3 * 60 * 1000; // 3 minutos

let soccerStorage = global.db.data.soccer || (global.db.data.soccer = {});
let ventasPendientes = global.db.data.ventasPendientes || (global.db.data.ventasPendientes = {});

let handler = async (m, { conn, command, args }) => {
  // #soccer
  if (command === "soccer") {
    let user = global.db.data.users[m.sender];
    if (!user) user = global.db.data.users[m.sender] = {};
    if (user.lastSoccer && new Date - user.lastSoccer < SOC_CLAIM_TIMEOUT) {
      return await sendNewsletter(conn, m.chat, `「🩵」Debes esperar ${clockString(SOC_CLAIM_TIMEOUT - (new Date - user.lastSoccer))} para reclamar otro jugador de fútbol.`, m);
    }
    let jugador = jugadores[Math.floor(Math.random() * jugadores.length)];
    soccerStorage[m.chat] = {
      nombre: jugador.nombre,
      url: jugador.url,
      valor: jugador.valor,
      owner: null,
      msgId: null
    };
    let msg = await conn.sendMessage(m.chat, {
      image: { url: jugador.url },
      caption: `✰ Jugador: ${jugador.nombre}\n✰ Valor: ${jugador.valor}\n✰ Fuente: Deymoon\n✰ Bot: Makima 2.0`,
      contextInfo: newsletterContext([m.sender])
    }, { quoted: m });
    soccerStorage[m.chat].msgId = (await msg).key.id;
    user.lastSoccer = +new Date;
    return;
  }

  // #rcjugador (reclamar)
  if (command === "rcjugador") {
    let user = global.db.data.users[m.sender];
    if (!user) user = global.db.data.users[m.sender] = {};
    if (user.lastSoccer && new Date - user.lastSoccer < SOC_CLAIM_TIMEOUT) {
      return await sendNewsletter(conn, m.chat, `「🩵」Debes esperar ${clockString(SOC_CLAIM_TIMEOUT - (new Date - user.lastSoccer))} para reclamar otro jugador de fútbol.`, m);
    }
    if (!m.quoted || !m.quoted.id) return m.reply('Responde a la foto del jugador con #rcjugador para reclamarlo.');
    let soccer = soccerStorage[m.chat];
    if (!soccer || soccer.msgId !== m.quoted.id)
      return m.reply('No hay jugador disponible para reclamar o ya expiró.');
    if (soccer.owner) {
      let ownerName = await conn.getName(soccer.owner);
      return await sendNewsletter(conn, m.chat, `「🩵」Este jugador ya fue reclamado por ${ownerName}.`, m);
    }
    if (!user || user.exp < soccer.valor)
      return await sendNewsletter(conn, m.chat, `「🩵」No tienes suficiente XP para reclamar este jugador.`, m);
    soccer.owner = m.sender;
    if (!user.soccerPlayers) user.soccerPlayers = [];
    user.soccerPlayers.push(soccer.nombre);
    user.lastSoccer = +new Date;
    await sendNewsletter(conn, m.chat, `「🩵」¡Reclamaste a ${soccer.nombre}!`, m);
    return;
  }

  // #jugadores
  if (command === "jugadores") {
    let targetJid;
    let isSelf = false;
    if (m.mentionedJid && m.mentionedJid.length > 0) {
      targetJid = m.mentionedJid[0];
      isSelf = targetJid === m.sender;
    } else {
      targetJid = m.sender;
      isSelf = true;
    }
    let user = global.db.data.users[targetJid];
    let nombre = await conn.getName(targetJid);
    let lista = (user && user.soccerPlayers) ? user.soccerPlayers : [];
    let total = lista.length;
    if (total === 0) {
      if (isSelf) {
        return await sendNewsletter(conn, m.chat, `「🩵」No tienes jugadores reclamados.`, m);
      } else {
        return await sendNewsletter(conn, m.chat, `「🩵」Este usuario no tiene jugadores reclamados.`, m);
      }
    }
    let jugadoresText = lista.map(j => `• ${j}`).join('\n');
    let texto = `✰ 𝖩𝖴𝖦𝖠𝖣𝖮𝖱𝖤𝖲 ✰

Usuario: ${nombre}

Total: ${total}

${jugadoresText}`;
    await conn.sendMessage(m.chat, {
      text: texto,
      mentions: [targetJid],
      contextInfo: newsletterContext([targetJid])
    }, { quoted: m });
    return;
  }

  // #rgjugador (regalar jugador)
  if (command === "rgjugador") {
    let user = global.db.data.users[m.sender];
    if (!user || !user.soccerPlayers || user.soccerPlayers.length === 0)
      return await sendNewsletter(conn, m.chat, `「🩵」No tienes jugadores para regalar.`, m);

    let jugadorNombre = args.filter(a => !a.startsWith("@")).join(' ').trim();
    let mention = m.mentionedJid && m.mentionedJid[0];

    if (!jugadorNombre) {
      return await sendNewsletter(conn, m.chat, `「🩵」Debes especificar el nombre del jugador que deseas regalar.`, m);
    }
    if (!mention) {
      return await sendNewsletter(conn, m.chat, `「🩵」Debes mensionar un usuario para regalar este jugador.`, m);
    }

    let idx = user.soccerPlayers.findIndex(j => j.toLowerCase() === jugadorNombre.toLowerCase());
    if (idx === -1)
      return await sendNewsletter(conn, m.chat, `「🩵」Este personaje no está reclamado por ti. Usa #soccer para reclamar un personaje.`, m);

    let jugadorRealNombre = user.soccerPlayers[idx];
    user.soccerPlayers.splice(idx, 1);

    let destinatario = global.db.data.users[mention];
    if (!destinatario) destinatario = global.db.data.users[mention] = {};
    if (!destinatario.soccerPlayers) destinatario.soccerPlayers = [];
    destinatario.soccerPlayers.push(jugadorRealNombre);

    let nombreDest = await conn.getName(mention);
    await sendNewsletter(conn, m.chat, `「🩵」Le has regalado a ${nombreDest} el jugador ${jugadorRealNombre}.`, m);
    return;
  }

  // #vtjugador (votar un jugador, lo elimina)
  if (command === "vtjugador") {
    let user = global.db.data.users[m.sender];
    if (!user || !user.soccerPlayers || user.soccerPlayers.length === 0)
      return await sendNewsletter(conn, m.chat, `「🩵」No tienes jugadores para votar.`, m);

    let jugadorNombre = args.join(" ").trim();
    if (!jugadorNombre) return await sendNewsletter(conn, m.chat, `「🩵」Debes especificar el nombre del jugador que deseas votar.`, m);

    let idx = user.soccerPlayers.findIndex(j => j.toLowerCase() === jugadorNombre.toLowerCase());
    if (idx === -1) return await sendNewsletter(conn, m.chat, `「🩵」No tienes a ese jugador en tu inventario.`, m);

    let jugadorRealNombre = user.soccerPlayers[idx];
    user.soccerPlayers.splice(idx, 1);
    await sendNewsletter(conn, m.chat, `「🩵」Has expulsado del inventario al jugador ${jugadorRealNombre}.`, m);
    return;
  }

  // #vrjugador (proponer venta)
  if (command === "vrjugador") {
    let user = global.db.data.users[m.sender];
    if (!user || !user.soccerPlayers || user.soccerPlayers.length === 0)
      return await sendNewsletter(conn, m.chat, `「🩵」No tienes jugadores para vender.`, m);

    let mention = m.mentionedJid && m.mentionedJid[0];
    let partes = args.filter(a => !a.startsWith("@"));
    let jugadorNombre = partes.slice(0, -1).join(' ').trim();
    let cantidad = parseInt(partes[partes.length - 1]);

    if (!jugadorNombre) return await sendNewsletter(conn, m.chat, `「🩵」Debes especificar el nombre del jugador que deseas vender.`, m);
    if (!mention) return await sendNewsletter(conn, m.chat, `「🩵」Debes mensionar un usuario para vender este jugador.`, m);
    if (isNaN(cantidad)) return await sendNewsletter(conn, m.chat, `「🩵」Debes poner la cantidad de XP que deseas por el jugador (ejemplo: #vrjugador @usuario Messi 200).`, m);
    if (cantidad < 1 || cantidad > 1000) return await sendNewsletter(conn, m.chat, `「🩵」El Jugador debe ser vendido de 1 a 1000 de XP.`, m);

    let idx = user.soccerPlayers.findIndex(j => j.toLowerCase() === jugadorNombre.toLowerCase());
    if (idx === -1) return await sendNewsletter(conn, m.chat, `「🩵」Este personaje no está reclamado por ti. Usa #soccer para reclamar un personaje.`, m);

    let ventaId = `${m.chat}-${Date.now()}`;
    ventasPendientes[ventaId] = {
      vendedor: m.sender,
      comprador: mention,
      jugador: user.soccerPlayers[idx],
      precio: cantidad,
      msgId: null
    };

    let compradorTag = '@' + mention.split('@')[0];
    let vendedorTag = '@' + m.sender.split('@')[0];

    let texto = `「🩵」${compradorTag} el usuario ${vendedorTag} te quiere vender el jugador ${user.soccerPlayers[idx]} por ${cantidad} de XP\n\nResponde a este mensaje con:\n• Aceptar\n• Rechazar`;

    let ventaMsg = await conn.sendMessage(m.chat, {
      text: texto,
      mentions: [mention, m.sender],
      contextInfo: newsletterContext([mention, m.sender])
    }, { quoted: m });

    ventasPendientes[ventaId].msgId = ventaMsg.key.id;
    return;
  }

  if (m.quoted && m.quoted.id) {
    for (let ventaId in ventasPendientes) {
      let venta = ventasPendientes[ventaId];
      if (venta.msgId === m.quoted.id) {
        if (m.sender !== venta.comprador && m.sender !== venta.vendedor)
          return await sendNewsletter(conn, m.chat, `「🩵」La venta no es contigo, no te metas Gay.`, m);

        let respuesta = (m.text || '').trim().toLowerCase();

        if (respuesta === 'aceptar') {
          if (m.sender !== venta.comprador)
            return await sendNewsletter(conn, m.chat, `「🩵」Solo el usuario al que le venden puede aceptar.`, m);

          let comprador = global.db.data.users[venta.comprador];
          if (!comprador || typeof comprador.exp !== 'number' || comprador.exp < venta.precio)
            return await sendNewsletter(conn, m.chat, `「🩵」No tienes suficiente XP para comprar este jugador.`, m);

          let vendedor = global.db.data.users[venta.vendedor];
          if (!vendedor) vendedor = global.db.data.users[venta.vendedor] = {};
          if (!comprador.soccerPlayers) comprador.soccerPlayers = [];
          if (!vendedor.soccerPlayers) vendedor.soccerPlayers = [];

          let idx = vendedor.soccerPlayers.findIndex(j => j.toLowerCase() === venta.jugador.toLowerCase());
          if (idx === -1)
            return await sendNewsletter(conn, m.chat, `「🩵」El vendedor ya no tiene ese jugador.`, m);

          comprador.exp -= venta.precio;
          vendedor.exp = (typeof vendedor.exp === 'number' ? vendedor.exp : 0) + venta.precio;
          comprador.soccerPlayers.push(venta.jugador);
          vendedor.soccerPlayers.splice(idx, 1);

          let compradorTag = '@' + venta.comprador.split('@')[0];
          let vendedorTag = '@' + venta.vendedor.split('@')[0];

          await sendNewsletter(conn, m.chat, `「🩵」${compradorTag} ha aceptado la compra de ${venta.jugador} por ${venta.precio} de XP.`, m);
          delete ventasPendientes[ventaId];
          return;
        } else if (respuesta === 'rechazar') {
          if (m.sender !== venta.comprador)
            return await sendNewsletter(conn, m.chat, `「🩵」Solo el usuario al que le venden puede rechazar.`, m);

          await sendNewsletter(conn, m.chat, `「🩵」Venta cancelada.`, m);
          delete ventasPendientes[ventaId];
          return;
        } else {
          return await sendNewsletter(conn, m.chat, `「🩵」El mensaje "${m.text}" no está en la propuesta del bot. Responde con Rechazar o Aceptar.`, m);
        }
      }
    }
  }
};

handler.help = ['soccer', 'rcjugador', 'jugadores', 'rgjugador', 'vtjugador', 'vrjugador'];
handler.tags = ['games'];
handler.command = ['soccer', 'rcjugador', 'jugadores', 'rgjugador', 'vtjugador', 'vrjugador'];
handler.register = true;
export default handler;

async function sendNewsletter(conn, chat, text, quoted = null) {
  await conn.sendMessage(chat, {
    text,
    contextInfo: {
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: channelRD.id,
        newsletterName: channelRD.name,
        serverMessageId: -1,
      },
      forwardingScore: 999,
      externalAdReply: {
        title: NEWSLETTER_TITLE,
        body: channelRD.name,
        thumbnailUrl: MAKIMA_ICON,
        sourceUrl: GITHUB_MAKIMA,
        mediaType: 1,
        renderLargerThumbnail: false
      }
    }
  }, { quoted });
}

function newsletterContext(mentioned = []) {
  return {
    mentionedJid: mentioned,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: channelRD.id,
      newsletterName: channelRD.name,
      serverMessageId: -1,
    },
    forwardingScore: 999,
    externalAdReply: {
      title: NEWSLETTER_TITLE,
      body: channelRD.name,
      thumbnailUrl: MAKIMA_ICON,
      sourceUrl: GITHUB_MAKIMA,
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };
}

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
  }
