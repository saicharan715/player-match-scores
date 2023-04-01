const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initilizeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initilizeDbAndServer();

const convert = (dbObj) => {
  return {
    playerId: dbObj.player_id,
    playerName: dbObj.player_name,
    matchId: dbObj.match_id,
    match: dbObj.match,
    year: dbObj.year,
    player_match_id: dbObj.playerMatchId,
    score: dbObj.score,
    fours: dbObj.fours,
    sixes: dbObj.sixes,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayers = `
    SELECT * FROM player_details;`;

  const playersArray = await db.all(getPlayers);
  response.send(playersArray.map((eachPlayer) => convert(eachPlayer)));
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const getPlayer = `
    SELECT * FROM player_details
    WHERE player_id = ${playerId};`;

  const player = await db.get(getPlayer);

  response.send(convert(player));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;

  const { playerName } = playerDetails;

  const updatePlayer = `
    UPDATE player_details
    SET 
    player_name = '${playerName}'
    WHERE player_id = ${playerId};`;

  await db.run(updatePlayer);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;

  const getMatchDetails = `
    SELECT * FROM match_details WHERE match_id = ${matchId};`;

  const match = await db.get(getMatchDetails);
  response.send(match);
});

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;

  const getplayerMatchDetails = `
    SELECT * FROM player_match_score NATURAL JOIN match_details 
    WHERE player_id = ${playerId};`;

  const matches = await db.all(getplayerMatchDetails);
  response.send(matches.map((eachMatch) => convert(eachMatch)));
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;

  const getPlayerDetailsQuery = `
    SELECT * FROM player_match_score NATURAL JOIN player_details
    WHERE match_id = ${matchId};`;

  const playersArray = await db.all(getPlayerDetailsQuery);
  response.send(playersArray.map((eachPlayer) => convert(eachPlayer)));
});

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;

  const getPlayerScored = `
    SELECT player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes

    FROM player_details INNER JOIN player_match_score
     ON 
    player_details.player_id = player_match_score.player_id

    WHERE player_details.player_id = ${playerId};`;

  const stats = await db.get(getPlayerScored);

  response.send(stats);
});

module.exports = app;
