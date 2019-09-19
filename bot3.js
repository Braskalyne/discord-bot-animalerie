const { Client, Util } = require('discord.js');
const { TOKEN, PREFIX, GOOGLE_API_KEY } = require('./config');
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');

const client = new Client({ disableEveryone: true });

const youtube = new YouTube(GOOGLE_API_KEY);

const queue = new Map();




////////////////////////////////////// MORPION ////////////////////////////////////////////////////

var tictacgame, symbols = ["x","o"],  map = {}, nr;

class Command {

	constructor (message) {

		this._commandName = message.content.substring(1).split(' ')[0];
		this._argsNumber = message.content.substring(1).split(' ').length - 1;
		this._commandArgs = [];
		for(var i = 1; i <= this._argsNumber; i++ ){
			this._commandArgs[i-1] = message.content.substring(1).split(' ')[i];
		}
		this._commandChannel = message.channel.id;

	}

	doCommand (message) {

    	switch(this._commandName) {

			case 'morpion':

				if( this._argsNumber != 1) {

					message.reply("_morpion @<pseudo>");
					return;
				}

				var player2 = this._commandArgs[0].slice(2);
				player2 = player2.slice(0,player2.length - 1);

				var membersArray = message.guild.members.array();
				var player2IsMember = false;

				for(var i in membersArray){
					if(message.guild.members.array()[i].user.id === player2)
						player2IsMember = true;
				}

				// if(!player2IsMember){
				// 	message.reply("_morpion @<ddd>");
				// 	return;
				// }

				if(map[this._commandChannel]){

					message.reply("déjà lancé");
					return;

				}

				map[this._commandChannel] = new TicTacToe(message);
				map[this._commandChannel].startGame(message);
				break;

			case 'place':
				if(!map[message.channel.id]){
						message.reply("pas lancé");
						return;
					}
				if(message.content.substring(1).split(' ').length != 3 ||
						 ( message.content.substring(1).split(' ')[1] != 0 &&
						   message.content.substring(1).split(' ')[1] != 1 &&
						   message.content.substring(1).split(' ')[1] != 2
					) || ( message.content.substring(1).split(' ')[2] != 0 &&
						   message.content.substring(1).split(' ')[2] != 1 &&
						   message.content.substring(1).split(' ')[2] != 2
					)
				) {
					message.reply("doit etre entre 0 et 2");
				return;
				}
				else map[message.channel.id].playGame(message);
				break;
			break;
		}
	}
}

class Game {

	constructor (){
		this._gameChannel = 0;
		this._players = [];
	}

	startGame(message){}
	endGame(message){}
	playGame(message){}
}

class TicTacToe extends Game {

	constructor (message) {
		super();
		this._gameChannel = message.channel.id;
		this._players[0] = message.author.id;

		this._players[1] =  message.content.substring(1).split(' ')[1];
		this._players[1] = this._players[1].replace('!', '');


		this._turn = 0;
		this._gameBoard = [ [..."---"],
							[..."---"],
							[..."---"]
						  ];
	}

	startGame (message) {

		this._players[1] = this._players[1].slice(2,20);
		message.reply("lancé avec <@" + this._players[1] + "> _place <ligne> <colonne>");

		message.channel.send(this._gameBoard[0][0] + " " +
							 this._gameBoard[0][1] + " " +
							 this._gameBoard[0][2] + " \n" +
							 this._gameBoard[1][0] + " " +
							 this._gameBoard[1][1] + " " +
							 this._gameBoard[1][2] + " \n" +
							 this._gameBoard[2][0] + " " +
							 this._gameBoard[2][1] + " " +
							 this._gameBoard[2][2] + " ");
	}

	endGameWin (message) {

		for (var i in map){
			if(i==this._gameChannel && map[i] == "morpion")
				map[i] = "";
		}

		message.channel.send("<@" + this._players[this._turn] + "> win");

		map[this._gameChannel] = "";

		return true;

	}

	endGameDraw (message) {

		message.channel.send("egalité");

		map[this._gameChannel] = "";

		return true;

	}

	isItADraw () {
		for(var x=0;x<3;x++)
			for(var y=0;y<3;y++)
				if(this._gameBoard[x][y] == '-')
					return false;

		return true;
	}

