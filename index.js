// Servidor fake só para o Render não derrubar
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot está rodando!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor web iniciado na porta " + PORT);
});

const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`Bot online como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {

  // Apenas mensagens de webhook
  if (!message.webhookId) return;
  if (!message.embeds.length) return;

  const embed = message.embeds[0];

  console.log("------ DEBUG EMBED ------");
console.log("TITLE:", embed.title);
console.log("DESCRIPTION:", embed.description);
console.log("FIELDS:", embed.fields);
console.log("--------------------------");

  if (!embed.title || !embed.title.includes("Meta entregue")) return;

  // 🔥 Pega description primeiro, se não existir pega fields
  let descricao = embed.description || "";

  if (!descricao && embed.fields && embed.fields.length > 0) {
    descricao = embed.fields.map(f => f.value).join(" ");
  }

  const footer = embed.footer?.text || "";

  // 🎯 Regex jogador
  const jogadorMatch = descricao.match(/\*\*Jogador\*\*:\s*([^\n]+)/i);
  const jogador = jogadorMatch ? jogadorMatch[1].trim() : "";

  // 🎯 Data
  const dataMatch = footer.match(/Data e hora:\s*(.+)/);
  const dataHora = dataMatch ? dataMatch[1].trim() : "";

  // 🎯 Projetéis
  const gunpowderMatch = descricao.match(/gunpowder\s*(\d+)/i);
  const specialMatch = descricao.match(/specialprojectile\s*(\d+)/i);
  const rifleMatch = descricao.match(/rifleprojectile\s*(\d+)/i);
  const subMatch = descricao.match(/subprojectile\s*(\d+)/i);
  const pistolMatch = descricao.match(/pistolprojectile\s*(\d+)/i);

  const gunpowder = gunpowderMatch ? Number(gunpowderMatch[1]) : 0;
  const special = specialMatch ? Number(specialMatch[1]) : 0;
  const rifle = rifleMatch ? Number(rifleMatch[1]) : 0;
  const sub = subMatch ? Number(subMatch[1]) : 0;
  const pistol = pistolMatch ? Number(pistolMatch[1]) : 0;

  console.log("Meta detectada:");
  console.log({
    jogador,
    dataHora,
    special,
    rifle,
    sub,
    pistol
  });

  try {
    await axios.post("https://script.google.com/macros/s/AKfycbzxwQGwwl-WSL2ZlFgfOoTSoRHTKkxNz2OF778qBfCWeQXfhUFk5UN9UAcqZYtUdN3B/exec", {
      dataHora,
      jogador,
      gunpowder: gunpowder,
      specialprojectile: special,
      rifleprojectile: rifle,
      subprojectile: sub,
      pistolprojectile: pistol
    });

    console.log("Enviado para planilha com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar para planilha:", error.response?.data || error.message);
  }

});

// COLOQUE SEU TOKEN AQUI
client.login(process.env.TOKEN);