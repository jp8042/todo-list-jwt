const mongoose = require('mongoose');

const dbName = 'test';

const init = async () => {
    try {
        await mongoose.connect(
            process.env.MONGODB_URL + '/' + dbName
            , { useNewUrlParser: true });
        console.log('connected successfuly');
    }
    catch (e) {
        console.log(e);
    }
};

module.exports = {
    init,
}