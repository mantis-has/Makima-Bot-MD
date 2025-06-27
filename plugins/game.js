const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid;
  const command = args[0]?.toLowerCase();

  if (!command || command === 'menu') {
    // Menú central de juegos
    const menuMessage = `
🎮 *Menú de Juegos* 🎮

1️⃣ *Piedra, Papel o Tijera*: \`game rps\`
2️⃣ *Adivina el Número*: \`game guess\`
3️⃣ *Tic Tac Toe*: \`game tictactoe\`
4️⃣ *Batalla RPG*: \`game rpg\`
5️⃣ *Trivia*: \`game trivia\`

Usa los comandos para iniciar uno de los juegos. Ejemplo: \`game rps\`.
    `;

    await conn.sendMessage(chatId, {
      text: menuMessage,
    });
    return;
  }

  // Piedra, Papel o Tijera
  if (command === 'rps') {
    const buttons = [
      { buttonId: 'rock', buttonText: { displayText: '🪨 Piedra' }, type: 1 },
      { buttonId: 'paper', buttonText: { displayText: '📄 Papel' }, type: 1 },
      { buttonId: 'scissors', buttonText: { displayText: '✂️ Tijera' }, type: 1 },
    ];

    await conn.sendMessage(chatId, {
      text: '🎮 *Piedra, Papel o Tijera* 🎮\n\nElige tu opción:',
      buttons,
      footer: '¡Juega ahora!',
    });

    conn.on('button', async (button) => {
      const userChoice = button.buttonId;
      const choices = ['rock', 'paper', 'scissors'];
      const botChoice = choices[Math.floor(Math.random() * choices.length)];

      let result = '';
      if (userChoice === botChoice) {
        result = '🤝 Empate 🤝';
      } else if (
        (userChoice === 'rock' && botChoice === 'scissors') ||
        (userChoice === 'paper' && botChoice === 'rock') ||
        (userChoice === 'scissors' && botChoice === 'paper')
      ) {
        result = '🎉 ¡Ganaste! 🎉';
      } else {
        result = '💔 Perdiste 💔';
      }

      await conn.sendMessage(chatId, {
        text: `🎮 *Resultado:*\n\n🧍 Tú: ${userChoice}\n🤖 Bot: ${botChoice}\n\n${result}`,
      });
    });
    return;
  }

  // Adivina el Número
  if (command === 'guess') {
    const secretNumber = Math.floor(Math.random() * 100) + 1;
    let attempts = 0;

    const buttons = [
      { buttonId: 'guess', buttonText: { displayText: '🎲 Adivinar' }, type: 1 },
    ];

    await conn.sendMessage(chatId, {
      text: '🎮 *Adivina el Número* 🎮\n\nHe pensado un número entre 1 y 100. ¿Puedes adivinarlo?',
      buttons,
      footer: '¡Escribe tu elección!',
    });

    conn.on('message', async (message) => {
      const userGuess = parseInt(message.text);
      attempts++;
      let result = '';

      if (userGuess === secretNumber) {
        result = `🎉 ¡Correcto! 🎉\nIntentos usados: ${attempts}`;
        await conn.sendMessage(chatId, { text: result });
        return;
      } else if (userGuess > secretNumber) {
        result = '🔻 Muy alto 🔻';
      } else {
        result = '🔺 Muy bajo 🔺';
      }

      await conn.sendMessage(chatId, {
        text: `🎮 *Resultado:*\n\nIntento ${attempts}: ${result}`,
      });
    });
    return;
  }

  // Tic Tac Toe
  if (command === 'tictactoe') {
    const board = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']; // 3x3 tablero inicial

    const renderBoard = () => `
      ${board[0]} | ${board[1]} | ${board[2]}
      ---------
      ${board[3]} | ${board[4]} | ${board[5]}
      ---------
      ${board[6]} | ${board[7]} | ${board[8]}
    `;

    const buttons = board.map((cell, index) => ({
      buttonId: `cell_${index}`,
      buttonText: { displayText: cell === ' ' ? `⏺️` : cell },
      type: 1,
    }));

    await conn.sendMessage(chatId, {
      text: `🎮 *Tic Tac Toe* 🎮\n\n${renderBoard()}\n\nElige tu movimiento:`,
      buttons,
      footer: '¡Juega ahora!',
    });

    // Implementar lógica de Tic Tac Toe (Por simplicidad, en desarrollo)
    await conn.sendMessage(chatId, {
      text: '🎮 *Tic Tac Toe* está en desarrollo.\n¡Próximamente!',
    });
    return;
  }

  // Batalla RPG
  if (command === 'rpg') {
    await conn.sendMessage(chatId, {
      text: '🎮 *Batalla RPG* está en desarrollo.\n¡Próximamente!',
    });
    return;
  }

  // Trivia
  if (command === 'trivia') {
    const questions = [
      { question: '¿Cuál es la capital de Francia?', answer: 'París' },
      { question: '¿Quién escribió "Don Quijote"?', answer: 'Miguel de Cervantes' },
      { question: '¿En qué año llegó el hombre a la luna?', answer: '1969' },
    ];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

    await conn.sendMessage(chatId, {
      text: `🎮 *Trivia* 🎮\n\nPregunta: ${randomQuestion.question}`,
    });

    conn.on('message', async (message) => {
      const userAnswer = message.text.toLowerCase();
      if (userAnswer === randomQuestion.answer.toLowerCase()) {
        await conn.sendMessage(chatId, {
          text: '🎉 ¡Correcto! 🎉',
        });
      } else {
        await conn.sendMessage(chatId, {
          text: '❌ Incorrecto. Intenta de nuevo.',
        });
      }
    });
    return;
  }

  // Comando no reconocido
  await conn.sendMessage(chatId, {
    text: `❌ Juego no reconocido: \`${command}\`\nUsa \`game menu\` para ver los juegos disponibles.`,
  });
};

// Configuración del comando
handler.help = ['game <nombre>'];
handler.command = ['game'];
handler.tags = ['game'];
handler.register = true;

export default handler;