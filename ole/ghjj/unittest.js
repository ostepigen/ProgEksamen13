const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

// Variable to track IDs of created users for cleanup
let userIds = [];

// Helper to add users and track their IDs
async function addUser(userData) {
  const res = await chai.request('http://127.0.0.1:3500')
    .post('/users/new')
    .send(userData);
  
  userIds.push(res.body.user_id); // Assuming response body contains user_id
  return res;
}

// User creation tests
describe('POST /users', () => {
  after(async () => {
    // Cleanup: delete all users created during the tests
    for (const id of userIds) {
      await chai.request('http://127.0.0.1:3500')
        .delete(`/users/${id}`);
    }
  });

  it('should add a new user to the database', async () => {
    const user = { username: 'test', password: '123', ProfilePictures: '1' };
    const res = await addUser(user);

    expect(res).to.have.status(201);
    expect(res.body).to.have.property('msg', 'User inserted in Users database!');
  });

  it('should add a new user with an integer in username to the database', async () => {
    const user = { username: '123', password: '123', ProfilePictures: '1' };
    const res = await addUser(user);

    expect(res).to.have.status(201);
    expect(res.body).to.have.property('msg', 'User inserted in Users database!');
  });

  it('should add a new user with special characters in username to the database', async () => {
    const user = { username: 'test!@#$%^*()_+', password: '123', ProfilePictures: '1' };
    const res = await addUser(user);

    expect(res).to.have.status(201);
    expect(res.body).to.have.property('msg', 'User inserted in Users database!');
  });
});

// User retrieval tests
describe('GET /users', () => {
  it('should retrieve user by username and password', async () => {
    const usernames = ['test', '123', 'test!@#$%^*()_+'];
    for (const username of usernames) {
      const encodedUsername = encodeURIComponent(username);
      const res = await chai.request('http://127.0.0.1:3500')
        .get(`/users?username=${encodedUsername}&password=123`);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array').that.is.not.empty;
      expect(res.body[0]).to.have.property('user_id');
    }
  });
});

// Tests for user non-existence after deletion
describe('GET /users after DELETE', () => {
  it('should not retrieve user after deletion', async () => {
    const usernames = ['test', '123', 'test!@#$%^*()_+'];
    for (const username of usernames) {
      const encodedUsername = encodeURIComponent(username);
      const res = await chai.request('http://127.0.0.1:3500')
        .get(`/users?username=${encodedUsername}&password=123`);

      expect(res).to.have.status(200);
      expect(res.body).to.be.empty;
    }
  });
});