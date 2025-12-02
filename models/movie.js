const mongoose = require("mongoose");

const movieSchema = mongoose.Schema({
    name: {              
        type: String,
        required: true
    },
    description: {       
        type: String,
        required: true
    },
    year: {              
        type: Number,
        required: true
    },
    genres: {            
        type: [String],
        required: true
    },
    rating: {           
        type: Number,
        required: true
    },
    posted_by: {         
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    date: {              
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Movie", movieSchema);
