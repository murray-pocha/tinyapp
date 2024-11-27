const getUserByEmail = function(email, database) {
  //loop through the database object
  for (let userId in database) {
    // If a user with the provided email is found return the user object
    if (database[userId].email === email) {
      return database[userId];
    }
  }
  
  return null; //if no user was found return null or undefined
};




// function to filter URLs based on the user ID
const urlsForUser = (userId, urlDatabase) => {
  const userUrls = {}; //initialize an object to store user-specific URLs

  // loop through the entire urlDatabase
  for (let shortUrl in urlDatabase) {

    // if the userID of the URL matches the logged-in users ID, add it to userUrls
    if (urlDatabase[shortUrl].userID === userId) {
      userUrls[shortUrl] = urlDatabase[shortUrl];
    }
  }

  return userUrls; // return the filtered URLs/ or empty object
};

module.exports = { getUserByEmail, urlsForUser };