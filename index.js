console.log("TOKEN existe?", !!process.env.TOKEN);

// ================================
// EXPRESS (necessário para Render)
// ================================
const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot está rodando!");
});

app.listen(PORT, () => {
  console.log("Servidor web iniciado na porta " + PORT);
});

// ================================
// DISCORD BOT
// ================================
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

// Verificação de segurança
if (!process.env.TOKEN) {
  console.error("TOKEN não encontrado nas variáveis de ambiente!");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`Bot online como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  try {
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

    let descricao = embed.description || "";

    if (!descricao && embed.fields && embed.fields.length > 0) {
      descricao = embed.fields.map(f => f.value).join(" ");
    }

    const footer = embed.footer?.text || "";

    const jogadorMatch = descricao.match(/\*\*Jogador\*\*:\s*([^\n]+)/i);
    const jogador = jogadorMatch ? jogadorMatch[1].trim() : "";

    const dataMatch = footer.match(/Data e hora:\s*(.+)/);
    const dataHora = dataMatch ? dataMatch[1].trim() : "";

    const gunpowder = Number(descricao.match(/gunpowder\s*(\d+)/i)?.[1] || 0);
    const special = Number(descricao.match(/specialprojectile\s*(\d+)/i)?.[1] || 0);
    const rifle = Number(descricao.match(/rifleprojectile\s*(\d+)/i)?.[1] || 0);
    const sub = Number(descricao.match(/subprojectile\s*(\d+)/i)?.[1] || 0);
    const pistol = Number(descricao.match(/pistolprojectile\s*(\d+)/i)?.[1] || 0);

    console.log("Meta detectada:", {
      jogador,
      dataHora,
      gunpowder,
      special,
      rifle,
      sub,
      pistol
    });

    await axios.post(
      "https://script.google.com/macros/s/AKfycbzxwQGwwl-WSL2ZlFgfOoTSoRHTKkxNz2OF778qBfCWeQXfhUFk5UN9UAcqZYtUdN3B/exec",
      {
        dataHora,
        jogador,
        gunpowder,
        specialprojectile: special,
        rifleprojectile: rifle,
        subprojectile: sub,
        pistolprojectile: pistol
      }
    );

    console.log("Enviado para planilha com sucesso!");
  } catch (error) {
    console.error("Erro no processamento da mensagem:", error.message);
  }
});

// ================================
// LOGIN
// ================================
client.login(process.env.TOKEN)
  .then(() => console.log("Login realizado com sucesso"))
  .catch(err => {
    console.error("Erro ao logar no Discord:", err);
    process.exit(1);
  });