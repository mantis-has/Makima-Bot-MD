// setbotname-subbot.js
import fs from 'fs'
import path from 'path'
import chalk from 'chalk' // Asegúrate de importar chalk si lo usas aquí

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const newName = text.trim()
  if (!newName) {
    return m.reply(`*¡Ingresa el nuevo nombre para el Sub-Bot!* \n\nEjemplo:\n${usedPrefix + command} Yuru Kawaii`)
  }

  const botJid = conn?.user?.id || conn?.auth?.creds?.me?.id?.split(':')[0];
  if (!botJid) {
    return m.reply('❌ No se pudo identificar la sesión de este bot para cambiar el nombre. Asegúrate de que el bot esté conectado.');
  }

  const sessionId = botJid.includes('@') ? botJid.split('@')[0] : botJid;

  // --- LÓGICA DE RUTA MEJORADA Y DEPURACIÓN ---
  // Obtener la ruta del directorio del plugin actual (ej: /ruta/a/Yuru-Yuri/plugins/index/)
  const currentPluginDir = path.dirname(new URL(import.meta.url).pathname);
  console.log(chalk.yellow(`[DEBUG] currentPluginDir: ${currentPluginDir}`));

  // Subir los niveles necesarios para llegar a la raíz del proyecto.
  // Si el plugin está en 'Yuru-Yuri/plugins/index/', necesitamos subir 3 niveles para llegar al padre de 'Yuru-Yuri'.
  // Ejemplo: /ruta/a/Yuru-Yuri/plugins/index/ -> /ruta/a/Yuru-Yuri/plugins/ -> /ruta/a/Yuru-Yuri/ -> /ruta/a/
  const projectRootCandidate = path.join(currentPluginDir, '..', '..', '..');
  console.log(chalk.yellow(`[DEBUG] projectRootCandidate (padre de Yuru-Yuri): ${projectRootCandidate}`));

  // Ahora, desde esa "raíz candidata" (donde esperas que esté Yuru-Yuri y JadiBots),
  // construimos la ruta a la carpeta JadiBots.
  const jadiBotsBaseDir = path.join(projectRootCandidate, 'JadiBots');
  console.log(chalk.yellow(`[DEBUG] jadiBotsBaseDir: ${jadiBotsBaseDir}`));
  
  const sessionDir = path.join(jadiBotsBaseDir, sessionId);
  console.log(chalk.yellow(`[DEBUG] sessionDir final: ${sessionDir}`));
  // --- FIN LÓGICA DE RUTA MEJORADA Y DEPURACIÓN ---

  // Verificar si la carpeta JadiBots base existe
  if (!fs.existsSync(jadiBotsBaseDir)) {
      console.error(chalk.red(`Error: La carpeta base 'JadiBots' no existe en: ${jadiBotsBaseDir}`));
      return m.reply('❌ La carpeta principal de sub-bots (JadiBots) no se encontró. Revisa tu estructura de archivos.');
  }

  // Verificar si la carpeta de sesión específica del sub-bot existe
  if (!fs.existsSync(sessionDir)) {
      console.error(chalk.red(`Error: La carpeta de sesión esperada no existe para ${sessionId}: ${sessionDir}`));
      return m.reply('❌ No se encontró la carpeta de sesión para este sub-bot. No se puede guardar la configuración. Revisa la ruta y el nombre de la carpeta.');
  }

  const configPath = path.join(sessionDir, 'config.json');
  
  let config = {};
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (e) {
      console.error(chalk.red(`Error al leer config.json de ${sessionId}:`), e);
      m.reply('❌ Error al cargar la configuración existente del Sub-Bot. El archivo puede estar corrupto.');
      return;
    }
  }

  config.namebot = newName;
  
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    m.reply(`✅ Nombre del Sub-Bot actualizado a: *${newName}*`);
    console.log(chalk.green(`Nombre del Sub-Bot ${sessionId} actualizado a: ${newName}`));
  } catch (e) {
    console.error(chalk.red(`Error al escribir config.json de ${sessionId}:`), e);
    m.reply('❌ Error al guardar el nuevo nombre del Sub-Bot.');
  }
}

handler.command = /^setbotname$/i
handler.tags = ['owner']
handler.rowner = false
handler.limit = false 

export default handler
