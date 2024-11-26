const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

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