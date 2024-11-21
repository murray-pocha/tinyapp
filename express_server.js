const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs"); //import
const app = express();
const PORT = 8080; // default port 8080

// set up view engine
app.set("view engine", "ejs");

//middleware to translate. or parse the body. changes from buffer to a string that we can read.
//Use cookie parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//global users object
const users = {}; //store users as key value pairs {email:password}

//route to display the registration page
app.get('/register', (req, res) => {
  res.render('register'); //renders the registration template
});

//handle the registration form submission
app.post("/register", async (req, res) => {
  const { email, password } = req.body; //extract email and pass from form
  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty.");
  }

  // check if the user already exists
  if (users[email]) {
    return res.status(400).send("User already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 10); // hash password with 10 rounds of salt

  //generate a unique user ID
  const userId = generateRandomId();

  //store the user object in the global users object
  users[email] = {
    id: userId,
    email: email,
    password: hashedPassword,
  };

  //store the user ID in a cookie to identify later
  res.cookie('user_id', userId, { maxAge: 900000, httpOnly: true });

  //redirect to login page or another page after registration
  res.redirect("/urls");
});

const generateRandomId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return id;
};

//helper function to get user object from cookies
const getUserFromCookies = (req) => {
  const userId = req.cookies.user_id; //retrieve user_id from cookies
  if (!userId) return null; //user not logged in

  //look up the user by user_id
  return Object.values(users).find(user => user.id === userId) || null;
};

// sample database of short urls
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//route for homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

//route to display all URLs
app.get('/urls', (req, res) => {
  const user = getUserFromCookies(req); // get user from cookies
  if (!user) {
    return res.redirect("/login"); //if no user redirect to login
  }

  const templateVars = {
    urls: urlDatabase,
    user: user //pass the entire user object to the template
  };

  res.render('urls_index', templateVars);
});

//route for login page
app.get('/login', (req, res) => {
  res.render('login'); // render login page
});

//route to return the JSON of URLs
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//route to say hello
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//route to handle login POST request
app.post("/login", async (req, res) => {
  const { email, password } = req.body; // get email and password from form

  // check if email or password are empty
  if (!email || !password) {
    return res.status(400).send("Email and password are required.");
  }

  const user = users[email]; //find user by email

  if (user) {

    //compared entered password with the hashed password
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      //set user_id cookie
      res.cookie('user_id', user.id, { maxAge: 900000, httpOnly: true });
      //redirect to the URLs page after login
      res.redirect('/urls');

    } else {
      //if password doesnt match send error
      res.status(400).send('Invalid email or password');
    }
  } else {
    //if user does not exist
    res.status(400).send("Invalid email or password");
  }
});

//route to logout and clear cookie upon logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//route to render the urls_new.ejs template in the browser to present the from to user.
app.get("/urls/new", (req, res) => {
  const user = getUserFromCookies(req);
  if (!user) {
    return res.redirect("/login");
  }

  const templateVars = {
    user: user //pass the entire user object to the template
  };
  res.render("urls_new", templateVars);
});

//route to display details for a specific URL based on ID
app.get("/urls/:id", (req, res) => {
  const user = getUserFromCookies(req);  // get user from cookies
  if (!user) {
    return res.redirect("/login"); //if no user redirect to login
  }

  const shortUrlId = req.params.id;
  const longURL = urlDatabase[shortUrlId];  // require corresponding long URL from database

  //check if URL exists
  if (longURL) {
    const templateVars = {
      id: shortUrlId,
      longURL: longURL,
      user: user //pass the entire user object to the template
    };
    res.render("urls_show", templateVars);
  } else {
    //render 404 page if non existent
    res.status(404).send("URL not found");
  }
});

//Post route to handle form submission and create short URL
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL; // extract long URL from form data
  const shortURL = generateRandomString(); // creates random short URL

  // add short and long URL to the database
  urlDatabase[shortURL] = longURL;

  //Redirect to the short URL's page
  res.redirect(`/urls/${shortURL}`);
});

// helper function to generate randome 6-character string
const generateRandomString = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let shortURL = '';
  for (let i = 0; i < 6; i++) {
    shortURL += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return shortURL;
};

app.get('/u/:id', (req, res) => {
  //get the short URL from the URL parameter
  const shortURL = req.params.id;
  //look up the long URL in relation to short
  const longURL = urlDatabase[shortURL];

  //check if long URL exists
  if (longURL) {
    res.redirect(longURL);
  } else {
    //if short URL doesn't exist throw error message
    res.status(404).send("URL not found");
  }

});

//handle a URL deletion by its ID
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  //delete the URL if it exists
  delete urlDatabase[shortURL];

  res.redirect('/urls');  // brings you back to the URLs list page
});

// POST route to handle URL editing
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL; // get the new long URL from the form

  //update the URL
  urlDatabase[shortURL] = newLongURL;
  res.redirect(`/urls/${shortURL}`);

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

