const getUserByEmail = function(email, database) {
  for (let userId in database) {
    if (database[userId].email === email) {
      return database[userId];
    }
  }
  
  return null;
};

const urlsForUser = (userId, urlDatabase) => {
  const userUrls = {};
  for (let shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === userId) {
      userUrls[shortUrl] = urlDatabase[shortUrl];
    }
  }

  return userUrls;
};

const generateRandom = (length = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const getUserFromSession = (req,users) => {
  const userId = req.session.userId;
  if (!userId) return null;
  return Object.values(users).find(user => user.id === userId) || null;
};

module.exports = { getUserByEmail, urlsForUser, generateRandom, getUserFromSession };