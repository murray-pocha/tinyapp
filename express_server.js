const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// set up view engine
app.set("view engine", "ejs");

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
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

