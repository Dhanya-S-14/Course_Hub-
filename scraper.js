require('dotenv').config();
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: String,
    provider: String,
    category: String,
    cost: String,
    rating: Number,
    link: String,
    updatedAt: Date
});

const CompanyCourse = mongoose.model("CompanyCourse", courseSchema, "company_courses");

const cors = require('cors');
const express = require('express');
const https = require('https');
const http = require('http');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/coursehub";

const allCourses = {
    coursera: [
        { provider: "Coursera", category: "AI/Machine Learning", baseUrl: "https://www.coursera.org/search", cost: "$49/mo" },
        { provider: "Coursera", category: "Data Science", baseUrl: "https://www.coursera.org/search", cost: "$49/mo" },
        { provider: "Coursera", category: "Cloud Computing", baseUrl: "https://www.coursera.org/search", cost: "$49/mo" },
        { provider: "Coursera", category: "Cybersecurity", baseUrl: "https://www.coursera.org/search", cost: "$49/mo" },
        { provider: "Coursera", category: "Full Stack", baseUrl: "https://www.coursera.org/search", cost: "$49/mo" },
        { provider: "Coursera", category: "BlockChain", baseUrl: "https://www.coursera.org/search", cost: "$49/mo" },
        { provider: "Coursera", category: "DevOps", baseUrl: "https://www.coursera.org/search", cost: "$49/mo" },
        { provider: "Coursera", category: "Data Analytics", baseUrl: "https://www.coursera.org/search", cost: "$49/mo" }
    ],
    udemy: [
        { provider: "Udemy", category: "AI/Machine Learning", baseUrl: "https://www.udemy.com/leaderboard", cost: "Paid" },
        { provider: "Udemy", category: "Data Science", baseUrl: "https://www.udemy.com/leaderboard", cost: "Paid" },
        { provider: "Udemy", category: "Web Development", baseUrl: "https://www.udemy.com/leaderboard", cost: "Paid" },
        { provider: "Udemy", category: "Cloud Computing", baseUrl: "https://www.udemy.com/leaderboard", cost: "Paid" },
        { provider: "Udemy", category: "DevOps", baseUrl: "https://www.udemy.com/leaderboard", cost: "Paid" },
        { provider: "Udemy", category: "Mobile App", baseUrl: "https://www.udemy.com/leaderboard", cost: "Paid" }
    ],
    geeksforgeeks: [
        { provider: "GeeksforGeeks", category: "DSA", baseUrl: "https://www.geeksforgeeks.org/data-structures", cost: "Free" },
        { provider: "GeeksforGeeks", category: "Competitive Programming", baseUrl: "https://www.geeksforgeeks.org", cost: "Free" },
        { provider: "GeeksforGeeks", category: "AI", baseUrl: "https://www.geeksforgeeks.org", cost: "Free" },
        { provider: "GeeksforGeeks", category: "ML", baseUrl: "https://www.geeksforgeeks.org", cost: "Free" }
    ],
    YouTube: [
        { provider: "YouTube", category: "Web Development", baseUrl: "https://www.youtube.com/@CleverProgrammer", cost: "Free" },
        { provider: "YouTube", category: "AI/Machine Learning", baseUrl: "https://www.youtube.com/@ Krish Naik", cost: "Free" },
        { provider: "YouTube", category: "Data Science", baseUrl: "https://www.youtube.com/@DataScience", cost: "Free" }
    ],
   Scaler: [
        { provider: "Scaler", category: "DSA", baseUrl: "https://www.scaler.com/topics/", cost: "Free" },
        { provider: "Scaler", category: "System Design", baseUrl: "https://www.scaler.com/topics/", cost: "Free" },
        { provider: "Scaler", category: "Web Development", baseUrl: "https://www.scaler.com/topics/", cost: "Free" }
    ]
};

