// utils/notifications/discord.ts

export async function notifyDiscordModeration(nickname: string, content: string, slug: string, postType: string) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    
    // Si no hay URL configurada (ej. en desarrollo), cancelamos silenciosamente
    if (!webhookUrl) return;
  
    const urlDelSitio = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const urlPost = `${urlDelSitio}/${postType === 'news' ? 'noticias' : 'reviews'}/${slug}`;
  
    // Formato Embed de Discord
    const payload = {
      embeds: [
        {
          title: "🚨 Nuevo comentario pendiente",
          color: 16753920, // Color naranja (código decimal)
          fields: [
            { name: "Usuario", value: `**${nickname}**`, inline: true },
            { name: "Post", value: `[Ver Artículo](${urlPost})`, inline: true },
            { name: "Mensaje", value: `> ${content}` }
          ],
          footer: { text: "Requiere moderación en el Panel Admin" },
          timestamp: new Date().toISOString(),
        }
      ]
    };
  
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Error enviando notificación a Discord:", error);
    }
  }