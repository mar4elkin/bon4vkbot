// ------------------------------- Session ----------------------------------------- //
class Session {
  constructor(settings) {
    Object.assign(this, {
      store: new Map(),
      key: 'session',
      getSessionKey: (ctx) => {
        const userId = ctx.message.from_id || ctx.message.user_id;

        return `${userId}:${userId}`;
      },
    }, settings);
  }

  middleware() {
    return (ctx, next) => {
      const key = this.getSessionKey(ctx);
      let session = this.store.get(key) || {};

      Object.defineProperty(ctx, this.key, {
        get: () => session,
        set: (value) => {
          session = value;
        },
      });

      this.store.set(key, session);

      next();
    };
  }
}

module.exports = Session;
// ------------------------------- Markup ----------------------------------------- //
const KEYBOARD_COLUMNS_MAX = 4;

class Markup {
  keyboard(buttons, options = { columns: KEYBOARD_COLUMNS_MAX }) {
    this.__keyboard = {
      buttons: Array.isArray(buttons[0])
        ? buttons
        : buttons.reduce((array, label) => {
          const button = Markup.button(label);
          const buttons = array.length ? array[array.length - 1] : array[0];

          if (buttons && buttons.length < options.columns) {
            buttons.push(button);
          } else {
            array.push([button]);
          }

          return array;
        }, []),
    };

    return this;
  }

  oneTime(value = true) {
    this.__keyboard.one_time = value;

    return this;
  }

  toJSON() {
    return JSON.stringify(this.__keyboard);
  }

  static keyboard(keyboard, options) {
    return new Markup().keyboard(keyboard, options);
  }

  static button(label, color = 'default', payload = { button: label }) {
    if (typeof label === 'object') {
      return label;
    }

    return {
      action: {
        type: 'text',
        payload: JSON.stringify(payload),
        label,
      },
      color,
    };
  }
}

module.exports = Markup;


// ------------------------------- api ----------------------------------------- //

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "bon4"
});

const VkBot = require('node-vk-bot-api')

const bot = new VkBot(process.env.TOKEN = '1292b207641168a503351dce59c9798aa469bcb68d6dea84a26e2d0b1c901b45ce7a862f6fd9296c0802b')

// ------------------------------ users ----------------------------------------- //

const session = new Session();

bot.use(session.middleware());

// ------------------------- main code here ------------------------------------- //

bot.command('/info', (ctx) => {
  ctx.reply('Слепил -> mar4elkin @derpyhowes')
});

bot.command('/start', (ctx) => {
  ctx.reply('Привет, ты идешь завтра на пары?!', null, Markup
    .keyboard([
      'Да',
      'Нет',
      'Пидора ответ',
    ])
    .oneTime())
});

bot.command('/stats', (ctx) => {
    con.query("SELECT * FROM users", function (err, result, fields){
    if (err) throw err;
    ctx.reply(JSON.stringify(result))
    //console.log(result);
  });
})


bot.command('/pashalox_markpidor', (ctx) => {
  ctx.reply("Таблица очищена")
  con.query("TRUNCATE `bon4`.`users`");

})


bot.command('Да', (ctx) => {
  ctx.reply('Окей, будем ждать!')
  const userId = ctx.message.from_id || ctx.message.user_id;
  var answer = 1;

  bot.execute("users.get", { user_ids: userId }, (result) => {
    //con.query('INSERT INTO users (vk_id, answer) VALUES ('+result+', '+answer+')');
    let result_name = result.find(item => item.id == userId);
    let user_name = result_name.first_name;
    let user_surname = result_name.last_name;
    let usr = user_name + " " + user_surname;
    var day = new Date();


    con.query("INSERT INTO users (vk_id, answer, date) VALUES ('"+usr+"', '"+answer+"', '"+day+"')");
  })



})

bot.command('Нет', (ctx) => {
  ctx.reply('Жаль, ну хоть послезавтра приди!')
  const userId = ctx.message.from_id || ctx.message.user_id;
  var answer = 0;

  bot.execute("users.get", { user_ids: userId }, (result) => {
    //con.query('INSERT INTO users (vk_id, answer) VALUES ('+result+', '+answer+')');
    let result_name = result.find(item => item.id == userId);
    let user_name = result_name.first_name;
    let user_surname = result_name.last_name;
    let usr = user_name + " " + user_surname;
    var day = new Date();


    con.query("INSERT INTO users (vk_id, answer, date) VALUES ('"+usr+"', '"+answer+"', '"+day+"')");
  })


})

bot.command('Пидора ответ', (ctx) => {
  ctx.reply('https://vk.com/aysaki?z=video186648036_456239194%2Fvideos461610309%2Fpl_461610309_-2')
})


bot.startPolling(() => {
  console.log('Bot started.')

    bot.on((ctx) => {
    ctx.reply('Вот список доступных команд', null, Markup
      .keyboard([
        '/start',
        '/stats',
        '/info',
      ])
      .oneTime())
  })
})
