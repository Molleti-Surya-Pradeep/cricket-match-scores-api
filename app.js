const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbpath = path.join(__dirname, "cricketMatchDetails.db");
app.use(express.json());

let db = null;

const intilizeserverandDB = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running Successfully");
    });
  } catch (e) {
    console.log(`Db Error: ${e}`);
  }
};

intilizeserverandDB();

function convesiondbtoresponse(dataobject) {
  return {
    playerId: dataobject.player_id,
    playerName: dataobject.player_name,
    matchId: dataobject.match_id,
    match: dataobject.match,
    year: dataobject.year,
    playerMatchId: dataobject.player_match_id,
    score: dataobject.score,
    sixes: dataobject.sixes,
    fours: dataobject.fours,
  };
}

// Api 1

app.get("/players", async (request, response) => {
  const playerQuery = "SELECT * FROM player_details;";
  const playerArray = await db.all(playerQuery);
  response.send(playerArray.map((item) => convesiondbtoresponse(item)));
});

// Api 2

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `
    SELECT * FROM player_details WHERE player_id = '${playerId}';`;
  const playerArray = await db.get(playerQuery);
  response.send(convesiondbtoresponse(playerArray));
});

// Api 3

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerdetails = request.body;
  const { playerName } = playerdetails;
  const playerQuery = `
    UPDATE player_details  SET 
    player_name = '${playerName}'
    WHERE player_id = '${playerId}';`;

  const playerArray = await db.run(playerQuery);
  response.send("Player Details Updated");
});

// Api 4

app.get("/matches/:matchId", async (request, response) => {
  const { matchId } = request.params;
  const matchQuery = `
    SELECT * FROM match_details WHERE match_id = '${matchId}';`;
  const dataArray = await db.get(matchQuery);
  response.send(convesiondbtoresponse(dataArray));
});

// Api 5

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `
    SELECT * FROM player_match_score WHERE player_id = ${playerId};`;
  const dataArray = await db.all(playerQuery);
  dataArray3 = [];
  for (let i of dataArray) {
    const playerQuery2 = ` SELECT * FROM match_details WHERE match_id = ${i["match_id"]};`;
    const dataArray2 = await db.get(playerQuery2);
    dataArray3.push(dataArray2);
  }
  response.send(dataArray3.map((item) => convesiondbtoresponse(item)));
});

// Api 6

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const playerQuery = `
    SELECT * FROM player_match_score WHERE match_id = ${matchId};`;
  matchArray = await db.all(playerQuery);
  matchArray3 = [];
  for (let i of matchArray) {
    const playerQuery2 = `SELECT * FROM player_details WHERE player_id = ${i["player_id"]};`;
    const dataArray2 = await db.get(playerQuery2);
    matchArray3.push(dataArray2);
  }
  response.send(matchArray3.map((item) => convesiondbtoresponse(item)));
});

// Api 7

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `
    SELECT * FROM player_details WHERE player_id = ${playerId};`;
  const playerArray = await db.get(playerQuery);
  const playerQuery2 = `
    SELECT SUM(score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes
    
    FROM player_match_score WHERE player_id = ${playerId};`;
  playerArray2 = await db.get(playerQuery2);
  response.send({
    playerId: playerArray["player_id"],
    playerName: playerArray["player_name"],
    totalScore: playerArray2["totalScore"],
    totalFours: playerArray2["totalFours"],
    totalSixes: playerArray2["totalSixes"],
  });
});

module.exports = app;
