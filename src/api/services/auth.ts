import * as passport from 'passport';
import * as passportLocal from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';
import { getRepository } from 'typeorm';
import { jwtSecret } from '../../config/variables';

import { User } from '../entity/User';

const localOpts = {
  usernameField: 'email',
  passwordField: 'password'
};

const LocalStrategy = passportLocal.Strategy;

passport.use(new LocalStrategy(
  localOpts,
  async (email, password, done) => {
    try {
      const user = await getRepository(User).findOne({ where: { email } });

      if (!user) {
        return done(null, false);
      } else if (!user.authenticateUser(password)) {
        return done(null, false);
      }

      if (!user.confirmed) {
        throw new Error('Please confirm your email to login');
      }

      return done(null, user);
    } catch (e) {
      return done(e, false);
    }
  }
));

const jwtOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
  secretOrKey: jwtSecret,
};

passport.use(new JWTStrategy(
  jwtOpts, 
  async (payload, done) => {
    try {
      if (!payload.id) {
        return done(null, false);
      }

      const user = payload.id;
      return done(null, user);
    } catch (e) {
      return done(e, false);
    }
  }
));

export const authLocal = passport.authenticate('local', { session: false });
export const authJwt = passport.authenticate('jwt', { session: false });