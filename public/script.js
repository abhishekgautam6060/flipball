// ---------------------
// Signup
// ---------------------
async function signup() {
  const firstname = document.getElementById("signupFirstname").value;
  const lastname = document.getElementById("signupLastname").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  const res = await fetch("/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstname, lastname, email, password }),
  });

  const data = await res.json();
  document.getElementById("signupMessage").innerText = data.message;

  if (data.success) {
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);
  }
}

// ---------------------
// Login
// ---------------------
async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  document.getElementById("loginMessage").innerText = data.message;

  if (data.success) {
    // ✅ Save email in localStorage
    localStorage.setItem("email", data.email);
    setTimeout(() => {
      window.location.href = "profile.html";
    }, 1000);
  }
}

// ---------------------
// Load Profile Info
// ---------------------
async function loadProfile() {
  const email = localStorage.getItem("email");
  if (!email) {
    window.location.href = "login.html";
    return;
  }

  const res = await fetch(`/balance?email=${email}`);
  const data = await res.json();

  if (data.success) {
    document.getElementById("profileEmail").innerText = email;
    document.getElementById("profileBalance").innerText = data.balance;
    document.getElementById("profileAttempts").innerText = data.attempts;
  } else {
    window.location.href = "login.html";
  }
}

// ---------------------
// Update Balance (example after playing game)
// ---------------------
async function updateBalance(newBalance, newAttempts) {
  const email = localStorage.getItem("email");
  if (!email) return;

  await fetch("/update-balance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, balance: newBalance, attempts: newAttempts }),
  });
}

// ---------------------
// Logout
// ---------------------
function logout() {
  localStorage.removeItem("email");
  window.location.href = "login.html";
}
