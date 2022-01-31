const {Geet} = require('../models/Geet.js');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/geet');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

async function addTwo()
{
    await Geet.deleteMany({});
    const song1 = new Geet(
        {
            songName: 'Swalla',
            songPath: '/songs/swalla.mp3',
            artist:'Jason Derulo'
        }
    );
    const song2 = new Geet(
        {
            songName: 'Perfect',
            songPath: '/songs/perfect.mp3',
            artist:'Ed Sheeran'
        }
    );
    await song1.save();
    await song2.save();
}
addTwo();

