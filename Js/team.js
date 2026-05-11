import { db, ref, update, onValue, get } from "./firebase-config.js";

import { getRemainingTime } from "./timer.js";

const auctionRef = ref(db, "auction");

const urlParams = new URLSearchParams(window.location.search);

const teamKey = urlParams.get("team");

const teamTitle = document.getElementById("teamTitle");

const playerName = document.getElementById("playerName");

const currentBid = document.getElementById("currentBid");

const highestBidder = document.getElementById("highestBidder");

const timerElement = document.getElementById("timer");

const teamPurse = document.getElementById("teamPurse");

const bid10 = document.getElementById("bid10");

const bid50 = document.getElementById("bid50");

const bid100 = document.getElementById("bid100");

const playerImage = document.getElementById("playerImage");

const basePrice = document.getElementById("basePrice");

const runs = document.getElementById("runs");

const strikeRate = document.getElementById("strikeRate");

const average = document.getElementById("average");

const wickets = document.getElementById("wickets");

const economy = document.getElementById("economy");

const sixes = document.getElementById("sixes");

const soldModal = document.getElementById("soldModal");

const soldPlayer = document.getElementById("soldPlayer");

const soldTeam = document.getElementById("soldTeam");

const soldPrice = document.getElementById("soldPrice");

let timerInterval;

let currentAuction = null;

let currentTeam = null;

onValue(ref(db, `teams/${teamKey}`), (snapshot) => {
  currentTeam = snapshot.val();

  if (!currentTeam) return;

  teamTitle.innerText = currentTeam.name;

  teamPurse.innerText = currentTeam.purse;
});

onValue(auctionRef, (snapshot) => {
  const data = snapshot.val();

  currentAuction = data;

  if (!data) return;

  if (!data.currentPlayer) {
    playerName.innerText = "Waiting...";

    currentBid.innerText = "Current Bid: 0";

    highestBidder.innerText = "Highest Bidder: None";

    timerElement.innerText = "--";

    disableButtons(true);

    return;
  }

  playerName.innerText = data.currentPlayer.name;

  currentBid.innerText = `Current Bid:
       ${data.currentBid}`;

  highestBidder.innerText = `Highest Bidder:
       ${data.highestBidder || "None"}`;

  playerImage.src = data.currentPlayer.image || "./Assets/default.png";

  basePrice.innerText = `Base Price:
       ${data.currentPlayer.basePrice}`;

  runs.innerText = data.currentPlayer.batting?.runs || 0;

  strikeRate.innerText = data.currentPlayer.batting?.sr || 0;

  average.innerText = data.currentPlayer.batting?.avg || 0;

  wickets.innerText = data.currentPlayer.bowling?.wickets || 0;

  economy.innerText = data.currentPlayer.bowling?.eco || 0;

  sixes.innerText = data.currentPlayer.batting?.sixes || 0;

  const isHighestBidder = data.highestBidder === currentTeam?.name;

  disableButtons(isHighestBidder);

  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    const remaining = getRemainingTime(data.timerEnd);

    timerElement.innerText = remaining;

    if (remaining <= 0) {
      clearInterval(timerInterval);

      disableButtons(true);
    }
  }, 200);
});

function disableButtons(state) {
  bid10.disabled = state;

  bid50.disabled = state;

  bid100.disabled = state;

  const opacity = state ? "0.5" : "1";

  bid10.style.opacity = opacity;

  bid50.style.opacity = opacity;

  bid100.style.opacity = opacity;
}

async function placeBid(amount) {
  if (!currentAuction) return;

  if (!currentAuction.currentPlayer) return;

  if (!currentTeam) return;

  if (currentAuction.highestBidder === currentTeam.name) {
    alert("You already have the highest bid");

    return;
  }

  const newBid = currentAuction.currentBid + amount;

  if (newBid > currentTeam.purse) {
    alert("Insufficient purse");

    return;
  }

  disableButtons(true);

  await update(auctionRef, {
    currentBid: newBid,

    highestBidder: currentTeam.name,

    timerEnd: Date.now() + 10000,
  });
}

bid10.addEventListener("click", () => placeBid(10));

bid50.addEventListener("click", () => placeBid(50));

bid100.addEventListener("click", () => placeBid(100));

onValue(ref(db, "lastSold"), (snapshot) => {
  const data = snapshot.val();

  if (!data) return;

  soldPlayer.innerText = data.player;

  soldTeam.innerText = `Won By ${data.team}`;

  soldPrice.innerText = `For ${data.price}`;

  soldModal.style.display = "flex";

  setTimeout(() => {
    soldModal.style.display = "none";
  }, 4000);
});
