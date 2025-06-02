const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: "talep",
  async execute(message, args, client) {
    if (args[0] === "gonder") {
      const embed = new EmbedBuilder()
        .setTitle("Destek Talep Sistemi")
        .setDescription(`
       Talep açtığınızda, birisi bakabilirmi, merhaba, selam, gibi ifadeler kullanmak yerine direkt olarak sorununuzu belirtirseniz sizinle daha çabuk iletişim kurabiliriz.

       Ek olarak, Destek açtığınız zaman ayrı olarak yetkililere etiket atmanıza gerek yok, zaten aktif olarak talepler ile ilgilenmekteyiz. Etiket atarak sadece meşgul etmiş olursunuz.
       
       Destek taleplerinde sergileyeceğiniz, üslupsuzluk, hakaret, tehdit gibi davranışlarda yetkililerin destek talebini sonlandırma hakkı mevcuttur.`)
        .setImage("https://i.postimg.cc/zvg8gqQF/minecraft-title.png")
        .setColor("Purple");

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId("talep_ac")
            .setLabel("📨 Talep Aç")
            .setStyle(ButtonStyle.Primary)
        );

      const kanal = client.channels.cache.get(config.talepKanalId);
      if (kanal) kanal.send({ embeds: [embed], components: [row] });
      message.reply("✅ Talep mesajı gönderildi.");
    }
  }
};
