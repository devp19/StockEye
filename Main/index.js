require('dotenv').config();

const {
  Client,
  IntentsBitField,
  ActivityType,
  GuildChannel,
  Guild,
  EmbedBuilder,
} = require('discord.js');

const { spawn } = require('child_process');
const { isUtf8 } = require('buffer');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on('ready', () => {
  console.log(`${client.user.tag} is online.`);

  client.user.setActivity({
    name: 'the stock market!',
    type: ActivityType.Watching,
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'new-following') {
    let tickerName = interaction.options.get('stock-ticker').value;
    console.log(tickerName);

    let companyName = interaction.options.get('company-name').value;
    console.log(companyName);

    if (
      interaction.guild.channels.cache.find(
        (channel) => channel.name === tickerName
      )
    ) {
      const channel = interaction.guild.channels.cache.find(
        (channel) => channel.name === tickerName
      );

      const channelMention = `<#${channel.id}>`;
      interaction.reply(`${channelMention} is already in your portfolio!`);
      return;
    }
    try {
      const category = await interaction.guild.channels.create({
        name: companyName,
        type: 4,
      });

      const channel = await interaction.guild.channels.create({
        name: tickerName,
        type: 0,
        parent: category,
      });

      const newsChannel = await interaction.guild.channels.create({
        name: `${tickerName} news`,
        type: 0,
        parent: category,
      });
      await interaction.reply(
        `Successfully added ${companyName} to your portfolio!`
      );
    } catch (error) {
      interaction.reply('Error creating channel');
    }
  }

  if (interaction.commandName === 'company-info') {
    try {
      let compTicker = interaction.options.get('company-ticker').value;

      const childPython = spawn('python', ['src\\companyInfo.py', compTicker]);

      childPython.stdout.on('data', async (data) => {
        try {
          const jsonStr = data.toString().replace(/'/g, '"');
          //console.log(jsonStr);
          const jsonData = JSON.parse(jsonStr);
          const information = jsonData.Information;
          const company = jsonData.Company;

          const CompanyEmbed = {
            color: 0xffffff,
            title: company,
            author: {
              name: 'StockEye',
              icon_url: 'https://i.imgur.com/V1mZg4L.png',
            },
            description: information,

            // fields: [
            //   {
            //     name: 'Stock Price',
            //     value: price,
            //   },
            //   {
            //     name: 'Stock Change (Day)',
            //     value: change,
            //   },
            // ],
            timestamp: new Date().toISOString(),
            footer: {
              text: 'Information from SeekingAlpha',
              icon_url:
                'https://images.crunchbase.com/image/upload/c_lpad,h_256,w_256,f_auto,q_auto:eco,dpr_1/hhzuhhfkmi6ioanafv3q',
            },
          };

          //console.log(company, price, change)
          //await interaction.reply(jsonStr);
          await interaction.reply({ embeds: [CompanyEmbed] });
        } catch (error) {
          interaction.reply(
            `No data available for $${compTicker}! Try another stock.`
          );
          return;
        }
      });
    } catch (error) {
      interaction.reply('Error fetching company information! Try again later.');
    }
  }

  if (interaction.commandName === 'market-data') {
    //prettier-ignore
    try {
        let stock = String(interaction.channel.name);
        const childPython = spawn('python', ['src\\marketData.py', stock]);

        console.log('data sent to python', stock);

        childPython.stdout.on('data', async (data) => {
          const jsonStr = data.toString().replace(/'/g, '"');
          const jsonData = JSON.parse(jsonStr)
          const company = jsonData.Company;
          const price = jsonData.Price;
          const change = jsonData.Change;
          //const information = jsonData.Information;

          //console.log(information)

          const isNegative = (/^-\d/.test(change))

          var color = isNegative ? 0xff0000 : 0x7EF27E;

          const StockEmbed = {
            color: color,
            title: company,
            author: {
              name: 'StockEye',
              icon_url: 'https://i.imgur.com/V1mZg4L.png',
            },
            description: "Recent Day Market Data",
            
            fields: [
              {
                name: 'Stock Price',
                value: price,
              },
              {
                name: 'Stock Change (Day)',
                value: change,
              },
            ],
            timestamp: new Date().toISOString(),
            footer: {
              text: 'Data from SeekingAlpha',
              icon_url:
                'https://images.crunchbase.com/image/upload/c_lpad,h_256,w_256,f_auto,q_auto:eco,dpr_1/hhzuhhfkmi6ioanafv3q',
            },
          };
          
          //console.log(company, price, change)
          //await interaction.reply(jsonStr);
          await interaction.reply({ embeds: [StockEmbed] })
        });
      } catch (error) {
        interaction.reply('Error fetching data! Try again later.');
      }
  }
});

client.on('messageCreate', (message) => {
  if (message.author.bot) {
    return;
  }

  if (message.content === 'hello') {
    message.reply(`Hey, ${message.author.username}!`);
  }
});

//general.send({ embeds: [exampleEmbed] });

client.login(process.env.TOKEN);
