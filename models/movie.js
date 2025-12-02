const mongoose = require("mongoose");

const movieSchema = mongoose.Schema({
    name: {              // converted from title -> name
        type: String,
        required: true
    },
    description: {       // new field instead of author
        type: String,
        required: true
    },
    year: {              // converted from pages -> year
        type: Number,
        required: true
    },
    genres: {            // same as before
        type: [String],
        required: true
    },
    rating: {            // same as before
        type: Number,
        required: true
    },
    posted_by: {         // track which user posted the movie
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    date: {              // when the movie was added
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Movie", movieSchema);
