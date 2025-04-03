const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const pokemonList = [
  "abomasnow","abra","absol","accelgor","aegislash-shield","aerodactyl","aggron","aipom","alakazam","alcremie",
  "alomomola","altaria","amaura","ambipom","amoonguss","ampharos","anorith","appletun","applin","araquanid",
  "arbok","arcanine","arceus-normal","archen","archeops","arctovish","arctozolt","ariados","armaldo","aromatisse",
  "aron","arrokuda","articuno","audino","aurorus","avalugg","axew","azelf","azumarill","azurill","bagon",
  "baltoy","banette","barbaracle","barboach","barraskewda","basculin-red-striped","bastiodon","bayleef","beartic",
  "beautifly","beedrill","beheeyem","beldum","bellossom","bellsprout","bergmite","bewear","bibarel","bidoof",
  "binacle","bisharp","blacephalon","blastoise","blaziken","blipbug","blissey","blitzle","boldore","boltund",
  "bonsly","bouffalant","bounsweet","braixen","braviary","breloom","brionne","bronzong","bronzor","bruxish","budew",
  "buizel","bulbasaur","buneary","bunnelby","burmy-plant","butterfree","buzzwole","cacnea","cacturne","calyrex",
  "camerupt","carbink","carkol","carnivine","carracosta","carvanha","cascoon","castform","caterpie","celebi",
  "celesteela","centiskorch","chandelure","chansey","charizard","charjabug","charmander","charmeleon","chatot",
  "cherrim-overcast","cherubi","chesnaught","chespin","chewtle","chikorita","chimchar","chimecho","chinchou",
  "chingling","cinccino","cinderace","clamperl","clauncher","clawitzer","claydol","clefable","clefairy","cleffa",
  "clobbopus","cloyster","coalossal","cobalion","cofagrigus","combee","combusken","comfey","conkeldurr",
  "copperajah","corphish","corsola","corviknight","corvisquire","cosmoem","cosmog","cottonee","crabominable",
  "crabrawler","cradily","cramorant","cranidos","crawdaunt","cresselia","croagunk","crobat","croconaw","crustle",
  "cryogonal","cubchoo","cubone","cufant","cursola","cutiefly","cyndaquil","darkrai","darmanitan-standard",
  "dartrix","darumaka","decidueye","dedenne","deerling-spring","deino","delcatty","delibird","delphox",
  "deoxys-normal","dewgong","dewott","dewpider","dhelmise","dialga","diancie","diggersby","diglett","ditto",
  "dodrio","doduo","donphan","dottler","doublade","dracovish","dracozolt","dragalge","dragapult","dragonair",
  "dragonite","drakloak","drampa","drapion","dratini","drednaw","dreepy","drifblim","drifloon","drilbur",
  "drizzile","drowzee","druddigon","dubwool","ducklett","dugtrio","dunsparce","duosion","duraludon","durant",
  "dusclops","dusknoir","duskull","dustox","dwebble","eelektrik","eelektross","eevee","eiscue-ice","ekans",
  "eldegoss","electabuzz","electivire","electrike","electrode","elekid","elgyem","emboar","emolga","empoleon",
  "entei","escavalier","espeon","espurr","eternatus","excadrill","exeggcute","exeggutor","exploud","falinks",
  "farfetchd","fearow","feebas","fennekin","feraligatr","ferroseed","ferrothorn","finneon","flaaffy",
  "flabebe-red","flapple","flareon","fletchinder","fletchling","floatzel","floette-red","florges-red","flygon",
  "fomantis","foongus","forretress","fraxure","frillish","froakie","frogadier","froslass","frosmoth",
  "furfrou-natural","furret","gabite","gallade","galvantula","garbodor","garchomp","gardevoir","gastly",
  "gastrodon-west","genesect","gengar","geodude","gible","gigalith","girafarig","giratina-altered","glaceon",
  "glalie","glameow","glastrier","gligar","gliscor","gloom","gogoat","golbat","goldeen","golduck","golem",
  "golett","golisopod","golurk","goodra","goomy","gorebyss","gossifleur","gothita","gothitelle","gothorita",
  "gourgeist-average","granbull","grapploct","graveler","greedent","greninja","grimer","grimmsnarl","grookey",
  "grotle","groudon","grovyle","growlithe","grubbin","grumpig","gulpin","gumshoos","gurdurr","guzzlord",
  "gyarados","hakamo-o","happiny","hariyama","hatenna","hatterene","hattrem","haunter","hawlucha","haxorus",
  "heatmor","heatran","heliolisk","helioptile","heracross","herdier","hippopotas","hippowdon","hitmonchan",
  "hitmonlee","hitmontop","ho-oh","honchkrow","honedge","hoopa","hoothoot","hoppip","horsea","houndoom",
  "houndour","huntail","hydreigon","hypno","igglybuff","illumise","impidimp","incineroar","indeedee-male",
  "infernape","inkay","inteleon","ivysaur","jangmo-o","jellicent","jigglypuff","jirachi","jolteon","joltik",
  "jumpluff","jynx","kabuto","kabutops","kadabra","kakuna","kangaskhan","karrablast","kartana","kecleon",
  "keldeo-ordinary","kingdra","kingler","kirlia","klang","klefki","klink","klinklang","koffing","komala",
  "kommo-o","krabby","kricketot","kricketune","krokorok","krookodile","kubfu","kyogre","kyurem","lairon",
  "lampent","landorus-incarnate","lanturn","lapras","larvesta","larvitar","latias","latios","leafeon",
  "leavanny","ledian","ledyba","lickilicky","lickitung","liepard","lileep","lilligant","lillipup","linoone",
  "litleo","litten","litwick","lombre","lopunny","lotad","loudred","lucario","ludicolo","lugia","lumineon",
  "lunala","lunatone","lurantis","luvdisc","luxio","luxray","lycanroc-midday","machamp","machoke","machop",
  "magby","magcargo","magearna","magikarp","magmar","magmortar","magnemite","magneton","magnezone",
  "makuhita","malamar","mamoswine","manaphy","mandibuzz","manectric","mankey","mantine","mantyke","maractus",
  "mareanie","mareep","marill","marowak","marshadow","marshtomp","masquerain","mawile","medicham","meditite",
  "meganium","melmetal","meloetta-aria","meltan","meowstic-male","meowth","mesprit","metagross","metang",
  "metapod","mew","mewtwo","mienfoo","mienshao","mightyena","milcery","milotic","miltank","mime-jr","mimikyu-disguised",
  "minccino","minior-red-meteor","minun","misdreavus","mismagius","moltres","monferno","morelull","morgrem",
  "morpeko-full-belly","mothim-plant","mr-mime","mr-rime","mudbray","mudkip","mudsdale","muk","munchlax",
  "munna","murkrow","musharna","naganadel","natu","necrozma","nickit","nidoking","nidoqueen","nidoran-f",
  "nidoran-m","nidorina","nidorino","nihilego","nincada","ninetales","ninjask","noctowl","noibat","noivern",
  "nosepass","numel","nuzleaf","obstagoon","octillery","oddish","omanyte","omastar","onix","oranguru",
  "orbeetle","oricorio-baile","oshawott","pachirisu","palkia","palossand","palpitoad","pancham","pangoro",
  "panpour","pansage","pansear","paras","parasect","passimian","patrat","pawniard","pelipper","perrserker",
  "persian","petilil","phanpy","phantump","pheromosa","phione","pichu","pidgeot","pidgeotto","pidgey",
  "pidove","pignite","pikachu","pikipek","piloswine","pincurchin","pineco","pinsir","piplup","plusle","poipole",
  "politoed","poliwag","poliwhirl","poliwrath","polteageist-phony","ponyta","poochyena","popplio","porygon-z",
  "porygon","porygon2","primarina","primeape","prinplup","probopass","psyduck","pumpkaboo-average","pupitar",
  "purrloin","purugly","pyroar","pyukumuku","quagsire","quilava","quilladin","qwilfish","raboot","raichu","raikou",
  "ralts","rampardos","rapidash","raticate","rattata","rayquaza","regice","regidrago","regieleki","regigigas",
  "regirock","registeel","relicanth","remoraid","reshiram","reuniclus","rhydon","rhyhorn","rhyperior","ribombee",
  "rillaboom","riolu","rockruff","roggenrola","rolycoly","rookidee","roselia","roserade","rotom","rowlet",
  "rufflet","runerigus","sableye","salamence","salandit","salazzle","samurott","sandaconda","sandile","sandshrew",
  "sandslash","sandygast","sawk","sawsbuck-spring","scatterbug-icy-snow","sceptile","scizor","scolipede",
  "scorbunny","scrafty","scraggy","scyther","seadra","seaking","sealeo","seedot","seel","seismitoad","sentret",
  "serperior","servine","seviper","sewaddle","sharpedo","shaymin-land","shedinja","shelgon","shellder",
  "shellos-west","shelmet","shieldon","shiftry","shiinotic","shinx","shroomish","shuckle","shuppet","sigilyph",
  "silcoon","silicobra","silvally-normal","simipour","simisage","simisear","sinistea-phony","sirfetchd",
  "sizzlipede","skarmory","skiddo","skiploom","skitty","skorupi","skrelp","skuntank","skwovet","slaking",
  "slakoth","sliggoo","slowbro","slowking","slowpoke","slugma","slurpuff","smeargle","smoochum","sneasel",
  "snivy","snom","snorlax","snorunt","snover","snubbull","sobble","solgaleo","solosis","solrock","spearow",
  "spectrier","spewpa-icy-snow","spheal","spinarak","spinda","spiritomb","spoink","spritzee","squirtle",
  "stakataka","stantler","staraptor","staravia","starly","starmie","staryu","steelix","steenee","stonjourner",
  "stoutland","stufful","stunfisk","stunky","sudowoodo","suicune","sunflora","sunkern","surskit","swablu",
  "swadloon","swalot","swampert","swanna","swellow","swinub","swirlix","swoobat","sylveon","taillow",
  "talonflame","tangela","tangrowth","tapu-bulu","tapu-fini","tapu-koko","tapu-lele","tauros","teddiursa",
  "tentacool","tentacruel","tepig","terrakion","thievul","throh","thundurus-incarnate","thwackey","timburr",
  "tirtouga","togedemaru","togekiss","togepi","togetic","torchic","torkoal","tornadus-incarnate","torracat",
  "torterra","totodile","toucannon","toxapex","toxel","toxicroak","toxtricity-amped","tranquill","trapinch",
  "treecko","trevenant","tropius","trubbish","trumbeak","tsareena","turtonator","turtwig","tympole","tynamo",
  "type-null","typhlosion","tyranitar","tyrantrum","tyrogue","tyrunt","umbreon","unfezant","unown-a","ursaring",
  "urshifu-single-strike","uxie","vanillish","vanillite","vanilluxe","vaporeon","venipede","venomoth","venonat",
  "venusaur","vespiquen","vibrava","victini","victreebel","vigoroth","vikavolt","vileplume","virizion",
  "vivillon-meadow","volbeat","volcanion","volcarona","voltorb","vullaby","vulpix","wailmer","wailord","walrein",
  "wartortle","watchog","weavile","weedle","weepinbell","weezing","whimsicott","whirlipede","whiscash",
  "whismur","wigglytuff","wimpod","wingull","wishiwashi-solo","wobbuffet","woobat","wooloo","wooper",
  "wormadam-plant","wurmple","wynaut","xatu","xerneas-active","xurkitree","yamask","yamper","yanma","yanmega",
  "yungoos","yveltal","zacian-hero","zamazenta-hero","zangoose","zapdos","zarude","zebstrika","zekrom","zeraora",
  "zigzagoon","zoroark","zorua","zubat","zweilous","zygarde"
];


