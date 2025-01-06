const express = require("express");
const methodOverride = require('method-override');
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { getUserByEmail, urlsForUser, generateRandom, getUserFromSession } = require('./helpers'); // require the helper function

const PORT = 8080;
const app = express();
const users = {};

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "user1"
  },
  '9sm5xK': {
    longURL: "http://www.google.com",
    userID: "user2",
  }
};

app.set("view engine", "ejs");
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  secret: process.env.SESSION_SECRET || 'your-secret-key-here',
  maxAge: 900000,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
}));


app.get('/register', (req, res) => {
  const user = getUserFromSession(req, users);
  if (user) {
    return res.redirect('/urls');
  }
  res.render('register');
});


app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty.");
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).render('login', { message: "User already exists." });
  }

  const userId = generateRandom(8);
  const hashedPassword = await bcrypt.hash(password, 10);

  users[email] = {
    id: userId,
    email: email,
    password: hashedPassword,
  };
  req.session.userId = userId;
  console.log(req.session);
  res.redirect("/urls");
});

app.get('/login', (req, res) => {
  const user = getUserFromSession(req, users);
  if (user) {
    return res.redirect('/urls');
  }
  res.render('login', { message: null });
});

app.post("/login", async (req, res) => {
  console.log("Session data after login:", req.session);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).render('login', { message: "Email and password are required." });
  }

  const user = getUserByEmail(email, users);
  if (user) {
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      req.session.userId = user.id;
      res.redirect('/urls');
    } else {
      res.status(400).render('login', { message: "Invalid email or password" });
    }
  } else {
    res.status(400).render('login', { message: "Invalid email or password" });
  }
});

  app.post('/logout', (req, res) => {
    req.session = null;
    res.redirect('/login');
  });

  app.get('/urls', (req, res) => {
    const user = getUserFromSession(req, users);
    if (!user) {
      return res.status(401).render('error', { message: 'You need to log in first.', redirectUrl: '/login' });
    }

    const userUrls = urlsForUser(user.id, urlDatabase);
    const templateVars = {
      urls: userUrls,
      user: user
    };
    res.render('urls_index', templateVars);
  });

  app.get("/urls/new", (req, res) => {
    const user = getUserFromSession(req, users);
    if (!user) {
      return res.redirect("/login");
    }
    const templateVars = {
      user: user
    };
    res.render("urls_new", templateVars);
  });

  app.post("/urls", (req, res) => {
    const user = getUserFromSession(req, users);
    if (!user) {
      return res.status(401).render('error', { message: 'You must be logged in to shorten URLs.', redirectUrl: '/login' });
    }
    const longURL = req.body.longURL;
  
    if (!longURL) {
      return res.status(400).send('Long URL cannot be empty.');
    }
    const shortURL = generateRandom();

    urlDatabase[shortURL] = {
      longURL: longURL,
      userID: user.id
    };

    res.redirect(`/urls/${shortURL}`);
  });

  app.get("/urls/:id", (req, res) => {
    const user = getUserFromSession(req, users);  // get user from cookies
    const shortUrlId = req.params.id;
    const urlData = urlDatabase[shortUrlId];  // get the URL data (longURL and userID)

    if (!user) {
      return res.status(401).render('error', { message: 'You need to be logged in first.', redirectUrl: '/login' });

    }
    if (!urlData) {
      return res.status(404).render('error', { message: 'You do not have permission to view this URL.', redirectUrl: '/urls' });
    }
    if (urlData.userID !== user.id) {
      return res.status(403).render('error', { message: 'You do not have permission to view this URL.', redirectUrl: '/urls' });
    }

    const templateVars = {
      id: shortUrlId,
      longURL: urlData.longURL,
      user: user,
    };

    res.render("urls_show", templateVars);
  });

  app.put("/urls/:id", (req, res) => {
    const shortUrlId = req.params.id;
    const newLongURL = req.body.longURL;
    const userId = req.session.userId;
   
    const urlData = urlDatabase[shortUrlId];
    if (!urlData) {
      console.log("URL not found:", shortUrlId);
      return res.status(404).send("URL not found.");
    }
    if (!userId || urlData.userID !== userId) {
      console.log("Permission error for user:", userId);
      return res.status(403).send("You do not have permission to edit this URL.");
    }

    urlData.longURL = newLongURL;
   
    res.redirect(`/urls/${shortUrlId}`);
  });

app.get("/", (req, res) => {
  const user = getUserFromSession(req, users);
  if (user) {
    return res.redirect("/urls");
  }
  res.redirect("/login");

  app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

  app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });
});

  app.post("/urls/:id", (req, res) => {
    const user = getUserFromSession(req, users)
    const shortURL = req.params.id;
    const newLongURL = req.body.longURL;
    if (!user) {
      return res.status(401).send("You must be logged in to edit a URL.");
    }
    const urlData = urlDatabase[shortURL];
    if (urlData.userID !== user.id) {
      return res.status(403).send("You are not authorized to edit this URL.");
    }
    urlDatabase[shortURL].longURL = newLongURL;
    res.redirect(`/urls/${shortURL}`);
  });

  app.get('/u/:id', (req, res) => {
    const shortURL = req.params.id;
    const urlData = urlDatabase[shortURL];
    if (urlData) {
      res.redirect(urlData.longURL);
    } else {
      res.status(404).send(`
      <html>
      <body>
      <h1>404 Not found</h1>
      <p>Sorry, the URL you are looking for does not exist.</p>
      <p><a href="/urls">Back to URLs</a></p>
      </body>
      </html>
      `);
    }
  });

  app.post("/urls/:id/edit", (req, res) => {
    const { id } = req.params;
    const { longURL } = req.body;

    if (!req.session.userId) {
      return res.status(401).send("You need to log in first.");
    }

    const url = urlDatabase[id];
    if (!url) {
      return res.status(404).send("URL not found.");
    }
    if (url.userID !== req.session.userId) {
      return res.status(403).send("You don't have permission to edit this URL.");
    }
    url.longURL = longURL;
    res.redirect(`/urls/${id}`);
  });

  app.delete("/urls/:id", (req, res) => {
    const user = getUserFromSession(req, users);
    const shortURL = req.params.id;
    const urlData = urlDatabase[shortURL];
    if (!user) {
      console.log("User not logged in");
      return res.status(401).render('error', { message: 'You must be logged in to delete a URL.', redirectUrl: '/login' }); // ensures the user is logged in.
    }
    if (!urlData) {
      console.log("URL not found in database");
      return res.status(404).send("URL not found");
    }
    if (urlData.userID !== user.id) {
      console.log("User does not have permission to delete this URL");
      return res.status(403).render('error', { message: "You are not authorized to delete this URL.", redirectUrl: '/urls' });
    }
    delete urlDatabase[shortURL];

    res.redirect('/urls');
  });

  app.use((req, res) => {
    res.status(404).send('Page not found');
  });

  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });
