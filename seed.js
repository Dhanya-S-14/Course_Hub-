require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/coursehub";

const courseSchema = new mongoose.Schema({
    title: String,
    provider: String,
    category: String,
    cost: String,
    rating: Number,
    link: String
});

const Course = mongoose.model("Course", courseSchema);

const sampleCourses = [
    {
        title: "Python for Everybody",
        provider: "Coursera - University of Michigan",
        category: "Python",
        cost: "Free to Audit",
        rating: 4.8,
        link: "https://www.coursera.org/specializations/python"
    },
    {
        title: "Machine Learning",
        provider: "Coursera - Stanford",
        category: "Machine Learning",
        cost: "Free to Audit",
        rating: 4.9,
        link: "https://www.coursera.org/learn/machine-learning"
    },
    {
        title: "Full Stack Web Development",
        provider: "freeCodeCamp",
        category: "Web Development",
        cost: "Free",
        rating: 4.7,
        link: "https://www.freecodecamp.org/learn"
    },
    {
        title: "Data Structures & Algorithms",
        provider: "GeeksforGeeks",
        category: "DSA",
        cost: "Free",
        rating: 4.6,
        link: "https://www.geeksforgeeks.org/data-structures/"
    },
    {
        title: "AWS Cloud Practitioner",
        provider: "AWS Training",
        category: "Cloud",
        cost: "Free",
        rating: 4.5,
        link: "https://aws.amazon.com/training/learn/"
    },
    {
        title: "CS50: Introduction to Computer Science",
        provider: "Harvard",
        category: "Computer Science",
        cost: "Free",
        rating: 4.9,
        link: "https://cs50.harvard.edu/x/"
    },
    {
        title: "JavaScript Algorithms and Data Structures",
        provider: "freeCodeCamp",
        category: "JavaScript",
        cost: "Free",
        rating: 4.7,
        link: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/"
    },
    {
        title: "SQL for Data Science",
        provider: "Coursera - UC Davis",
        category: "SQL",
        cost: "Free to Audit",
        rating: 4.6,
        link: "https://www.coursera.org/learn/sql-for-data-science"
    },
    {
        title: "React - The Complete Guide",
        provider: "Udemy",
        category: "React",
        cost: "₹499 (Sale)",
        rating: 4.7,
        link: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/"
    },
    {
        title: "Android Development with Kotlin",
        provider: "Google - Android Developers",
        category: "Android",
        cost: "Free",
        rating: 4.5,
        link: "https://developer.android.com/courses"
    },
    {
        title: "Docker & Kubernetes",
        provider: "Kubernetes.io",
        category: "DevOps",
        cost: "Free",
        rating: 4.6,
        link: "https://kubernetes.io/docs/tutorials/"
    },
    {
        title: "TensorFlow Developer Certificate",
        provider: "Coursera - DeepLearning.AI",
        category: "Deep Learning",
        cost: "₹1,476/month",
        rating: 4.7,
        link: "https://www.coursera.org/professional-certificates/tensorflow-in-practice"
    },
    {
        title: "The Complete 2024 Web Development Bootcamp",
        provider: "Udemy - Dr. Angela Yu",
        category: "Web Development",
        cost: "₹499 (Sale)",
        rating: 4.7,
        link: "https://www.udemy.com/course/the-complete-web-development-bootcamp/"
    },
    {
        title: "Google Data Analytics Certificate",
        provider: "Google - Coursera",
        category: "Data Analytics",
        cost: "$49/mo",
        rating: 4.8,
        link: "https://www.coursera.org/professional-certificates/google-data-analytics"
    },
    {
        title: "Microsoft Azure Fundamentals",
        provider: "Microsoft Learn",
        category: "Cloud",
        cost: "Free",
        rating: 4.6,
        link: "https://learn.microsoft.com/en-us/certifications/azure-fundamentals/"
    },
    {
        title: "Neural Networks and Deep Learning",
        provider: "DeepLearning.AI - Coursera",
        category: "Deep Learning",
        cost: "Free to Audit",
        rating: 4.8,
        link: "https://www.coursera.org/learn/neural-networks-deep-learning"
    },
    {
        title: "Git & GitHub Complete Guide",
        provider: "Udemy",
        category: "DevOps",
        cost: "₹499 (Sale)",
        rating: 4.6,
        link: "https://www.udemy.com/course/git-and-github-complete-guide/"
    },
    {
        title: "MongoDB Complete Developer Guide",
        provider: "Udemy",
        category: "Database",
        cost: "₹499 (Sale)",
        rating: 4.5,
        link: "https://www.udemy.com/course/mongodb-complete-developers-guide/"
    },
    {
        title: "Docker Mastery",
        provider: "Udemy - Bret Fisher",
        category: "DevOps",
        cost: "₹499 (Sale)",
        rating: 4.7,
        link: "https://www.udemy.com/course/docker-mastery/"
    },
    {
        title: "CompTIA A+ Certification",
        provider: "CompTIA",
        category: "IT Support",
        cost: "$370",
        rating: 4.4,
        link: "https://www.comptia.org/certifications/a"
    }
];

async function seedCourses() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Clear existing courses
        await Course.deleteMany({});
        console.log("🗑️ Cleared existing courses");

        // Insert new courses
        const result = await Course.insertMany(sampleCourses);
        console.log(`✅ Added ${result.length} courses successfully!`);

        // Show added courses
        console.log("\n📚 Added Courses:");
        result.forEach((course, i) => {
            console.log(`${i + 1}. ${course.title} (${course.category})`);
        });

        await mongoose.connection.close();
        console.log("\n🔒 Connection closed");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

seedCourses();
