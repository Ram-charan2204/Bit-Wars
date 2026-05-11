import { db, ref, onValue } from "./firebase-config.js";

import { getRemainingTime } from "./timer.js";

const playerName = document.getElementById("playerName");

const currentBid = document.getElementById("currentBid");

const highestBidder = document.getElementById("highestBidder");

const timerElement = document.getElementById("timer");

const teamsContainer = document.getElementById("teamsContainer");

const historyList = document.getElementById("historyList");

const soldModal = document.getElementById("soldModal");

const soldPlayer = document.getElementById("soldPlayer");

const soldTeam = document.getElementById("soldTeam");

const soldPrice = document.getElementById("soldPrice");

let timerInterval;

onValue(ref(db, "auction"), (snapshot) => {
  const data = snapshot.val();

  if (!data) return;

  if (!data.currentPlayer) {
    playerName.innerText = "Waiting...";

    return;
  }

  playerName.innerText = data.currentPlayer.name;

  currentBid.innerText = `Current Bid: ${data.currentBid}`;

  highestBidder.innerText = `Highest Bidder:
       ${data.highestBidder || "None"}`;

  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    timerElement.innerText = getRemainingTime(data.timerEnd);
  }, 200);
});

onValue(ref(db, "teams"), (snapshot) => {
  const teams = snapshot.val();

  teamsContainer.innerHTML = "";

  Object.keys(teams).forEach((key) => {
    const team = teams[key];

    const div = document.createElement("div");

    div.className = "team-card";

    div.innerHTML = `

          <h2>
            ${team.name}
          </h2>

          <h3>
            Purse:
            ${team.purse}
          </h3>

          <ul>

            ${(team.players || [])
              .map(
                (player) =>
                  `<li>
                  ${player.name}
                  -
                  ${player.price}
                </li>`,
              )
              .join("")}

          </ul>
        `;

    teamsContainer.appendChild(div);
  });
});

onValue(ref(db, "history"), (snapshot) => {
  const history = snapshot.val() || [];

  historyList.innerHTML = "";

  history.forEach((item) => {
    const div = document.createElement("div");

    div.className = "history-item";

    div.innerHTML = `

        <strong>
          ${item.time}
        </strong>

        <p>
          ${item.message}
        </p>
      `;

    historyList.appendChild(div);
  });
});

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