const difficultyMap = {
  easy: 12,
  medium: 36,
  hard: 100
};

const rooms = {};

function shuffleAndDuplicate(array) {
  const duplicated = [...array, ...array];
  for (let i = duplicated.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [duplicated[i], duplicated[j]] = [duplicated[j], duplicated[i]];
  }
  return duplicated;
}

io.on("connection", (socket) => {
  console.log(`🟢 ${socket.id} connected`);

  socket.on("create-room", ({ roomId, password, playerName, difficulty }) => {
    if (!rooms[roomId]) {
      const tileCount = difficultyMap[difficulty] || 12;
      const selectedTiles = Array.from({ length: tileCount / 2 }, () =>
        pokemonList[Math.floor(Math.random() * pokemonList.length)]
      );

      rooms[roomId] = {
        players: [],
        password,
        matches: {},
        scores: {},
        socketIdToName: {},
        tilesRaw: selectedTiles,
        tiles: shuffleAndDuplicate(selectedTiles),
      };
    }

    const room = rooms[roomId];
    room.players.push({ id: socket.id, name: playerName });
    room.socketIdToName[socket.id] = playerName;
    socket.join(roomId);

    // ✅ Only emit to the newly joined player to trigger UI transition
    socket.emit("room-joined", {
      scores: room.scores
    });

    io.to(roomId).emit("player-list", room.players);
  });

  socket.on("start-game", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room || room.tiles.length === 0) return;

    let countdown = 3;
    const interval = setInterval(() => {
      io.to(roomId).emit("start-countdown", countdown);
      countdown--;
      if (countdown < 0) {
        clearInterval(interval);
        io.to(roomId).emit("game-started", { tiles: room.tiles });
      }
    }, 1000);
  });

  socket.on("tile-clicked", ({ roomId, tileIndex }) => {
    io.to(roomId).emit("update-click", tileIndex);
  });

  socket.on("matched", ({ roomId, matchedIndices }) => {
    const room = rooms[roomId];
    if (!room) return;

    const playerId = socket.id;
    const playerName = room.socketIdToName[playerId];
    if (!room.matches[playerId]) room.matches[playerId] = [];

    room.matches[playerId].push(...matchedIndices);
    room.scores[playerName] = (room.scores[playerName] || 0) + 1;

    io.to(roomId).emit("update-matches", matchedIndices);
    io.to(roomId).emit("score-update", room.scores);

    const totalMatched = Object.values(room.matches).flat().length;
    if (totalMatched >= room.tiles.length) {
      const winner = Object.entries(room.scores).sort((a, b) => b[1] - a[1])[0][0];
      io.to(roomId).emit("game-over", winner);
    }
  });

  socket.on("reset-flip", ({ roomId }) => {
    io.to(roomId).emit("reset-flip");
  });

  socket.on("rematch", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;
    room.tiles = shuffleAndDuplicate(room.tilesRaw);
    room.matches = {};
    room.scores = {};

    io.to(roomId).emit("rematch-ready", {
      tiles: room.tiles,
      scores: room.scores,
    });
  });

  socket.on("disconnect", () => {
    console.log(`🔴 ${socket.id} disconnected`);
    for (const [roomId, room] of Object.entries(rooms)) {
      room.players = room.players.filter(p => p.id !== socket.id);
      delete room.socketIdToName[socket.id];
      delete room.matches[socket.id];

      io.to(roomId).emit("player-list", room.players);
      if (room.players.length === 0) {
        delete rooms[roomId];
        console.log(`🧹 Room ${roomId} deleted`);
      }
    }
  });
});

server.listen(4000, () => {
  console.log("🚀 PocketMatch Server running on port 4000");
});
