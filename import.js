require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/coursehub";

// Function to convert MongoDB Extended JSON _id to string
function convertId(doc) {
    const { _id, rating, ...rest } = doc;
    // Convert rating to number if possible, otherwise set to 0
    let cleanRating = 0;
    if (rating !== undefined) {
        cleanRating = typeof rating === 'number' ? rating : parseFloat(rating) || 0;
    }
    return { ...rest, rating: cleanRating };
}

async function importData() {
    try {
        await mongoose.connect(MONGO_URI, {
            connectTimeoutMS: 60000,
            socketTimeoutMS: 60000,
            serverSelectionTimeoutMS: 60000
        });
        console.log("✅ Connected to MongoDB Atlas");

        // Import courses
        if (fs.existsSync('courses.json')) {
            let courses = JSON.parse(fs.readFileSync('courses.json', 'utf8'));
            courses = courses.map(convertId);
            const Course = mongoose.model("Course", new mongoose.Schema({
                title: String,
                provider: String,
                category: String,
                cost: String,
                rating: Number,
                link: String
            }));
            await Course.deleteMany({});
            await Course.insertMany(courses);
            console.log(`✅ Added ${courses.length} courses`);
        } else {
            console.log("⚠️ courses.json not found");
        }

        // Import company_courses
        if (fs.existsSync('coursehub.company_courses.json')) {
            let topcompany = JSON.parse(fs.readFileSync('coursehub.company_courses.json', 'utf8'));
            topcompany = topcompany.map(convertId);
            const CompanyCourse = mongoose.model("CompanyCourse", new mongoose.Schema({
                title: String,
                provider: String,
                subProvider: String,
                category: String,
                cost: String,
                rating: Number,
                suitableFor: String,
                link: String,
                company: String
            }), "company_courses");
            await CompanyCourse.deleteMany({});
            await CompanyCourse.insertMany(topcompany);
            console.log(`✅ Added ${topcompany.length} company courses`);
        } else {
            console.log("⚠️ coursehub.company_courses.json not found");
        }

        // Import users
        if (fs.existsSync('users.json')) {
            let users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
            users = users.map(convertId);
            const User = mongoose.model("User", new mongoose.Schema({
                name: String,
                email: String,
                password: String,
                createdAt: Date
            }), "Users");
            await User.deleteMany({});
            await User.insertMany(users);
            console.log(`✅ Added ${users.length} users`);
        } else {
            console.log("⚠️ users.json not found");
        }

        console.log("\n🎉 Import completed!");
        await mongoose.connection.close();
        process.exit(0);

    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

importData();
