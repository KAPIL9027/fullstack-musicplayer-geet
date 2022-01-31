const mongoose = require('mongoose');
const Comment = require('./Comment');
const Schema = mongoose.Schema;

const imageSchema = new Schema(
    {
        url: String,
        filename: String
    }
);

imageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_500');
});

const opts = { toJSON: { virtuals: true } };

const geetSchema = new Schema({
    songName:
    {
        type: String,
        required: true
    },
    artist:
    {
        type: String
    },
    images:
    {
      type: [imageSchema]
    },
    duration:String,
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});
geetSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Comment.deleteMany({
            _id: {
                $in: doc.comments
            }
        })
    }
});


module.exports.Geet = mongoose.model('Geet',geetSchema);