module.exports = {
  name: "talep-ekle",
  async execute(message, args) {
    const member = message.mentions.members.first();
    if (!member) return message.reply("❌ Lütfen eklemek istediğin kullanıcıyı etiketle.");

    if (!message.channel.name.startsWith("talep-")) {
      return message.reply("❌ Bu komutu sadece talep kanallarında kullanabilirsin.");
    }

    try {
      await message.channel.permissionOverwrites.create(member.id, {
        ViewChannel: true,
        SendMessages: true
      });
      message.reply(`✅ ${member} başarıyla talebe eklendi.`);
    } catch (err) {
      console.error(err);
      message.reply("❌ Kullanıcı eklenirken bir hata oluştu.");
    }
  }
};