const staticCourses = [
    { title: "CS50's Introduction to Computer Science", provider: "Harvard (edX)", category: "Computer Science", cost: "Free", rating: 4.8, link: "https://cs50.harvard.edu/", company: "Harvard" },
    { title: "Machine Learning Specialization", provider: "Stanford (Coursera)", category: "AI/Machine Learning", cost: "$49/mo", rating: 4.7, link: "https://www.coursera.org/specializations/machine-learning-introduction", company: "Stanford" },
    { title: "The Full Stack Developer", provider: "Coursera", category: "Full Stack", cost: "$49/mo", rating: 4.6, link: "https://www.coursera.org", company: "Coursera" },
    { title: "Google Data Analytics", provider: "Google (Coursera)", category: "Data Analytics", cost: "$49/mo", rating: 4.8, link: "https://www.coursera.org/professional-certificates/google-data-analytics", company: "Google" },
    { title: "AWS Cloud Practitioner", provider: "AWS", category: "Cloud Computing", cost: "Free", rating: 4.7, link: "https://aws.amazon.com/training/", company: "Amazon" },
    { title: "Meta Front-End Developer", provider: "Meta (Coursera)", category: "Web Development", cost: "$49/mo", rating: 4.6, link: "https://www.coursera.org/professional-certificates/meta-front-end-developer", company: "Meta" },
    { title: "IBM Cybersecurity Analyst", provider: "IBM (Coursera)", category: "Cybersecurity", cost: "$49/mo", rating: 4.5, link: "https://www.coursera.org/professional-certificates/ibm-cybersecurity-analyst", company: "IBM" },
    { title: "DeepLearning.AI TensorFlow Developer", provider: "DeepLearning.AI (Coursera)", category: "AI/Deep Learning", cost: "$49/mo", rating: 4.7, link: "https://www.coursera.org/professional-certificates/deeplearning-ai-tensorflow-in-machine-learning", company: "DeepLearning" },
    { title: "Microsoft Azure Fundamentals", provider: "Microsoft Learn", category: "Cloud Computing", cost: "Free", rating: 4.7, link: "https://learn.microsoft.com/en-us/training/paths/azure-fundamentals/", company: "Microsoft" },
    { title: "Google Project Management", provider: "Google (Coursera)", category: "Project Management", cost: "$49/mo", rating: 4.7, link: "https://www.coursera.org/professional-certificates/google-project-management", company: "Google" },
    { title: "Complete Web Development Bootcamp", provider: "Angela Yu (Udemy)", category: "Web Development", cost: "Paid", rating: 4.8, link: "https://www.udemy.com/course/the-complete-web-development-bootcamp/", company: "Udemy" },
    { title: "React - The Complete Guide", provider: "Academind (Udemy)", category: "React JS", cost: "Paid", rating: 4.7, link: "https://www.udemy.com/course/react-the-complete-guide/", company: "Udemy" },
    { title: "Python for Everybody", provider: "University of Michigan (Coursera)", category: "Python", cost: "$49/mo", rating: 4.8, link: "https://www.coursera.org/specializations/python", company: "Coursera" },
    { title: "IBM Data Science Professional Certificate", provider: "IBM (Coursera)", category: "Data Science", cost: "$49/mo", rating: 4.6, link: "https://www.coursera.org/professional-certificates/ibm-data-science", company: "IBM" },
    { title: "Google UX Design Certificate", provider: "Google (Coursera)", category: "UX Design", cost: "$49/mo", rating: 4.8, link: "https://www.coursera.org/professional-certificates/google-ux-design", company: "Google" },
    { title: "DSA Self Paced", provider: "GeeksforGeeks", category: "DSA", cost: "Free", rating: 4.7, link: "https://practice.geeksforgeeks.org/courses/dsa-self-paced", company: "GeeksforGeeks" },
    { title: "DSA with Java", provider: "Scaler Academy", category: "DSA", cost: "Paid", rating: 4.6, link: "https://www.scaler.com/", company: "Scaler" },
    { title: "System Design Live", provider: "Scaler Academy", category: "System Design", cost: "Paid", rating: 4.7, link: "https://www.scaler.com/", company: "Scaler" },
    { title: "Google Cybersecurity Certificate", provider: "Google (Coursera)", category: "Cybersecurity", cost: "$49/mo", rating: 4.7, link: "https://www.coursera.org/professional-certificates/google-cybersecurity", company: "Google" },
    { title: "Meta Back-End Developer", provider: "Meta (Coursera)", category: "Back-End", cost: "$49/mo", rating: 4.6, link: "https://www.coursera.org/professional-certificates/meta-back-end-developer", company: "Meta" }
];

async function updateAllCourses() {
    await mongoose.connect(MONGO_URI);
    console.log("🔄 Starting course update...");
    
    const timestamp = new Date();
    let added = 0;
    let updated = 0;
    
    for (const course of staticCourses) {
        course.updatedAt = timestamp;
        
        const existing = await CompanyCourse.findOne({ title: course.title });
        if (existing) {
            Object.assign(existing, course);
            await existing.save();
            updated++;
        } else {
            await CompanyCourse.create(course);
            added++;
        }
    }
    
    console.log(`✅ Update complete! Added: ${added}, Updated: ${updated}`);
    console.log(`📊 Total courses in database: ${await CompanyCourse.countDocuments()}`);
    
    await mongoose.disconnect();
    return { added, updated, total: await CompanyCourse.countDocuments() };
}

app.get('/api/update-courses', async (req, res) => {
    try {
        const result = await updateAllCourses();
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/courses-list', async (req, res) => {
    try {
        await mongoose.connect(MONGO_URI);
        const courses = await CompanyCourse.find().sort({ title: 1 });
        await mongoose.disconnect();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/courses-count', async (req, res) => {
    try {
        await mongoose.connect(MONGO_URI);
        const count = await CompanyCourse.countDocuments();
        const providers = await CompanyCourse.distinct('provider');
        const categories = await CompanyCourse.distinct('category');
        await mongoose.disconnect();
        res.json({ totalCourses: count, providers: providers.length, categories: categories.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

if (require.main === module) {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, async () => {
        console.log(`🚀 Scraper API running on port ${PORT}`);
        console.log(`📌 Update courses: http://localhost:${PORT}/api/update-courses`);
        await updateAllCourses();
        process.exit(0);
    });
}

module.exports = { updateAllCourses, allCourses };