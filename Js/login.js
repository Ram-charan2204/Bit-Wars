import { auth, signInWithEmailAndPassword } from "./auth.js";

console.log("login.js loaded");

const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", login);

async function login() {
  console.log("login clicked");

  const email = document.getElementById("email").value;

  const password = document.getElementById("password").value;

  console.log(email, password);

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    console.log("LOGIN SUCCESS");

    console.log(userCredential);

    if (email === "ramcharancherry338@gmail.com") {
      window.location.href = "host.html";
    } else if (email === "rishicherry015@gmail.com") {
      window.location.href = "team.html?team=teamA";
    } else if (email === "ramcharancherry2204@gmail.com") {
      window.location.href = "team.html?team=teamB";
    } else if (email === "rkyadav7981@gmail.com") {
      window.location.href = "team.html?team=teamC";
    }
  } catch (error) {
    console.error(error);

    alert(error.message);
  }
}
