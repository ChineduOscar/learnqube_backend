import dotenv from 'dotenv';
dotenv.config();
import 'express-async-errors';

// extra security packages
import helmet from 'helmet';
import cors from 'cors';
import xss from 'xss-clean';
import rateLimiter from 'express-rate-limit';

// session
import session from 'express-session';

// passport
import passport from 'passport';
import './config/passport.js'

import express, { json } from 'express';
const app = express();

/// Swagger
import swaggerUI from 'swagger-ui-express';
import YAML from 'yamljs';
const swaggerDocument = YAML.load('./swagger.yaml');
// database
import connectDB from './db/connect.js';
// error handler
import notFoundMiddleware from './middleware/not-found.js';
import errorHandlerMiddleware from './middleware/error-handler.js';
//routes
import authRouter from './routes/auth.js';
import PaymentRouter from './routes/payment.js';
import coursesRouter from './routes/course.js'

app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);
app.use(json());
app.use(helmet());
app.use(xss());
app.use(cors({
  origin: ["http://localhost:3000", "https://learnqube.netlify.app"],  
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],  
  allowedHeaders: ["Content-Type", "Authorization"],  
  credentials: true,  
}));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/pay', PaymentRouter);
app.use('/api/v1/courses', coursesRouter);

app.use('/', swaggerUI.serve, swaggerUI.setup(swaggerDocument, {  
  customSiteTitle: 'Learnqube API Docs'  
}));

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);



const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();