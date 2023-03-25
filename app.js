const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketMatchDetails.bd");

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
  response.send(playersArray);
});
