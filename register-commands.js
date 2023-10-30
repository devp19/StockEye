require('dotenv').config();

const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
  {
    name: 'new-following',
    description: 'create a new folder for your ticker/company!',
    options: [
      {
        name: 'company-name',
        description: 'company name!',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: 'stock-ticker',
        description: 'ticker-symbol, exclude $',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  {
    name: 'market-data',
    description:
      'provides up-to-date market data for the ongoing day trading market!',
  },

  {
    name: 'company-info',
    description: 'provides company background/information!',
    options: [
      {
        name: 'company-ticker',
        description: 'ticker-symbol of the company, exclude $',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('registering slash commands....');
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );
    console.log('Slash commands were registered');
  } catch (error) {
    console.log(`There was an error ${error}`);
  }
})();
