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

module.exports = { getUserByEmail };