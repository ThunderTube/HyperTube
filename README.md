To start project make sure yarn and docker ce is installed on your machine

At the root of the project you can interact with the scripts in the package.json

To start the project

`yarn dev:install && yarn dev:up`

After the first run you can just

`yarn dev:up`

To install any packages you need to stop the containers

`yarn dev:down`

cd into the app or api yarn add your-module and start back up the containers

To seed the database, you can run the following command :

`MONGO_URI=<URI to MongoDB> yarn run restore`
