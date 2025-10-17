import mongoose from 'mongoose';

export const mongoDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/hospital");
        console.log("MongoDB Connected");
    } catch (err) {
        console.log(err);
        console.log("MongoDb failed to connect");

    }
}
