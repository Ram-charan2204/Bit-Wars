import { db, ref, update, onValue, get } from "./firebase-config.js";

import { getRemainingTime } from "./timer.js";

const params = new URLSearchParams(window.location.search);

const teamId = params.get("team");

const auctionRef = ref(db, "auction");
const teamRef = ref(db, `teams/${teamId}`);

const playerName = document.getElementById("playerName");
const currentBid = document.getElementById("currentBid");
const highestBidder = document.getElementById("highestBidder");
const timerElement = document.getElementById("timer");
const teamPurse = document.getElementById("teamPurse");
const teamTitle = document.getElementById("teamTitle");

const bid10 = document.getElementById("bid10");
const bid50 = document.getElementById("bid50");
const bid100 = document.getElementById("bid100");

let latestAuctionData = null;
let timerInterval;

onValue(teamRef, (snapshot) => {
  const team = snapshot.val();

  if (!team) return;

  teamTitle.innerText = team.name;

  teamPurse.innerText = team.purse;
});

onValue(auctionRef, (snapshot) => {
  const data = snapshot.val();

  if (!data || !data.currentPlayer) return;

  latestAuctionData = data;

  playerName.innerText = data.currentPlayer.name;

  currentBid.innerText = "Current Bid: " + data.currentBid;

  highestBidder.innerText = "Highest Bidder: " + (data.highestBidder || "None");

  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    const remaining = getRemainingTime(data.timerEnd);

    timerElement.innerText = remaining;
  }, 1000);
});

bid10.addEventListener("click", () => placeBid(10));
bid50.addEventListener("click", () => placeBid(50));
bid100.addEventListener("click", () => placeBid(100));

async function placeBid(increment) {
  if (!latestAuctionData) return;

  const teamSnapshot = await get(teamRef);

  const team = teamSnapshot.val();

  const nextBid = latestAuctionData.currentBid + increment;

  if (nextBid > team.purse) {
    alert("Not enough purse");

    return;
  }

  if (latestAuctionData.highestBidder === team.name) {
    return;
  }

  update(auctionRef, {
    currentBid: nextBid,

    highestBidder: team.name,

    timerEnd: Date.now() + 10000,

    status: "LIVE",
  });
}
