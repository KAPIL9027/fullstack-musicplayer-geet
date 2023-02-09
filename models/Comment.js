const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema(
    {
        author: 
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        body: String, 
    }
);

module.exports = mongoose.model('Comment',commentSchema);