const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('urlsForUser', function() {
  const urlDatabase = {
    "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
    "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" },
    "b6y3Tc": { longURL: "http://www.example.com", userID: "userRandomID" }
  };

  it('should return only the URLs belonging to the specified user', function() {
    const userId = "userRandomID"; // Specify the user to check for
    const expectedUrls = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
      "b6y3Tc": { longURL: "http://www.example.com", userID: "userRandomID" }
    };

    const userUrls = urlsForUser(userId, urlDatabase);

    // Assert that the returned value is an object
    assert.isObject(userUrls, 'The returned value should be an object');

    // Assert that the returned URLs belong to the specified user
    assert.deepEqual(userUrls, expectedUrls, 'The returned URLs should match the expected URLs for the user');
  });

  it('should return an empty object if the urlDatabase does not contain any URLs that belong to the specified user', function() {
    const userId = "nonExistentUser"; // User ID that doesn't exist in the urlDatabase
    const userUrls = urlsForUser(userId, urlDatabase);

    // Assert that the returned value is an empty object
    assert.deepEqual(userUrls, {}, 'The returned value should be an empty object for a user with no URLs');
  });

  it('should return an empty object if the urlDatabase is empty', function() {
    const userId = "userRandomID"; // Specify the user to check for
    const emptyUrlDatabase = {}; // Empty urlDatabase

    const userUrls = urlsForUser(userId, emptyUrlDatabase);

    // Assert that the returned value is an empty object
    assert.deepEqual(userUrls, {}, 'The returned value should be an empty object when the urlDatabase is empty');
  });

  it('should not return any URLs that do not belong to the specified user', function() {
    const userId = "userRandomID"; // Specify the user to check for
    const expectedUrls = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
      "b6y3Tc": { longURL: "http://www.example.com", userID: "userRandomID" }
    };

    const userUrls = urlsForUser(userId, urlDatabase);

    // Assert that the returned value is an object
    assert.isObject(userUrls, 'The returned value should be an object');

    // Assert that the returned URLs are correct and do not contain URLs belonging to other users
    assert.deepEqual(userUrls, expectedUrls, 'The returned URLs should match the expected URLs for the user');
    
    // Assert that the returned object does not contain URLs that do not belong to the user
    assert.isUndefined(userUrls["9sm5xK"], 'The returned URLs should not include URLs that do not belong to the specified user');
  });
});


describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";

    // assert that the returned user has the expected user ID
    assert.isObject(user, 'The returned value should be an object'); //ensures result returned is an object
    assert.deepEqual(user, testUsers[expectedUserID], 'The user returned should match the expected user object'); // makes sure the object returned matches the expected user object from the testUsers object.

  });

  it('Should return null for a non existent email', function() {
    const user = getUserByEmail("nonexistent@example.com", testUsers);

    // asser that the result is undefined
    assert.isNull(user, 'The returned value should be null for a non existent email'); // check the result of getUserbyEmail is null
  });
});