const jwt = require('jsonwebtoken');

// set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  // function for our authenticated routes
  authMiddleware: ({ req }) => {
    // allows token to be sent via  req.query or headers
    let token = req.headers.authorization || '';

    if (token) {
      token = token.split(' ').pop().trim();

      try {
        const { data } = jwt.verify(token, secret, { expiresIn: expiration });
        req.user = data;
      } catch {
        console.log('Invalid token');
      }
    }
    return req;
  },
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
