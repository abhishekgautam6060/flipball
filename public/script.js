// Signup
async function signup() {
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
  
    const res = await fetch("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    document.getElementById("signupMessage").innerText = data.message;
  
    if (data.success) {
      setTimeout(() => window.location.href = "login.html", 1000);
    }
  }
  
  // Login
  async function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
  
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
  
    if (data.success) {
      localStorage.setItem("email", email);
      localStorage.setItem("balance", data.balance);
      localStorage.setItem("attempts", data.attempts);
      window.location.href = "game.html";
    } else {
      document.getElementById("loginMessage").innerText = data.message;
    }
  }
  
  // Load balance & attempts on game page
  if (window.location.pathname.includes("game.html")) {
    fetch("/balance")
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          window.location.href = "login.html";
        } else {
          document.getElementById("balance").innerText = data.balance;
          document.getElementById("attempts").innerText = data.attempts;
        }
      });
  }
  
  let flippingAllowed = true;
  
  // Play Game with Flip Animation
  async function play(choice) {
    if (!flippingAllowed) return;
    flippingAllowed = false;
  
    const bet = Number(document.getElementById("bet").value);
    const email = localStorage.getItem("email");
  
    const res = await fetch("/play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, bet, choice })
    });
  
    const data = await res.json();
  
    if (!data.success) {
      alert(data.message);
      flippingAllowed = true;
      return;
    }
  
    // Reset boxes
    for (let i = 0; i < 3; i++) {
      const box = document.querySelectorAll(".box")[i];
      box.classList.remove("flipped");
      document.getElementById(`box${i}`).innerText = "";
    }
  
    // Flip chosen box first
    const chosenBox = document.querySelectorAll(".box")[choice];
    const chosenBack = document.getElementById(`box${choice}`);
    chosenBack.innerText = choice === data.blueBox ? "🔵" : "🔴";
    setTimeout(() => chosenBox.classList.add("flipped"), 200);
  
    // Flip remaining boxes
    setTimeout(() => {
      for (let i = 0; i < 3; i++) {
        if (i !== choice) {
          const box = document.querySelectorAll(".box")[i];
          const back = document.getElementById(`box${i}`);
          back.innerText = i === data.blueBox ? "🔵" : "🔴";
          box.classList.add("flipped");
        }
      }
  
      // Show result
      document.getElementById("balance").innerText = data.newBalance;
      document.getElementById("attempts").innerText = data.remainingAttempts;
  
      if (data.win) {
        document.getElementById("result").innerText =
          `🎉 You WON! Blue was in box ${data.blueBox + 1}. +${data.winAmount}`;
      } else {
        document.getElementById("result").innerText =
          `❌ You LOST! Blue was in box ${data.blueBox + 1}. -${data.lost}`;
      }
  
      // Auto-reset boxes after 2 sec
      setTimeout(() => {
        for (let i = 0; i < 3; i++) {
          const box = document.querySelectorAll(".box")[i];
          box.classList.remove("flipped");
          document.getElementById(`box${i}`).innerText = "";
        }
        document.getElementById("result").innerText = "";
        flippingAllowed = true;
      }, 2000);
  
    }, 1200);
  }
  
  // Logout
  function logout() {
    fetch("/logout").then(() => {
      window.location.href = "index.html";
    });
  }
  
  // Add Funds
  async function addFunds() {
    const email = localStorage.getItem("email");
    const amount = Number(prompt("Enter amount to add:"));
    if (!amount) return;
  
    const res = await fetch("/addFunds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, amount })
    });
  
    const data = await res.json();
    if (data.success) {
      document.getElementById("balance").innerText = data.balance;
      document.getElementById("attempts").innerText = data.attempts;
      alert("Funds added! You have 25 fresh attempts.");
    }
  }


  // Load balance + attempts from DB
  async function loadBalance() {
    const email = localStorage.getItem("email");
    if (!email) {
      window.location.href = "login.html";
      return;
    }
  
    const res = await fetch(`/balance?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    if (data.success) {
      document.getElementById("balance").innerText = data.balance;
      document.getElementById("attempts").innerText = data.attempts;
      localStorage.setItem("balance", data.balance);
      localStorage.setItem("attempts", data.attempts);
    } else {
      window.location.href = "login.html";
    }
  }
  
  // Call this on page load
  window.onload = loadBalance;
  