import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import mongoose from "mongoose";

const app = express();
const PORT = 3000;

// Connect to MongoDB
// mongoose.connect("mongodb://127.0.0.1:27017/betGameDB", {
mongoose.connect("mongodb+srv://flipball:PMuHdBPAU73MVWmK@flipball.zre5q6f.mongodb.net/?retryWrites=true&w=majority&appName=flipball", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 }
});

const User = mongoose.model("User", userSchema);

app.use(bodyParser.json());
app.use(express.static("public"));
app.use(session({
  secret: "secret-key",
  resave: false,
  saveUninitialized: true,
}));

// Signup
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    let existingUser = await User.findOne({ email });
    if (existingUser) return res.json({ success: false, message: "User already exists!" });

    const newUser = new User({ email, password });
    await newUser.save();
    res.json({ success: true, message: "Signup successful!" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Signup failed!" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.json({ success: false, message: "Invalid credentials!" });
    }
    req.session.user = email; // store in session
    res.json({
      success: true,
      balance: user.balance,
      attempts: user.attempts
    });
  } catch (err) {
    res.json({ success: false, message: "Login failed!" });
  }
});


// Add funds
app.post("/addFunds", async (req, res) => {
    const { email, amount } = req.body;
  
    if (amount < 1000) return res.json({ success: false, message: "Minimum ₹1000 required!" });
  
    try {
      const user = await User.findOne({ email });
      if (!user) return res.json({ success: false, message: "User not found" });
  
      user.balance += amount;
      user.attempts += 25; // increment by 25
      await user.save();
  
      res.json({ success: true, balance: user.balance, attempts: user.attempts });
    } catch (err) {
      res.json({ success: false, message: "Failed to add funds" });
    }
});

// Get balance + attempts
app.get("/balance", async (req, res) => {
  const email = req.session.user || req.query.email; // check session or query param
  if (!email) return res.json({ success: false });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false });
    res.json({
      success: true,
      balance: user.balance,
      attempts: user.attempts
    });
  } catch (err) {
    res.json({ success: false });
  }
});

// Play game
app.post("/play", async (req, res) => {
  const email = req.session.user;
  if (!email) return res.json({ success: false, message: "Unauthorized!" });

  const { bet, choice } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false });

    if (user.attempts <= 0) {
      return res.json({ success: false, message: "❌ No attempts left! Add more funds to play again." });
    }
    if (bet > user.balance) {
      return res.json({ success: false, message: "Insufficient balance!" });
    }

    // user.attempts--;

    // const numBoxes = 3;
    // const blueBox = Math.floor(Math.random() * numBoxes);
    // const win = choice === blueBox;
    // const winAmount = win ? bet * 5 : 0;
    // const lost = win ? 0 : bet;

    // user.balance += winAmount - lost;
    // await user.save();

// Track attempt count globally per user
if (!user.attemptCount) {
  user.attemptCount = 0;
}
user.attemptCount++;

// Controlled Blue Ball Logic
let blueBox;
if (user.attemptCount % 4 === 0) {
  // Every 4th attempt → cycle through 0,1,2
  const cycle = Math.floor(user.attemptCount / 4) % 3;
  blueBox = cycle; // 0 = box1, 1 = box2, 2 = box3
} else {
  // Random placement for other attempts
  const numBoxes = 3;
  blueBox = Math.floor(Math.random() * numBoxes);
}

// Win / Lose calculation
const win = choice === blueBox;
const winAmount = win ? bet * 5 : 0;
const lost = win ? 0 : bet;

// Update balance & attempts
user.balance += winAmount - lost;
user.attempts -= 1;

await user.save();

    res.json({
      success: true,
      blueBox,
      win,
      winAmount,
      lost,
      newBalance: user.balance,
      remainingAttempts: user.attempts
    });
  } catch (err) {
    res.json({ success: false, message: "Error playing game" });
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/index.html");
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
