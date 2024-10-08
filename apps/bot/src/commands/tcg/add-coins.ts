import { ErrorCode, ErrorMessages } from '@discord-bot/error-handler';
import { api, Response } from '../../api';
import { TRPCClientError } from '@trpc/client';
import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

enum Option {
  user = 'usuario',
  amount = 'cantidad',
}

const command = {
  data: new SlashCommandBuilder()
    .setName('add-coins')
    .setDescription('Da monedas a otro jugador')
    .addUserOption((option) =>
      option.setName(Option.user).setDescription('Usuario al que deseas dar monedas').setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName(Option.amount)
        .setDescription('Cantidad de monedas que deseas dar')
        .setRequired(true)
        .setMinValue(1),
    ),
  execute: async (interaction: CommandInteraction) => {
    const discordId = interaction.options.get(Option.user, true).user?.id;
    const coins = interaction.options.get(Option.amount, true).value as string;

    try {
      await interaction.deferReply();

      // Check if user exists
      if (!discordId) {
        await interaction.editReply(ErrorMessages.UserNotFound);
        return;
      }

      const user = await api.card.addCoins.mutate({ discordId, amount: parseInt(coins) });

      if (user?.status === Response.ERROR) await interaction.editReply(ErrorMessages[user.message as ErrorCode]);

      if (user?.result && user.result.coins) {
        const response = `🎉 ¡Has dado ${coins} monedas a <@${discordId}>! 🎉\n`;
        await interaction.editReply(response);
      } else {
        await interaction.editReply(ErrorMessages.NoCoins);
      }
    } catch (error) {
      if (error instanceof TRPCClientError) await interaction.editReply(ErrorMessages[error.message as ErrorCode]);
      await interaction.editReply(ErrorMessages.Unknown);
    }
  },
};

export default command;
