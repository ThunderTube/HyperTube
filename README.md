# ThunderTube

We did our Hypertube project using Vue.js, TailwindCSS, Node.js with Express.js and MongoDB.
Everything can be launched using Docker 🎉.

## Requirements

To start the project make sure Docker is correctly installed on your machine.

At the root of the project you can interact with the scripts in the `package.json` file.

## Development mode

To start the project on development mode run :

`docker-compose -f common.yml -f development.yml up`

## Production mode

To start the projet on production mode run :

`docker-compose -f common.yml -f production.yml up`

## Database seeding (WIP)

To seed the database you can run :

`MONGO_URI=<URI to MongoDB> yarn run restore`