	isItAWin (i,j) {
		if ((this._gameBoard[0][j] != '-' && this._gameBoard[0][j] == this._gameBoard[1][j] && this._gameBoard[1][j] == this._gameBoard[2][j]) ||
			(this._gameBoard[i][0] != '-' && this._gameBoard[i][0] == this._gameBoard[i][1] && this._gameBoard[i][1] == this._gameBoard[i][2]) ||
			(this._gameBoard[0][0] != '-' && this._gameBoard[0][0] == this._gameBoard[1][1] && this._gameBoard[1][1] == this._gameBoard[2][2]) ||
			(this._gameBoard[0][2] != '-' && this._gameBoard[0][2] == this._gameBoard[1][1] && this._gameBoard[1][1] == this._gameBoard[2][0]))
			return true;
		return false;
	}

	playGame (message) {

		if(message.author.id != this._players[this._turn]){
			message.reply("pas ton tour");
			return;
		}

		var i = message.content.substring(1).split(' ')[1];
		var j = message.content.substring(1).split(' ')[2];

		if(i <0 || i>2 || j<0 || j>2) {
			message.reply("doit etre entre 0 et 2");
			return;
		}

		if(this._gameBoard[i][j] != "-") {
			message.reply("déjà pris");
			return;
		}

		this._gameBoard[i][j] = symbols[this._turn];

		message.channel.send(this._gameBoard[0][0] + " " +
							 this._gameBoard[0][1] + " " +
							 this._gameBoard[0][2] + " \n" +
							 this._gameBoard[1][0] + " " +
							 this._gameBoard[1][1] + " " +
							 this._gameBoard[1][2] + " \n" +
							 this._gameBoard[2][0] + " " +
							 this._gameBoard[2][1] + " " +
							 this._gameBoard[2][2] + " ");

		this._turn = this._turn == 1 ? 0 : 1;

		if(this.isItADraw()){
			this.endGameDraw(message);
			return;
		}

		if(this.isItAWin(i,j)){
			this.endGameWin(message);
			return;
		}

		message.channel.send("<@" + this._players[this._turn] + ">, joue");
	}

}

client.on('message', async function(message) {

	if(message.author.bot) return;

	if (message.content.substring(0, 1) == '_') {
		var command = new Command(message);
		command.doCommand(message);
	}
});


////////////////////////////////////// MORPION ////////////////////////////////////////////////////


client.on('warn', console.warn);

client.on('error', console.error);

client.on('ready', () => {
	console.log('Yo this ready!')
  client.user.setActivity('C cho les bots Discord')
})

client.on('disconnect', () => console.log('déco'));

client.on('reconnecting', () => console.log('reco'));

