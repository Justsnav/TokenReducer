const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://abhinavsingh882005_db_user:vGuCtkdOLHzKf8ld@todo.6ag6bdr.mongodb.net/TokenReducer");
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    }
})
const userDataSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId
    },
    description: String
})

const userModel = mongoose.model("user",userSchema);
const userDataModel = mongoose.model("userData",userDataSchema);
module.exports = {
    userModel,
    userDataModel
}
