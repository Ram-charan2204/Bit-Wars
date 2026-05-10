import { db, ref, update, onValue, get, set } from "./firebase-config.js";

import { players } from "./auction-data.js";

import { getRemainingTime } from "./timer.js";

const auctionRef = ref(db, "auction");

const teamsRef = ref(db, "teams");

const historyRef = ref(db, "history");

const remainingPlayersRef = ref(db, "remainingPlayers");

const playerName = document.getElementById("playerName");

const currentBid = document.getElementById("currentBid");

const highestBidder = document.getElementById("highestBidder");

const timerElement = document.getElementById("timer");

const nextPlayerBtn = document.getElementById("nextPlayerBtn");

const pauseBtn = document.getElementById("pauseBtn");

const resumeBtn = document.getElementById("resumeBtn");

const unsoldBtn = document.getElementById("unsoldBtn");

const newAuctionBtn = document.getElementById("newAuctionBtn");

let timerInterval;

nextPlayerBtn.addEventListener("click", nextPlayer);

pauseBtn.addEventListener("click", pauseAuction);

resumeBtn.addEventListener("click", resumeAuction);

unsoldBtn.addEventListener("click", markUnsold);

newAuctionBtn.addEventListener("click", resetAuction);

async function resetAuction() {
  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);

  await set(remainingPlayersRef, shuffledPlayers);

  await update(ref(db, "teams/teamA"), {
    purse: 10000,
    players: [],
  });

  await update(ref(db, "teams/teamB"), {
    purse: 10000,
    players: [],
  });

  await update(ref(db, "teams/teamC"), {
    purse: 10000,
    players: [],
  });

  await update(auctionRef, {
    currentPlayer: null,

    currentBid: 0,

    highestBidder: "",

    status: "WAITING",

    timerEnd: 0,

    paused: false,
  });

  await set(historyRef, []);

  alert("New Auction Started");
}

async function nextPlayer() {
  const snapshot = await get(remainingPlayersRef);

  let remainingPlayers = snapshot.val() || [];

  if (remainingPlayers.length === 0) {
    alert("Auction Completed");

    return;
  }

  const selectedPlayer = remainingPlayers.pop();

  await set(remainingPlayersRef, remainingPlayers);

  await update(auctionRef, {
    currentPlayer: selectedPlayer,

    currentBid: selectedPlayer.basePrice,

    highestBidder: "",

    status: "WAITING",

    timerEnd: Date.now() + 30000,

    paused: false,
  });

  addHistory(`${selectedPlayer.name} entered auction`);
}

async function pauseAuction() {
  await update(auctionRef, {
    paused: true,
  });
}

async function resumeAuction() {
  await update(auctionRef, {
    paused: false,
  });
}

async function markUnsold() {
  const snapshot = await get(auctionRef);

  const data = snapshot.val();

  if (!data.currentPlayer) return;

  addHistory(`${data.currentPlayer.name} went UNSOLD`);

  await update(auctionRef, {
    status: "UNSOLD",

    currentPlayer: null,

    currentBid: 0,

    highestBidder: "",
  });
}

async function sellPlayer() {
  const snapshot = await get(auctionRef);

  const auction = snapshot.val();

  if (!auction.highestBidder) {
    await markUnsold();

    return;
  }

  const teamsSnapshot = await get(teamsRef);

  const teams = teamsSnapshot.val();

  let winningKey = null;

  Object.keys(teams).forEach((key) => {
    if (teams[key].name === auction.highestBidder) {
      winningKey = key;
    }
  });

  if (!winningKey) return;

  const team = teams[winningKey];

  const updatedPlayers = team.players || [];

  updatedPlayers.push({
    name: auction.currentPlayer.name,

    price: auction.currentBid,
  });

  await update(ref(db, `teams/${winningKey}`), {
    purse: team.purse - auction.currentBid,

    players: updatedPlayers,
  });

  addHistory(
    `${auction.currentPlayer.name}
     SOLD to
     ${auction.highestBidder}
     for
     ${auction.currentBid}`,
  );

  await update(auctionRef, {
    status: "SOLD",

    currentPlayer: null,

    currentBid: 0,

    highestBidder: "",
  });
}

async function addHistory(message) {
  const historySnapshot = await get(historyRef);

  const history = historySnapshot.val() || [];

  history.unshift({
    message,

    time: new Date().toLocaleTimeString(),
  });

  await set(historyRef, history);
}

onValue(auctionRef, (snapshot) => {
  const data = snapshot.val();

  if (!data) return;

  if (!data.currentPlayer) {
    playerName.innerText = "Waiting for next player";

    currentBid.innerText = "Current Bid: 0";

    highestBidder.innerText = "Highest Bidder: None";

    timerElement.innerText = "--";

    return;
  }

  playerName.innerText = data.currentPlayer.name;

  currentBid.innerText = "Current Bid: " + data.currentBid;

  highestBidder.innerText = "Highest Bidder: " + (data.highestBidder || "None");

  clearInterval(timerInterval);

  timerInterval = setInterval(async () => {
    if (data.paused) return;

    const remaining = getRemainingTime(data.timerEnd);

    timerElement.innerText = remaining;

    if (remaining <= 0) {
      clearInterval(timerInterval);

      if (data.highestBidder) {
        await sellPlayer();
      } else {
        await markUnsold();
      }
    }
  }, 1000);
});

onValue(teamsRef, (snapshot) => {
  const teams = snapshot.val();

  const container = document.getElementById("teamsContainer");

  container.innerHTML = "";

  Object.keys(teams).forEach((key) => {
    const team = teams[key];

    const playersHTML = (team.players || [])

      .map(
        (player) =>
          `<li>
            ${player.name}
            -
            ${player.price}
          </li>`,
      )

      .join("");

    const div = document.createElement("div");

    div.className = "team-card";

    div.innerHTML = `

        <h2>${team.name}</h2>

        <h3>
          Purse:
          ${team.purse}
        </h3>

        <h4>Squad</h4>

        <ul>
          ${playersHTML}
        </ul>
      `;

    container.appendChild(div);
  });
});
