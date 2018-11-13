import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as methodOverride from 'method-override';
import * as cors from 'cors';
import * as helmet from 'helmet';
import * as passport from 'passport';
import routes from '../api/routes';

const app = express();

app.use(compression());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use(methodOverride());

app.use(helmet());

app.use(cors());

app.use('/api', routes);

export default app;