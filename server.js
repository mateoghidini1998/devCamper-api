const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const connectDb = require('./config/db');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');

//Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');
const { mongo } = require('mongoose');

const app = express();

//Body parser
app.use(express.json());

//Cookie Parser
app.use(cookieParser());


//Dev loggin middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

//File uploading
app.use(fileupload());

//Sanitize data
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xss());

//Set security headers
app.use(helmet());

//Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, //10 mins
    max: 100
})

app.use(limiter);

//Enable CORS
app.use(cors());

//Prevent http param pollution
app.use(hpp());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

//Mount routes
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);


//Error handler
app.use(errorHandler)

//Load env vars
dotenv.config({path: './config/config.env'});

//Connect to DB

connectDb();




const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

//Hanlde unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    
    console.log(`Error ${err.msg}`.red);

    //Close server and exit process
    server.close(() => process.exit(1));
})