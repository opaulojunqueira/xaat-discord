const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const openaiApiKey = 'TOKEN_OPENAI';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

async function enviarMensagemParaChatGPT(params) {
  try {
    const resposta = await openai.chat.completions.create(params);
    return resposta.choices[0].message.content;
  } catch (error) {
    console.error('Erro ao enviar mensagem para o OpenAI:', error);
    throw error;
  }
}

client.on('ready', () => {
  console.log('Bot is ready!');

  client.application.commands.create({
    name: 'chat',
    description: 'Comunica com o ChatGPT',
    options: [
      {
        name: 'mensagem',
        description: 'A mensagem para enviar ao ChatGPT',
        type: 3,
        required: true,
      },
    ],
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'chat') {
    try {
      const mensagemUsuario = interaction.options.getString('mensagem');

      await interaction.deferReply();

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ 'role': 'user', 'content': `${mensagemUsuario}` }],
        temperature: 0.9,
        max_tokens: 2000,
      }, {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
        },
      });

      let reply = response.data.choices[0].message['content'];

      const characterLimit = 1980;
      if (reply.length > characterLimit) {
        const chunks = reply.match(/[\s\S]{1,1980}/g) || [];
        for (const chunk of chunks) {
          await interaction.followUp({ content: chunk });
        }
      } else {
        await interaction.followUp({ content: reply });
      }
    } catch (error) {
      console.log(error);
    }
  }
});

client.login('TOKEN_DISCORD_BOT');
