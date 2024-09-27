import { ActivityType, Client } from 'discord.js';

export const onReady = (client: Client) => {
  console.log(`Bot is online! Logged in as ${client.user?.tag}`);

  client.user?.setPresence({
    activities: [{ name: 'Helping users!', type: ActivityType.Playing }],
    status: 'online',
  });
};