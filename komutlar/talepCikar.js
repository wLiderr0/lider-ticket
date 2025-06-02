module.exports = {
  name: "talep-cikar",
  async execute(message, args) {
    const member = message.mentions.members.first();
    if (!member) return message.reply("❌ Lütfen çıkarmak istediğin kullanıcıyı etiketle.");

    if (!message.channel.name.startsWith("talep-")) {
      return message.reply("❌ Bu komutu sadece talep kanallarında kullanabilirsin.");
    }

    try {
      await message.channel.permissionOverwrites.delete(member.id);
      message.reply(`✅ ${member} başarıyla talepten çıkarıldı.`);
    } catch (err) {
      console.error(err);
      message.reply("❌ Kullanıcı çıkarılırken bir hata oluştu.");
    }
  }
};
