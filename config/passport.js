const LocalStrategy = require('passport-local').Strategy,
	pool = require('../config/db').pool,
	bcrypt = require('bcryptjs');

module.exports = function (passport)
{
  passport.use(
    new LocalStrategy({ usernameField: 'email', passReqToCallback: true }, (req, email, password, done) =>
    {
      console.log('curr', password)
      //Match user
      pool.query('SELECT * FROM employees WHERE email = ?', [email], function (error, results, fields)
      {
	if(error) throw error;
        if (results[0].pwd)
        {
          console.log('SQL: ', results[0].pwd);
          console.log('Input:', results[0].staff_id)
          bcrypt.compare(password, results[0].pwd, (err, isMatch) =>
          {
            if (err) throw err;
            if (isMatch)
            {
              return done(null, results[0]);
            } else
            {
              return done(null, false, { message: 'Password incorrect' });
            }
          });
        } else
        {
          res.send({
            code: 204,
            success: 'Email does not exits'
          });
        }

      });
    })
  );

  // Match the password

  passport.serializeUser((user, done) =>
  {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) =>
  {
    pool.query('SELECT * FROM employees WHERE id = ?', [id], function (err, results)
    {
      done(err, results[0])
    })
  });
};

