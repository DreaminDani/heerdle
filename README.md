# Heerdle

## Developing

First, seed the 'tracks' database collection:

1. Setup connection to spotify and mongodb

```bash
# ./.env
SPOTIFY_CLIENT_ID=abc
SPOTIFY_CLIENT_SECRET=123
MONGODB_URI=mongodb+srv://database:pass@user.url.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=database
```

2. Get the top tracks from Spotify to seed

```bash
nvm use
npm install
npm run seed
```

Then, get the frontend up and running

```bash
cd frontend
npm install
npm run dev
```