client.on('message', async msg => { // eslint-disable-line

	// if (msg.isMentioned(client.user)) {
	// msg.reply(' Tu veux quoi tête d\'oeuf ?');
	// }

	if (msg.author.bot) return undefined;
	if (!msg.content.startsWith(PREFIX)) return undefined;

	const args = msg.content.split(' ');
	const searchString = args.slice(1).join(' ');
	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	const serverQueue = queue.get(msg.guild.id);
	const max = 100;
	const min = 1;
	const minBis = 70;

const mysql = require('mysql');

const mySqlClient = mysql.createConnection({
	host     : "localhost",
	user     : "root",
	password : "",
	database : "discord_bot"
});


/////////////////////////////////////////// POLL /////////////////////////////////////

	global.channel = msg.channel;
	global.embedColor = 0x0096FF;
	// const isMentioned = msg.users;
	// const commandName = message.content.substring(1).split(' ')[0];
	// const argsNumber = message.content.substring(1).split(' ').length - 1;
	// const commandArgs = [];
	//
	// for(var i = 1; i <= argsNumber; i++ ){
	// 	commandArgs[i-1] = message.content.substring(1).split(' ')[i];
	// }
	// commandChannel = message.channel.id;

	let command = msg.content.toLowerCase().split(' ')[0];
	command = command.slice(PREFIX.length)



		////////////////////////////////////// PUISSANCE 4 ////////////////////////////////////////////////



		function create_tbl(){
		    var foo = new Array(6)
		    for(var i=0;i<foo.length;i++){
		        foo[i] = new Array(7).fill(':black_circle:');
		    }
		    return foo
		}

		var tableau = [
			[':black_circle:',':large_blue_diamond:',':black_circle:',':black_circle:',':black_circle:',':black_circle:',':black_circle:'],
			[':black_circle:',':large_orange_diamond:',':black_circle:',':black_circle:',':black_circle:',':black_circle:',':black_circle:'],
			[':black_circle:',':black_circle:',':black_circle:',':black_circle:',':black_circle:',':black_circle:',':black_circle:'],
			[':black_circle:',':black_circle:',':black_circle:',':black_circle:',':black_circle:',':black_circle:',':black_circle:'],
			[':black_circle:',':black_circle:',':black_circle:',':black_circle:',':black_circle:',':black_circle:',':black_circle:'],
			[':black_circle:',':black_circle:',':black_circle:',':black_circle:',':black_circle:',':black_circle:',':black_circle:'],
		];
		const ligne = msg.content.split(' ')[1]
		const colonne = msg.content.split(' ')[2]

	if (command === 'p4') {
		// tableau = create_tbl();
		channel.send(tableau);


		channel.send(tableau[1][1]);
	}

function test(){
	var	p4p1 = ':large_orange_diamond:';
	var tabmodif = tableau.slice();

	const recup = tabmodif[ligne].splice(colonne, 1, p4p1);

	return tabmodif;
}

	if (command === 'p4place') {
		if (ligne && colonne) {

			var truc = test();

			channel.send(truc);
		}
	}
//
if (command === 'test') {
	var machin = test();

	channel.send(machin);

}









		////////////////////////////////////// PUISSANCE 4 ////////////////////////////////////////////////



	if (command === 'ping') {
		channel.send('pong');
	}

if (command === 'bl') {
	console.log('ok');
}
	if (command === 'try') {
		// ID pseudo
		// ID du chan ou moove
		msg.guild.members.get("250358629495078924").setVoiceChannel('388068963294248971')
		msg.delete();
	}

// id role cuba	<@&422104807172734978>
// id role gardav 423469261110116362

// get id de la personne a qui mettre le addRole
// addRole l'id du role a mettre (\@role)

if (command === 'truc') {
	msg.guild.members.get("180018298576961537").addRole('503877508387700756');
	msg.guild.members.get("180018298576961537").removeRole('503877508387700756');
}

	if (command === 'porc') {
		if (msg.content.split(' ')[1]) {
			var limit = parseInt(msg.content.split(' ')[1]);

		}
		else {
			var limit = 5;
		}

		mySqlClient.query('SELECT * FROM porc ORDER BY point DESC LIMIT ?', [limit], function (error, results, fields) {
			if (error) console.log(error);

			console.log(results);

			test = results.length;

			console.log(test);
				if ( results.length > 0 )  {
						var fields = [];

						for (var i = 0; i < results.length; i++) {
						    fields.push({
						        name: 'Top ' + (parseInt(i) + parseInt(1)) + ' ' + results[i]['pseudo'],
						        value: results[i]['point'] + ' points de porc'
						    });
						}

						channel.send({embed: {
							title: 'Classement',
				      color: embedColor,
							fields: fields,
				      footer: {
				        text: 'Classement des porcs'
				      }
				    }})
			  }

		});
	}


if (command === 'addm') {

	// console.log(msg.author)
		if (msg.content.split(' ')[1]) {
			var post  = {pseudo: msg.content.split(' ')[1]};

			if (msg.author.id === '180018298576961537' || msg.author.id === '177808741763252225') {

			var query = mySqlClient.query('INSERT INTO porc SET ?', post, function (error, results, fields) {
			  if (error) console.log(error);

				channel.send('Nouveau porc ajouté : ' + msg.content.split(' ')[1])

			});

		}
		else {
			msg.reply('Eh non')
		}
	}
	else {
		msg.reply('_addm <pseudo>');
	}
}


if (command == 'addp') {


			if (msg.content.split(' ')[1] && msg.content.split(' ')[2]) {
				if (msg.content.split(' ')[2] > 0 && msg.content.split(' ')[2] < 2147483647) {

					if (msg.author.id === '180018298576961537' || msg.author.id === '177808741763252225') {

					mySqlClient.query('SELECT * FROM `porc` WHERE `pseudo` = ?', [msg.content.split(' ')[1]], function (error, results, fields) {

						console.log(results);

						addpoint = parseInt(results[0]['point']) + parseInt(msg.content.split(' ')[2]);
						console.log(addpoint);

						mySqlClient.query('UPDATE `porc` SET `point` = ? WHERE `pseudo` = ?', [addpoint, msg.content.split(' ')[1]], function (error, results, fields) {
							if (error) console.log(error);

						});

						channel.send(msg.content.split(' ')[2] + ' points de porc ajouté à ' + results[0]['pseudo'] + '\n' + results[0]['pseudo'] + ' à maintenant ' + addpoint + ' points de porc')

					});

				}
				else {
					msg.reply('Eh non')
				}
			}
			else {
				msg.reply('Joue pas au con');

			}
	}
	else {
		msg.reply('_addp <pseudo> <points>');
	}

}

if (command === 'bareme') {
	// 50 PTS PTIT ROT PAS FAIS EXPRES

	// 100 PTS ROT FAIS EXPRES

	// 200 POINT POUR UN PTIT PET DISCERT

	// 300 POINTS POUR UN PET COLLER AU MIRCRO


	channel.send({embed: {
		title: 'Obtention des points de porc',
		color: embedColor,
		fields: [{
			name: 'Barème',
			value: '50 points pour un rot pas fait exprès\n100 points pour un rot fait exprès\n200 points pour un pet au loin\n300 points pour un pet complètement collé au micro'
		}],
		footer: {
			text: 'Barème des porcs'
		}
	}})


}

if (command === 'removep') {
	var pseudo = msg.content.split(' ')[1];
	var points = msg.content.split(' ')[2];

	if (msg.author.id === '180018298576961537' || msg.author.id === '177808741763252225') {
		if (pseudo && points) {

		mySqlClient.query('SELECT * FROM `porc` WHERE `pseudo` = ?', [msg.content.split(' ')[1]], function (error, results, fields) {

			console.log(results);

			removepoint = parseInt(results[0]['point']) - parseInt(msg.content.split(' ')[2]);
			console.log(removepoint);

			if (points > 0 && points <= results[0]['point']) {
				mySqlClient.query('UPDATE `porc` SET `point` = ? WHERE `pseudo` = ?', [removepoint, msg.content.split(' ')[1]], function (error, results, fields) {
					if (error) console.log(error);

					channel.send(msg.content.split(' ')[2] + ' points de porc retiré à ' + results[0]['pseudo'] + '\n' + results[0]['pseudo'] + ' à maintenant ' + removepoint + ' points de porc')

				});
			}
		});

		}
	}
}

if (command === 'removem') {

	var pseudo = msg.content.split(' ')[1];

	if (msg.author.id === '180018298576961537') {
		if (pseudo) {

			mySqlClient.query('DELETE FROM porc WHERE pseudo = ?', [pseudo], function (error, results, fields) {
				if (error) console.log(error);
			  console.log('deleted' + results.affectedRows + ' rows');
			});

		}
	}

}





if (command === 'poll') {
	let pollreact = 0;
	let poll = 0;

	const reactions = [
	  "#⃣",
	  "0⃣",
	  "1⃣",
	  "2⃣",
	  "3⃣",
	  "4⃣",
	  "5⃣",
	  "6⃣",
	  "7⃣",
	  "8⃣",
	  "9⃣",
	  "🔟"];

	function optionfinder(i, word) {
	  switch (i) {
	    case 1:
	      return(":one: | "+word.split(/,/)[i]);
	    break;
	    case 2:
	      return(":two: | "+word.split(/,/)[i]);
	    break;
	    case 3:
	      return(":three: | "+word.split(/,/)[i]);
	    break;
	    case 4:
	      return(":four: | "+word.split(/,/)[i]);
	    break;
	    case 5:
	      return(":five: | "+word.split(/,/)[i]);
	    break;
	    case 6:
	      return(":six: | "+word.split(/,/)[i]);
	    break;
	    case 7:
	      return(":seven: | "+word.split(/,/)[i]);
	    break;
	    case 8:
	      return(":eight: | "+word.split(/,/)[i]);
	    break;
	    case 9:
	      return(":nine: | "+word.split(/,/)[i]);
	    break;
	    case 10:
	      return(":keycap_ten: | "+word.split(/,/)[i]);
	    break;
	  }
	}

	function react(reactnum, pollreact, msg) {
	  if (pollreact > 0) {
	    setInterval(function(){
	      if(reactnum < pollreact) {
	        reactnum++;
	        msg.react(reactions[reactnum+1]);
	      } else {
	        clearInterval();
	      }
	    }, 500);
	    poll = 0;
	  }
	}

	// exports.run = (msg) => {
	  let word = "";
	  let options = "";
	  let thing = 1;

	  for(i=0;i<args.length;i++) {
	    word+=args[i]+" ";
	  }
	  if (word.split(/,/).length <= 11) {
	    for(i=1;i<word.split(/,/).length;i++) {
	      if (word.split(/,/)[i] != " " && word.split(/,/)[i] != "") {
	        options+="**"+optionfinder(i,word)+"**"+"\n";
	      }
	    }
				name = word.split(/,/)[0];
				name = name.substring(6);

	    channel.send({embed: {
	      color: embedColor,
	      title: 'Sondage',
	      thumbnail: {
	        url: msg.author.avatarURL
	      },
	      fields: [
	        {
						name: name,
	          value: options
	        }
	      ],
	      footer: {
	        text: '_poll <question>, <reponse1>, <reponse2>, ect'
	      }
	    }}).then(msg => react(0, pollreact, msg));
	    poll = 1;
	    pollreact = word.split(/,/).length - 1;
	    msg.delete(10);
	  } else {
	    channel.send("Max 10 options.");
	  }
	// }

}

///////////////////////////////////////////////////////////////// POLL ////////////////////////////////////////////////

	if (command === 'rand') {
		// if (msg.author.id === '180018298576961537' && !isNaN(max)) {
		// 	rand = Math.floor(Math.random() * (max - minBis + 1)) + minBis;
		// 	return msg.channel.send(`<@${msg.author.id}> tu fais ${rand}`);
		// }
		if (msg.content.split(' ')[1]) {
			const max = msg.content.split(' ')[1];
			if (isNaN(max)) {
				return msg.channel.send(`<@${msg.author.id}> entre un nombre entier <:anebate:423166000813309972>`);
			}
			if (msg.author.id == '180018298576961537' && !isNaN(max)) {
				rand = Math.floor(Math.random() * (max - min + 1)) + min;
				return msg.channel.send(`<@${msg.author.id}> tu fais ${rand}`);
			}
			// else if(!isNaN(max) && msg.author.id != '180018298576961537'){
			// 	rand = Math.floor(Math.random() * (max - min + 1)) + min;
			// 	return msg.channel.send(`<@${msg.author.id}> tu fais ${rand}`);
			// }
			else{
				rand = Math.floor(Math.random() * (max - min + 1)) + min;
				return msg.channel.send(`<@${msg.author.id}> tu fais ${rand}`);
			}
		}
  	rand = Math.floor(Math.random() * (max - min + 1)) + min;
	return msg.channel.send(`<@${msg.author.id}> tu fais ${rand}`);
	}

	if (command === 'p' || command === 'play') {
		const voiceChannel = msg.member.voiceChannel;
		if (!voiceChannel) return msg.channel.send('Je suis pas dans un channel vocal');
		const permissions = voiceChannel.permissionsFor(msg.client.user);
		if (!permissions.has('CONNECT')) {
			return msg.channel.send('J\'ai pas les droits');
		}
		if (!permissions.has('SPEAK')) {
			return msg.channel.send('J\`ai pas les droits de parler');
		}

		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			const playlist = await youtube.getPlaylist(url);
			const videos = await playlist.getVideos();
			for (const video of Object.values(videos)) {
				const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
				await handleVideo(video2, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
			}
			return msg.channel.send(`🤖 Playlist : ${playlist.title} ajouté !`);
		} else {
			try {
				var video = await youtube.getVideo(url);
			} catch (error) {
				try {
					var videos = await youtube.searchVideos(searchString, 10);
					let index = 0;
					msg.channel.send(`
Choisis une chanson 🤘 :
${videos.map(video2 => `**${++index} -** ${video2.title}`).join('\n')}
Selectionne entre 1 et 10.
					`);
					// eslint-disable-next-line max-depth
					try {
						var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
							maxMatches: 1,
							time: 20000,
							errors: ['time']
						});
					} catch (err) {
						console.error(err);
						return msg.channel.send('Entre un truc la prochaine fois <:anebate:423166000813309972>.');
					}
					const videoIndex = parseInt(response.first().content);
					var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
				} catch (err) {
					console.error(err);
					return msg.channel.send('Tes sur ça existe ta connerie la ❓');
				}
			}
			return handleVideo(video, msg, voiceChannel);
		}
	} else if (command === 'skip') {
		if (!msg.member.voiceChannel) return msg.channel.send('Tu t\'es cru ou ? 🤔');
		if (!serverQueue) return msg.channel.send('Ya rien a skip ');
		serverQueue.connection.dispatcher.end('skip utilisé');
		return undefined;
	} else if (command === 'stop') {
		if (!msg.member.voiceChannel) return msg.channel.send('Tu t\'es cru ou ? 🤔');
		if (!serverQueue) return msg.channel.send('Ya rien a stop.');
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end('stop utilisé');
		return undefined;
	}

	//  else if (command === 'volume') {
	// 	if (!msg.member.voiceChannel) return msg.channel.send('Tes pas dans une chan vocal');
	// 	if (!serverQueue) return msg.channel.send('Ya rien qui tourne.');
	// 	if (!args[1]) return msg.channel.send(`le volume est à : **${serverQueue.volume}**`);
	// 	serverQueue.volume = args[1];
	// 	serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
	// 	return msg.channel.send(`I set the volume to: **${args[1]}**`);
	// }

	else if (command === 'song') {
		if (!serverQueue) return msg.channel.send('Met un peu de musique avant non ? <:papougims:424948910705082369>.');
		return msg.channel.send(`👾 Acutellement :${serverQueue.songs[0].title}`);
	}

	else if (command === 'queue') {
		if (!serverQueue) return msg.channel.send('Met un peu de musique avant non ? <:papougims:424948910705082369>.');
		return msg.channel.send(`
En attente 🤘:
${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}
Let's go : ${serverQueue.songs[0].title} 👾
		`);
	} else if (command === 'pause') {
		if (serverQueue && serverQueue.playing) {
			serverQueue.playing = false;
			serverQueue.connection.dispatcher.pause();
			return msg.channel.send('c\'est en ⏸');
		}
		return msg.channel.send('Met un peu de musique avant non ? <:papougims:424948910705082369>.');
	} else if (command === 'resume') {
		if (serverQueue && !serverQueue.playing) {
			serverQueue.playing = true;
			serverQueue.connection.dispatcher.resume();
			return msg.channel.send('c\'est ▶');
		}
		return msg.channel.send('Met un peu de musique avant non ? <:papougims:424948910705082369>.');
	}

	return undefined;
});

async function handleVideo(video, msg, voiceChannel, playlist = false) {
	const serverQueue = queue.get(msg.guild.id);
	console.log(video);
	const song = {
		id: video.id,
		title: Util.escapeMarkdown(video.title),
		url: `https://www.youtube.com/watch?v=${video.id}`
	};
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		};
		queue.set(msg.guild.id, queueConstruct);

		queueConstruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(msg.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`I could not join the voice channel: ${error}`);
			queue.delete(msg.guild.id);
			return msg.channel.send(`j'peux pas rejoindre le channel vocal: ${error}`);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
		else return msg.channel.send(`${song.title} ajouté dans la playlist`);
	}
	return undefined;
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}
	console.log(serverQueue.songs);

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', reason => {
			if (reason === 'oué la co') console.log('Song ended.');
			else console.log(reason);
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
	// <:charlito:428253612133842954> Custom emote
	serverQueue.textChannel.send(`Let's go : ${song.title} 👾`);
}



client.login((process.env.BOT_TOKEN);
