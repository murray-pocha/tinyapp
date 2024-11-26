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
  const user = getUserFromCookies(req); // get user from cookies

  if (user) {
    return res.redirect('/urls'); //if user is logged in redirect to /urls

  }

  res.render('register'); //otherwise render the register page
});

//handle the registration form submission
app.post("/register", async(req, res) => {
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

//route for login page
app.get('/login', (req, res) => {
  const user = getUserFromCookies(req); //get user from cookies

  if (user) {
    return res.redirect('/urls'); //if user is logged in redirect to /urls
  }

  res.render('login'); //otherwise render the login page
});

// sample database of short urls
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

//route for homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

// function to filter URLs based on the user ID
const urlsForUser = (userId) => {
  const userUrls = {}; //initialize an object to store user-specific URLs

  // loop through the entire urlDatabase
  for (let shortUrl in urlDatabase) {
    const urlData = urlDatabase[shortUrl]; // get the data for each URL

    // if the userID of the URL matches the logged-in users ID, add it to userUrls
    if (urlData.userID === userId) {
      userUrls[shortUrl] = urlData; //add the URL to the filtered list
    }
  }

  return userUrls; // return the filtered URLs
};

//route to display all URLs
app.get('/urls', (req, res) => {
  const user = getUserFromCookies(req); // get user from cookies

  if (!user) {
    //if the user is not logged in, display a message promting them to log in.
    return res.redirect(401).send(`
      <html>
      <body>
      <h1>You need to log in first.</h1>
      <p>You must be logged in to view your URLs.</p>
      <a href="/login">Login</a> | <a href="/register">Register</a>
      </body>
      </html>`);
  }

  const userUrls = urlsForUser(user.id);

  const templateVars = {
    urls: userUrls, // only pass the filtered URLs
    user: user //pass the user object for personalization
  };

  res.render('urls_index', templateVars); // render the template with the filtered URLs
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
app.post("/login", async(req, res) => {
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
  res.clearCookie('user_id'); // clear user_id cookie on logout
  res.redirect('/login'); // redirect to login page after logout
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
    return res.status(401).send(`
        <html>
    <body>
    <h1>You need to be logged in first.</h1>
    <p>You must be logged in to view your URLs.</p>
    <a href="/login">Login</a> | <a href="/register"<Register</a>
    </body>
    </html>`
    ); // if no user is logged in, show an error message.

  }

  const shortUrlId = req.params.id;
  const urlData = urlDatabase[shortUrlId];  // get the URL data (longURL and userID)

  //Check if the URL exists
  if (!urlData) {
    return res.status(404).send(`
         <html>
    <body>
    <h1>404 Not Found</h1>
    <p>Sorry, the URL you are looking for does not exist.</p>
    <a href="/urls">Back to URLs</a>
    </body>
    </html>
    `); // render 404 page if URL does not exist.
  }

  // check if the logged in user is the owner of the URL
  if (urlData.userID !== user.id) {
    return res.status(403).send(`
   <html>
    <body>
    <h1>403 Forbidden</h1>
    <p>You do not have permission to view this URL.</p>
    <a href="/urls">Back to URLs</a>
    </body>
    </html>
    `); // if the user is not the owner show a permission error
  }

  // if everything is valid render the URLs details page
  const templateVars = {
    id: shortUrlId,
    longURL: urlData.longURL, // access longURL from the object
    user: user //pass the entire user object for personalization
  };
  res.render("urls_show", templateVars);
});

//Post route to handle form submission and create short URL
app.post("/urls", (req, res) => {
  const user = getUserFromCookies(req); //check if user is logged in
  if (!user) {

    //if user is not logged in respond with an html message and dont add the url
    return res.status(401).send(`
    <html>
    <body>
    <h1>Error</h1>
    <p>You must be logged in to shorten URLs.</p>
    <a href="/login">Login</a> | <a href="/register"<Register</a>
    </body>
    </html>
    `);
  }

  const longURL = req.body.longURL; // extract long URL from form

  if (!longURL) {
    //handle empty URL submission
    return res.status(400).send('Long URL cannot be empty.');
  }

  const shortURL = generateRandomString(); // creates a random short URL

  // add short and long URL to the database
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: user.id // link the short URL with the users ID
  };

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

  const shortURL = req.params.id; //get the short URL from the URL parameter

  const longURL = urlDatabase[shortURL]; //look up the long URL in relation to short


  if (longURL) { //check if long URL exists
    res.redirect(longURL); // if short URL exists redirect to the long URL
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


app.post("/urls/:id/delete", (req, res) => { //handle a URL deletion by its ID
  const user = getUserFromCookies(req); // get user from cookies
  const shortURL = req.params.id;
  const urlData = urlDatabase[shortURL];

  if (!urlData) {
    return res.status(404).send("URL not found"); // send error to client
  }

  // check if the user is the owner of the URL
  if (urlData.userID !== user.id) {
    return res.status(403).send("You are not authorized to delete this URL.");
  }

  delete urlDatabase[shortURL]; // delete the URL

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

