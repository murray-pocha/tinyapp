const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// set up view engine
app.set("view engine", "ejs");

//middleware to translate. or parse the body. changes from buffer to a string that we can read.
app.use(express.urlencoded({ extended: true }));

// sample database of short urls
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//route for homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

//route to return the JSON of URLs
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//route to say hello
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//route to display all URLs in a list
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//route to render the urls_new.ejs template in the browser to present the from to user.
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//route to display details for a specific URL based on ID
app.get("/urls/:id", (req, res) => {
  const shortUrlId = req.params.id;  // require short URL from the URL param
  const longURL = urlDatabase[shortUrlId];  // require corresponding long URL from database

  //check if URL exists
  if (longURL) {
    //render the URL template if ID found/ passing both values long+short
    res.render("urls_show", { id: shortUrlId, longURL: longURL });
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


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

