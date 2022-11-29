const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (value.length < 5) {
                throw new Error('Username must be more than 4 characters');
            }
        }
    },
    password: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String
        }
    }]
});

userSchema.virtual('taskLists', {
    ref: 'TaskList',
    localField: '_id',
    foreignField: 'owner'
});

userSchema.methods.authUser = async function () {
    const user = this;
    const token = jsonwebtoken.sign({ _id: user._id }, process.env.JWT_SECRET);

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token;
}

userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        if (user.password.length < 5) throw new Error('Password must be more than 4 characters');

        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

userSchema.statics.findByCredentials = async (username, password) => {

    const user = await User.findOne({ username });

    if (!user) throw new Error('User does not exist');

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
        return user;
    } else {
        throw new Error('Wrong credentials');
    }

}

const User = mongoose.model('User', userSchema, 'User');
module.exports = User;