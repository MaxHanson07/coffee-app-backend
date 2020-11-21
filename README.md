# coffee-app-backend

## Server for Cfe

![Contents](https://img.shields.io/github/languages/top/dan-gentile/coffee-app-dashboard)
![Last-Commit](https://img.shields.io/github/last-commit/dan-gentile/coffee-app-dashboard)

### Table of contents

- [Title](#title)
- [General info](#general-info)
- [Technical Breakdown](#Tech-Breakdown)
- [Technologies](#Technologies)
- [Contributing](#contributing)
- [Questions](#questions)
- [Authors](#Authors)

### General info

This server is built to serve both the Cfe admin dashboard and the Cfe client web application. It manages the MongoDB database used by both apps, which is hosted on Atlas and controlled via Mongoose. Mongoose gave us the ability to build associations between a few of our collections, while taking advantage of the horizontal scalability of MongoDB. It also handles user verification for both apps, using jsonwebtoken for the dashboard admin accounts, and google-auth-library for the client accounts. Our admin passwords are salted and hashed using bcrypt. For all routes that have the potential to create, update, or destroy data the server authenticates the user on each call to protect our database. We draw on the data gathered by Google to populate basic information about each of our cafes via the Google Places API. As both applications are built with React and are hosted separately, this server serves only json data. 

To checkout the other repos associated with this app check out these links:

- [Client Front End](https://github.com/dan-gentile/coffee-app-client)
- [Server Dashboard](https://github.com/dan-gentile/coffee-app-dashboard)

This server is deployed on Heroku

### Tech-Breakdown

- MERN stack
- Google Places API for searching and gathering data about cafes
- Axios for API calls
- Mongoose for interacting with our MongoDB database
- Atlas for hosting our MongoDB database
- bcrypt for salting and hashing our passwords
- google-auth-library for authenticating our OAuth Google Sign In users
- jsonwebtoken for authenticating our admin users
- Morgan for logging
- Cors for allowing requests from our separately hosted front ends


### Technologies

Project is created with:
​

- [Node JS](https://nodejs.org/en/)
- [Express JS](https://expressjs.com/)
- [Google Places API](https://developers.google.com/places/web-service/overview)
- [Axios](https://www.npmjs.com/package/axios)
- [Json Web Token](https://www.npmjs.com/package/jsonwebtoken)
- [Google Auth Library](https://www.npmjs.com/package/google-auth-library)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [bcrypt](https://www.npmjs.com/package/bcrypt)
- [JavaScript](https://www.javascript.com/)

## Contributing

We are currently not seeking contributions at this time.

## Questions

If you have any questions or problems with the app please create an issue.

### Authors

- [Elijah Blaisdell](https://github.com/elijah415hz)
- [Dan Gentile](https://github.com/dan-gentile)
- [Wesley McMillan](https://github.com/wmcmillan)
- [Maxwell Hanson](https://github.com/MaxHanson07)

​
