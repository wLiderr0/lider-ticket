// === Dosya: index.js ===
const { Client, GatewayIntentBits, Partials, Collection, Events } = require("discord.js");
const fs = require("fs");
const config = require("./config.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

client.commands = new Collection();

// Komutları yükle
const commandFiles = fs.readdirSync("./komutlar").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./komutlar/${file}`);
  client.commands.set(command.name, command);
}

// Prefix komutlar
client.on("messageCreate", async message => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);
  if (command) command.execute(message, args, client);
});

// Interaksiyonlar (butonlar, modal)
client.on("interactionCreate", async interaction => {
  if (interaction.isButton()) {
    if (interaction.customId === "talep_ac") {
      const {
        ModalBuilder,
        TextInputBuilder,
        TextInputStyle,
        ActionRowBuilder
      } = require("discord.js");

      const modal = new ModalBuilder()
        .setCustomId("talep_formu")
        .setTitle("Talep Sebebi");

      const sebepInput = new TextInputBuilder()
        .setCustomId("sebep")
        .setLabel("Talep sebebiniz?")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const row = new ActionRowBuilder().addComponents(sebepInput);
      modal.addComponents(row);
      await interaction.showModal(modal);
    }

    if (interaction.customId === "devral") {
      if (!interaction.member.roles.cache.has(config.yetkiliRolId)) {
        return interaction.reply({ content: "❌ Bu butonu sadece yetkililer kullanabilir.", ephemeral: true });
      }

      const row = interaction.message.components[0];
      const newRow = row.components.map(button => {
        if (button.customId === "devral") {
          return require("discord.js").ButtonBuilder.from(button).setDisabled(true);
        }
        return button;
      });

      await interaction.update({ components: [new (require("discord.js").ActionRowBuilder)().addComponents(newRow)] });
      await interaction.channel.send(`Bu talebi <@${interaction.user.id}> adlı yetkili devraldı sizinle ilgilenecek.`);
    }

    if (interaction.customId === "kapat") {
      await interaction.channel.send("Bu talep 5 saniye içinde kapatılacak...");
      setTimeout(async () => {
        const logChannel = interaction.guild.channels.cache.get(config.logKanalId);
        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const logs = messages.map(m => `${m.author.tag}: ${m.content}`).reverse().join("\n");

        if (logChannel) {
          logChannel.send({ content: `Ticket Log: \`${interaction.channel.name}\``, files: [{ attachment: Buffer.from(logs), name: `${interaction.channel.name}.txt` }] });
        }

        await interaction.channel.delete();
      }, 5000);
    }
  }

  if (interaction.isModalSubmit() && interaction.customId === "talep_formu") {
    const sebep = interaction.fields.getTextInputValue("sebep");

    const kanal = await interaction.guild.channels.create({
      name: `talep-${interaction.user.username}`,
      type: 0,
      parent: config.kategoriId,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: ["ViewChannel"]
        },
        {
          id: interaction.user.id,
          allow: ["ViewChannel", "SendMessages"]
        },
        {
          id: config.yetkiliRolId,
          allow: ["ViewChannel", "SendMessages"]
        }
      ]
    });

    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

    const embed = new EmbedBuilder()
      .setTitle("Talebinize Hoşgeldiniz")
      .setThumbnail(interaction.user.displayAvatarURL({dynamic: true, size: 128}))
      .setDescription(`Talep **${sebep}** Kategorisinde başarıyla oluşturuldu. Yetkililer aktif olduğunda size geri dönüş sağlayacaklardır. Lütfen isteğinizi dile getirin ve etiket atmadan yetkililerin talebe bakmasını bekleyin.
        
        💢 Lütfen talepteki üslubunuza dikkat edin aksi takdirde yetkili ekibin talebi sonlandırma hakkı mevcuttur.`)
      .setImage("https://i.postimg.cc/zvg8gqQF/minecraft-title.png")
      .setColor("Purple")
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("devral").setLabel("📌 Talebi Devral").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("kapat").setLabel("🗑️ Talebi Kapat").setStyle(ButtonStyle.Danger)
    );

    kanal.send({ content: `Merhaba <@${interaction.user.id}>, talebin burada! <@&${config.yetkiliRolId}> seninle ilgilenecek.`, embeds: [embed], components: [row] })
  .then(msg => msg.pin());

    await interaction.reply({ content: "✅ Talebiniz açıldı.", ephemeral: true });
  }
});

// ready.js gibi eventleri yükle
const path = require("path");
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}


client.login(config.token);
