const handler = async (msg, { conn }) => {
  const chatId = msg.key.remoteJid;

  // Estado inicial del jugador y monstruo
  let player = {
    name: 'Héroe',
    health: 100,
    maxHealth: 100,
    attack: () => Math.floor(Math.random() * 20) + 10,
    heal: () => Math.floor(Math.random() * 15) + 10,
  };

  let monster = {
    name: 'Monstruo',
    health: 80,
    maxHealth: 80,
    attack: () => Math.floor(Math.random() * 15) + 5,
  };

  // Función para actualizar el estado del juego
  const updateGame = async () => {
    const gameMessage = `
⚔️ *Batalla de Monstruos* ⚔️

👤 *Jugador:* ${player.name}
❤️ *Vida:* ${player.health}/${player.maxHealth}

👹 *Monstruo:* ${monster.name}
💔 *Vida del monstruo:* ${monster.health}/${monster.maxHealth}

¿Qué acción deseas realizar?
    `;

    const buttons = [
      { buttonId: 'attack', buttonText: { displayText: '⚔️ Atacar' }, type: 1 },
      { buttonId: 'heal', buttonText: { displayText: '💊 Curar' }, type: 1 },
      { buttonId: 'defend', buttonText: { displayText: '🛡️ Defender' }, type: 1 },
      { buttonId: 'run', buttonText: { displayText: '🏃 Huir' }, type: 1 },
    ];

    await conn.sendMessage(chatId, {
      text: gameMessage,
      buttons,
      footer: 'Elige una opción:',
    });
  };

  // Función para manejar las acciones
  const handleAction = async (action) => {
    let message = '';

    switch (action) {
      case 'attack':
        const playerDamage = player.attack();
        const monsterDamage = monster.attack();

        monster.health -= playerDamage;
        player.health -= monsterDamage;

        if (monster.health <= 0) {
          message = `🎉 ¡Has derrotado al ${monster.name}!\n\nGracias por jugar.`;
          await conn.sendMessage(chatId, { text: message });
          return;
        }

        if (player.health <= 0) {
          message = `💀 Has sido derrotado por el ${monster.name}.\n\nGracias por jugar.`;
          await conn.sendMessage(chatId, { text: message });
          return;
        }

        message = `⚔️ Atacaste al ${monster.name} e infligiste ${playerDamage} de daño.\n👹 El ${monster.name} te infligió ${monsterDamage} de daño.\n\n❤️ *Tu vida:* ${player.health}\n💔 *Vida del monstruo:* ${monster.health}`;
        break;

      case 'heal':
        const healAmount = player.heal();
        player.health = Math.min(player.maxHealth, player.health + healAmount);
        const monsterDamageHeal = monster.attack();
        player.health -= monsterDamageHeal;

        if (player.health <= 0) {
          message = `💀 Has sido derrotado por el ${monster.name}.\n\nGracias por jugar.`;
          await conn.sendMessage(chatId, { text: message });
          return;
        }

        message = `💊 Te curaste ${healAmount} puntos de vida.\n👹 El ${monster.name} te infligió ${monsterDamageHeal} de daño.\n\n❤️ *Tu vida:* ${player.health}`;
        break;

      case 'defend':
        const reducedDamage = Math.floor(monster.attack() / 2);
        player.health -= reducedDamage;

        if (player.health <= 0) {
          message = `💀 Has sido derrotado por el ${monster.name}.\n\nGracias por jugar.`;
          await conn.sendMessage(chatId, { text: message });
          return;
        }

        message = `🛡️ Te defendiste y recibiste solo ${reducedDamage} de daño.\n\n❤️ *Tu vida:* ${player.health}`;
        break;

      case 'run':
        message = `🏃 Huiste del ${monster.name}.\n\nGracias por jugar.`;
        await conn.sendMessage(chatId, { text: message });
        return;

      default:
        message = 'Acción no válida.';
    }

    await updateGame();
    await conn.sendMessage(chatId, { text: message });
  };

  // Actualizar el juego inicialmente
  await updateGame();

  // Manejo de botones
  conn.on('button', async (button) => {
    const action = button.buttonId;
    await handleAction(action);
  });
};

// Configuración del comando
handler.help = ['battle'];
handler.command = ['battle', 'game'];
handler.tags = ['game'];
handler.register = true;

export default handler;