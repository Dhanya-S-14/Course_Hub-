require('dotenv').config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const cron = require("node-cron");
const axios = require("axios");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Schemas
const courseSchema = new mongoose.Schema({
    title: String,
    provider: String,
    category: String,
    cost: String,
    rating: Number,
    link: String
});

const companyCourseSchema = new mongoose.Schema({
    title: String,
    provider: String,
    subProvider: String,
    category: String,
    cost: String,
    rating: Number,
    suitableFor: String,
    link: String,
    company: String
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const youtubeCourseSchema = new mongoose.Schema({
    videoId: String,
    title: { type: String, required: true },
    description: String,
    thumbnail: String,
    videoUrl: { type: String, required: true },
    channelName: String,
    channelUrl: String,
    category: String,
    duration: String,
    publishedAt: Date,
    viewCount: Number,
    courseType: { type: String, default: 'YouTube' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Models
const Course = mongoose.model("Course", courseSchema);
const CompanyCourse = mongoose.model("CompanyCourse", companyCourseSchema, "company_courses");
const User = mongoose.model("User", userSchema, "Users");
const YouTubeCourse = mongoose.models.YouTubeCourse || mongoose.model("YouTubeCourse", youtubeCourseSchema, "youtube_courses");

// API Routes
app.get("/api/courses", async (req, res) => {
    try {
        const { search, cost, category } = req.query;
        let filter = {};
        
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { category: { $regex: search, $options: "i" } },
                { provider: { $regex: search, $options: "i" } }
            ];
        }
        
        if (cost && cost !== "all") filter.cost = cost;
        
        if (category) {
            filter.category = { $regex: category, $options: "i" };
        }
        
        const courses = await mongoose.connection.db.collection('courses').find(filter).toArray();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/courses", async (req, res) => {
    try {
        const course = req.body;
        const result = await mongoose.connection.db.collection('courses').insertOne(course);
        res.status(201).json({ message: "Course added", id: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/courses/:id", async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const id = new ObjectId(req.params.id);
        await mongoose.connection.db.collection('courses').deleteOne({ _id: id });
        res.json({ message: "Course deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/company-courses", async (req, res) => {
    try {
        const { company } = req.query;
        let filter = {};
        if (company) filter.company = { $regex: new RegExp(company, 'i') };
        const courses = await mongoose.connection.db.collection('company_courses').find(filter).toArray();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/company-courses", async (req, res) => {
    try {
        const courses = req.body;
        if (Array.isArray(courses)) {
            await CompanyCourse.insertMany(courses);
        } else {
            const course = new CompanyCourse(courses);
            await course.save();
        }
        res.status(201).json({ message: "Courses added successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/api/company-courses/:id", async (req, res) => {
    try {
        const { ObjectId } = require('mongodb');
        const id = new ObjectId(req.params.id);
        await mongoose.connection.db.collection('company_courses').deleteOne({ _id: id });
        res.json({ message: "Company course deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/seed-google-courses", async (req, res) => {
    try {
        const existingCount = await CompanyCourse.countDocuments({ company: "Google" });
        if (existingCount > 0) {
            return res.json({ message: "Google courses already exist", count: existingCount });
        }
        
        const googleCourses = [
            {
                title: "Google Data Analytics Certificate",
                provider: "Google (Coursera)",
                subProvider: "Coursera",
                category: "Data Analytics",
                cost: "$49/mo (audit free)",
                rating: 4.8,
                suitableFor: "CS students learning data skills for AI/ML projects",
                link: "https://www.coursera.org/professional-certificates/google-data-analytics",
                company: "Google"
            },
            {
                title: "Google Project Management Certificate",
                provider: "Google (Coursera)",
                subProvider: "Coursera",
                category: "Project Management",
                cost: "$49/mo (audit free)",
                rating: 4.7,
                suitableFor: "Students managing group projects/coding contests",
                link: "https://www.coursera.org/professional-certificates/google-project-management",
                company: "Google"
            },
            {
                title: "Google Cybersecurity Certificate",
                provider: "Google (Coursera)",
                subProvider: "Coursera",
                category: "Cybersecurity",
                cost: "$49/mo (audit free)",
                rating: 4.7,
                suitableFor: "CS undergrads entering security/internships",
                link: "https://www.coursera.org/professional-certificates/google-cybersecurity",
                company: "Google"
            },
            {
                title: "Google Digital Marketing & E-commerce Certificate",
                provider: "Google (Coursera)",
                subProvider: "Coursera",
                category: "Digital Marketing",
                cost: "$49/mo (audit free)",
                rating: 4.8,
                suitableFor: "Students exploring app/web promotion",
                link: "https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce",
                company: "Google"
            },
            {
                title: "Google IT Support Certificate",
                provider: "Google (Coursera)",
                subProvider: "Coursera",
                category: "IT Support",
                cost: "$49/mo (audit free)",
                rating: 4.7,
                suitableFor: "Beginners building sysadmin basics",
                link: "https://www.coursera.org/professional-certificates/google-it-support",
                company: "Google"
            },
            {
                title: "Google UX Design Certificate",
                provider: "Google (Coursera)",
                subProvider: "Coursera",
                category: "UX Design",
                cost: "$49/mo (audit free)",
                rating: 4.8,
                suitableFor: "CS students in HCI/UI for software projects",
                link: "https://www.coursera.org/professional-certificates/google-ux-design",
                company: "Google"
            },
            {
                title: "Google AI Professional Certificate",
                provider: "Google (Coursera)",
                subProvider: "Coursera",
                category: "AI Skills",
                cost: "$49/mo (audit free)",
                rating: 4.7,
                suitableFor: "AI enthusiasts like you for practical ML",
                link: "https://grow.google/certificates-coursera",
                company: "Google"
            },
            {
                title: "Fundamentals of Digital Marketing",
                provider: "Google Digital Garage",
                subProvider: "Digital Garage",
                category: "Digital Marketing",
                cost: "Free",
                rating: 4.7,
                suitableFor: "All students promoting personal projects",
                link: "https://skillshop.exceedlms.com/student/path/111399-fundamentals-of-digital-marketing",
                company: "Google"
            },
            {
                title: "Get a Business Online",
                provider: "Google Digital Garage",
                subProvider: "Digital Garage",
                category: "Business Online",
                cost: "Free",
                rating: 4.6,
                suitableFor: "CS students launching apps/websites",
                link: "https://skillshop.exceedlms.com",
                company: "Google"
            },
            {
                title: "Promote a Business with Content",
                provider: "Google Digital Garage",
                subProvider: "Digital Garage",
                category: "Content Marketing",
                cost: "Free",
                rating: 4.6,
                suitableFor: "Students sharing coding portfolios",
                link: "https://skillshop.exceedlms.com",
                company: "Google"
            },
            {
                title: "Land Your Next Job",
                provider: "Google Digital Garage",
                subProvider: "Digital Garage",
                category: "Career Development",
                cost: "Free",
                rating: 4.7,
                suitableFor: "Undergrads prepping IIT internships",
                link: "https://skillshop.exceedlms.com",
                company: "Google"
            }
        ];
        
        await CompanyCourse.insertMany(googleCourses);
        res.status(201).json({ message: "Google courses added successfully", count: googleCourses.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/seed-microsoft-courses", async (req, res) => {
    try {
        const existingCount = await CompanyCourse.countDocuments({ company: "Microsoft" });
        if (existingCount > 0) {
            return res.json({ message: "Microsoft courses already exist", count: existingCount });
        }
        
        const microsoftCourses = [
            {
                title: "Microsoft Azure AI Fundamentals",
                provider: "Microsoft (Coursera)",
                subProvider: "Coursera",
                category: "AI/ML",
                cost: "$49/mo (audit free)",
                rating: 4.6,
                suitableFor: "CS students starting AI projects",
                link: "https://www.coursera.org/professional-certificates/microsoft-azure-ai",
                company: "Microsoft"
            },
            {
                title: "Microsoft Power Platform Fundamentals",
                provider: "Microsoft (Coursera)",
                subProvider: "Coursera",
                category: "Low-Code Development",
                cost: "$49/mo (audit free)",
                rating: 4.7,
                suitableFor: "Undergrads automating workflows",
                link: "https://www.coursera.org/professional-certificates/microsoft-power-platform",
                company: "Microsoft"
            },
            {
                title: "Microsoft Cybersecurity Analyst",
                provider: "Microsoft (Coursera)",
                subProvider: "Coursera",
                category: "Cybersecurity",
                cost: "$49/mo (audit free)",
                rating: 4.6,
                suitableFor: "Security for coding contests/internships",
                link: "https://www.coursera.org/professional-certificates/microsoft-cybersecurity-analyst",
                company: "Microsoft"
            },
            {
                title: "Microsoft Project Management",
                provider: "Microsoft (Coursera)",
                subProvider: "Coursera",
                category: "Project Management",
                cost: "$49/mo (audit free)",
                rating: 4.7,
                suitableFor: "Group projects and MLOps",
                link: "https://www.coursera.org/professional-certificates/microsoft-project-management",
                company: "Microsoft"
            },
            {
                title: "Azure Fundamentals (AZ-900)",
                provider: "Microsoft Learn",
                subProvider: "Microsoft Learn",
                category: "Cloud Computing",
                cost: "Free",
                rating: 4.7,
                suitableFor: "CS basics for cloud/AI deployment",
                link: "https://learn.microsoft.com/en-us/training/paths/azure-fundamentals",
                company: "Microsoft"
            },
            {
                title: "Introduction to Generative AI",
                provider: "Microsoft Learn",
                subProvider: "Microsoft Learn",
                category: "AI",
                cost: "Free",
                rating: 4.8,
                suitableFor: "Your AI research interests",
                link: "https://learn.microsoft.com/en-us/training/paths/fundamentals-generative-ai",
                company: "Microsoft"
            },
            {
                title: "Power BI Data Analyst",
                provider: "Microsoft Learn",
                subProvider: "Microsoft Learn",
                category: "Data Analytics",
                cost: "Free",
                rating: 4.7,
                suitableFor: "Data viz for projects like Google cert",
                link: "https://learn.microsoft.com/en-us/training/paths/data-analyst-associate",
                company: "Microsoft"
            },
            {
                title: ".NET Developer Path",
                provider: "Microsoft Learn",
                subProvider: "Microsoft Learn",
                category: "Software Development",
                cost: "Free",
                rating: 4.6,
                suitableFor: "C# coding for apps/extensions",
                link: "https://learn.microsoft.com/en-us/training/paths/dotnet-developer",
                company: "Microsoft"
            }
        ];
        
        await CompanyCourse.insertMany(microsoftCourses);
        res.status(201).json({ message: "Microsoft courses added successfully", count: microsoftCourses.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log("Register request:", { name, email });
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields required" });
        }
        
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: "Email already registered" });
        }
        
        const user = new User({ name, email, password });
        await user.save();
        
        console.log("User saved! ID:", user._id);
        res.status(201).json({ 
            message: "Success", 
            user: { id: user._id.toString(), name, email } 
        });
    } catch (err) {
        console.log("Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login request:", { email });
        
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        
        console.log("Login success:", email);
        res.json({ 
            message: "Success", 
            user: { id: user._id.toString(), name: user.name, email } 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/test", async (req, res) => {
    try {
        const users = await mongoose.connection.db.collection('Users').countDocuments();
        const courses = await mongoose.connection.db.collection('courses').countDocuments();
        const companyCourses = await mongoose.connection.db.collection('company_courses').countDocuments();
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionInfo = [];
        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            collectionInfo.push({ name: col.name, count: count });
        }
        
        res.json({ 
            status: "OK", 
            mongoDB: "Connected",
            users: users,
            courses: courses,
            companyCourses: companyCourses,
            collections: collectionInfo
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const defaultCourses = [
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
    { title: "Meta Back-End Developer", provider: "Meta (Coursera)", category: "Back-End", cost: "$49/mo", rating: 4.6, link: "https://www.coursera.org/professional-certificates/meta-back-end-developer", company: "Meta" },
    { title: "Apple Foundation Series", provider: "Apple", category: "Swift Development", cost: "Free", rating: 4.8, link: "https://developer.apple.com/", company: "Apple" },
    { title: "Adobe UI/UX Design", provider: "Adobe", category: "UI/UX Design", cost: "Paid", rating: 4.6, link: "https://www.adobe.com/", company: "Adobe" },
    { title: "Oracle Cloud Infrastructure", provider: "Oracle", category: "Cloud Computing", cost: "Free", rating: 4.5, link: "https://www.oracle.com/cloud/", company: "Oracle" },
    { title: "Cisco Networking", provider: "Cisco", category: "Networking", cost: "Free", rating: 4.7, link: "https://www.cisco.com/", company: "Cisco" },
    { title: "TCS iON Career Edge", provider: "TCS", category: "Career Development", cost: "Free", rating: 4.4, link: "https://www.tcs.com/", company: "TCS" },
    { title: "Wipro TalentNext", provider: "Wipro", category: "Career Development", cost: "Free", rating: 4.3, link: "https://www.wipro.com/", company: "Wipro" },
    { title: "Infosys Springboard", provider: "Infosys", category: "Career Development", cost: "Free", rating: 4.4, link: "https://www.infosys.com/", company: "Infosys" },
    { title: "Accenture Digital Skills", provider: "Accenture", category: "Digital Skills", cost: "Free", rating: 4.5, link: "https://www.accenture.com/", company: "Accenture" },
    { title: "HCL Tech Bee", provider: "HCL", category: "Career Development", cost: "Free", rating: 4.2, link: "https://www.hcltech.com/", company: "HCL" }
];

async function syncCoursesToCompany() {
    let added = 0, updated = 0;
    const timestamp = new Date();
    
    for (const course of defaultCourses) {
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
    return { added, updated };
}

app.get("/api/auto-update", async (req, res) => {
    try {
        const { scrapeAllCourses } = require('./courseScraper');
        const result = await scrapeAllCourses();
        res.json({ success: true, ...result, message: "Courses fetched from internet successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/scrape-courses", async (req, res) => {
    try {
        const { scrapeAllCourses } = require('./courseScraper');
        const result = await scrapeAllCourses();
        res.json({ success: true, ...result, message: "Course scraping complete!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/api/courses-stats", async (req, res) => {
    try {
        const total = await CompanyCourse.countDocuments();
        const providers = await CompanyCourse.distinct('provider');
        const categories = await CompanyCourse.distinct('category');
        const companies = await CompanyCourse.distinct('company');
        res.json({ totalCourses: total, providers: providers.length, categories: categories.length, companies: companies.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =========== YOU TUBE COURSES API ===========

const SEARCH_KEYWORDS = [
    'full course programming', 'python tutorial complete', 'web development full course',
    'machine learning tutorial', 'data structures algorithms', 'react js tutorial',
    'java tutorial complete', 'ai tutorial for beginners', 'javascript full course'
];

const CHANNELS = ['freeCodeCamp', 'CodeWithHarry', 'Apna College', 'Striver', 'Traversy Media'];

const categorize = (title, desc) => {
    const text = (title + ' ' + (desc || '')).toLowerCase();
    if (text.match(/ai|ml|machine learning|artificial intelligence|deep learning/)) return 'AI';
    if (text.match(/web|html|css|react|angular|vue|node|express|mern|full stack/)) return 'Web Dev';
    if (text.match(/dsa|data structure|algorithm|array|string|tree|graph/)) return 'DSA';
    if (text.match(/python|java|c\+\+|javascript|typescript/)) return 'Programming';
    if (text.match(/sql|database|mysql|mongodb/)) return 'Database';
    if (text.match(/cloud|aws|azure|docker|devops/)) return 'DevOps';
    return 'General';
};

app.get("/api/youtube-courses", async (req, res) => {
    try {
        const { category, channel, limit = 50 } = req.query;
        let query = {};
        if (category) query.category = category;
        if (channel) query.channelName = { $regex: new RegExp(channel, 'i') };

        const courses = await YouTubeCourse.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .select('-__v');

        res.json({ success: true, count: courses.length, courses });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get("/api/youtube-stats", async (req, res) => {
    try {
        const total = await YouTubeCourse.countDocuments();
        const categories = await YouTubeCourse.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        const channels = await YouTubeCourse.distinct('channelName');
        res.json({ success: true, total, categories: categories.map(c => ({ category: c._id, count: c.count })), channels: channels.length });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get("/api/sync-youtube", async (req, res) => {
    try {
        console.log('🔄 Syncing YouTube courses from API...');
        
        const apiKey = process.env.YOUTUBE_API_KEY;
        const searchKeywords = ['python full course', 'react js tutorial', 'machine learning tutorial', 'javascript tutorial', 'data structures algorithms', 'web development bootcamp', 'ai tutorial beginners', 'css tutorial'];
        
        let added = 0;
        
        for (const keyword of searchKeywords) {
            try {
                const searchUrl = 'https://www.googleapis.com/youtube/v3/search';
                const params = {
                    part: 'snippet',
                    q: keyword,
                    type: 'video',
                    maxResults: 5,
                    order: 'viewCount',
                    videoDuration: 'long',
                    key: apiKey
                };
                
                const response = await axios.get(searchUrl, { params, timeout: 10000 });
                
                for (const item of response.data.items || []) {
                    const snippet = item.snippet;
                    const videoId = item.id.videoId;
                    
                    const exists = await YouTubeCourse.findOne({ videoId });
                    if (exists) continue;
                    
                    await YouTubeCourse.create({
                        videoId: videoId,
                        title: snippet.title,
                        description: snippet.description?.substring(0, 500) || '',
                        thumbnail: snippet.thumbnails?.medium?.url || '',
                        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
                        channelName: snippet.channelTitle,
                        channelUrl: `https://www.youtube.com/${snippet.channelId}`,
                        category: categorize(snippet.title, snippet.description || ''),
                        publishedAt: new Date(snippet.publishedAt)
                    });
                    added++;
                }
                
                await new Promise(r => setTimeout(r, 1000));
            } catch (err) {
                console.log(`⚠️ Error searching "${keyword}": ${err.message}`);
            }
        }

        const total = await YouTubeCourse.countDocuments();
        console.log(`✅ Synced! Added: ${added}, Total: ${total}`);
        res.json({ success: true, message: 'YouTube courses synced from API', added, total });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const startCronJob = () => {
    try {
        console.log('⏰ Setting up cron job (every 6 hours)...');
        cron.schedule('0 */6 * * *', async () => {
            console.log('🔄 Running scheduled YouTube sync...');
            try {
                const syncPort = process.env.PORT || 5000;
                const res = await axios.get(`http://127.0.0.1:${syncPort}/api/sync-youtube`);
                console.log('✅ Auto-sync complete:', res.data);
            } catch (err) {
                console.log('❌ Auto-sync failed:', err.message);
            }
        });
        console.log('✓ Cron job: runs every 6 hours');
    } catch (err) {
        console.log('⚠️ Cron job setup warning:', err.message);
    }
};

// Serve static files
app.use(express.static(path.join(__dirname)));

// Catch all - serve index.html for any other route (keep at bottom)
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Auto-update courses database
const courseData = [
    { title: "Python for Everybody", provider: "University of Michigan", category: "Python", cost: "$49/mo", rating: 4.8, link: "https://www.coursera.org/learn/python", company: "Coursera" },
    { title: "Machine Learning Specialization", provider: "Stanford", category: "AI/Machine Learning", cost: "$49/mo", rating: 4.7, link: "https://www.coursera.org/specializations/machine-learning-introduction", company: "Stanford" },
    { title: "Google Data Analytics", provider: "Google", category: "Data Analytics", cost: "$49/mo", rating: 4.8, link: "https://www.coursera.org/professional-certificates/google-data-analytics", company: "Google" },
    { title: "AWS Certified Solutions Architect", provider: "Amazon", category: "Cloud Computing", cost: "Paid", rating: 4.8, link: "https://aws.amazon.com/training/", company: "Amazon" },
    { title: "Microsoft Azure Fundamentals", provider: "Microsoft", category: "Cloud Computing", cost: "Free", rating: 4.7, link: "https://learn.microsoft.com/en-us/training/paths/azure-fundamentals/", company: "Microsoft" },
    { title: "Meta Front-End Developer", provider: "Meta", category: "Web Development", cost: "$49/mo", rating: 4.6, link: "https://www.coursera.org/professional-certificates/meta-front-end-developer", company: "Meta" },
    { title: "IBM Cybersecurity Analyst", provider: "IBM", category: "Cybersecurity", cost: "$49/mo", rating: 4.5, link: "https://www.coursera.org/professional-certificates/ibm-cybersecurity-analyst", company: "IBM" },
    { title: "DeepLearning.AI TensorFlow", provider: "DeepLearning.AI", category: "AI/Deep Learning", cost: "$49/mo", rating: 4.7, link: "https://www.coursera.org/professional-certificates/deeplearning-ai-tensorflow-in-machine-learning", company: "DeepLearning" },
    { title: "Google UX Design Certificate", provider: "Google", category: "UX Design", cost: "$49/mo", rating: 4.8, link: "https://www.coursera.org/professional-certificates/google-ux-design", company: "Google" },
    { title: "CS50's Introduction to Computer Science", provider: "Harvard", category: "Computer Science", cost: "Free", rating: 4.8, link: "https://cs50.harvard.edu/", company: "Harvard" },
    { title: "Apple Swift Programming", provider: "Apple", category: "iOS Development", cost: "Free", rating: 4.8, link: "https://developer.apple.com/", company: "Apple" },
    { title: "Adobe Creative Cloud", provider: "Adobe", category: "Design", cost: "Paid", rating: 4.7, link: "https://www.adobe.com/", company: "Adobe" },
    { title: "Oracle Cloud Infrastructure", provider: "Oracle", category: "Cloud Computing", cost: "Free", rating: 4.5, link: "https://www.oracle.com/cloud/", company: "Oracle" },
    { title: "Cisco CCNA", provider: "Cisco", category: "Networking", cost: "Paid", rating: 4.7, link: "https://www.cisco.com/", company: "Cisco" },
    { title: "DSA Self Paced", provider: "GeeksforGeeks", category: "DSA", cost: "Free", rating: 4.7, link: "https://practice.geeksforgeeks.org/courses/dsa-self-paced", company: "GeeksforGeeks" },
    { title: "System Design Live", provider: "Scaler Academy", category: "System Design", cost: "Paid", rating: 4.7, link: "https://www.scaler.com/", company: "Scaler" },
    { title: "TCS CodeVita Preparation", provider: "TCS", category: "Competitive Programming", cost: "Free", rating: 4.4, link: "https://www.tcs.com/", company: "TCS" },
    { title: "Wipro Elite Software Engineering", provider: "Wipro", category: "Software Engineering", cost: "Free", rating: 4.3, link: "https://www.wipro.com/", company: "Wipro" },
    { title: "Infosys Certified Expert", provider: "Infosys", category: "Software Development", cost: "Free", rating: 4.4, link: "https://www.infosys.com/", company: "Infosys" },
    { title: "Cognizant Digital Academy", provider: "Cognizant", category: "Digital Skills", cost: "Free", rating: 4.5, link: "https://www.cognizant.com/", company: "Cognizant" },
    { title: "HCL Tech Bee", provider: "HCL", category: "Career Development", cost: "Free", rating: 4.2, link: "https://www.hcltech.com/", company: "HCL" },
    { title: "Accenture Future Talent", provider: "Accenture", category: "Career Development", cost: "Free", rating: 4.5, link: "https://www.accenture.com/", company: "Accenture" },
    { title: "Complete Web Development Bootcamp", provider: "Angela Yu (Udemy)", category: "Web Development", cost: "Paid", rating: 4.8, link: "https://www.udemy.com/course/the-complete-web-development-bootcamp/", company: "Udemy" },
    { title: "React - The Complete Guide", provider: "Academind (Udemy)", category: "React JS", cost: "Paid", rating: 4.7, link: "https://www.udemy.com/course/react-the-complete-guide/", company: "Udemy" },
    { title: "IBM Data Science Professional Certificate", provider: "IBM", category: "Data Science", cost: "$49/mo", rating: 4.6, link: "https://www.coursera.org/professional-certificates/ibm-data-science", company: "IBM" },
    { title: "Google Project Management", provider: "Google", category: "Project Management", cost: "$49/mo", rating: 4.7, link: "https://www.coursera.org/professional-certificates/google-project-management", company: "Google" },
    { title: "Google Cybersecurity Certificate", provider: "Google", category: "Cybersecurity", cost: "$49/mo", rating: 4.7, link: "https://www.coursera.org/professional-certificates/google-cybersecurity", company: "Google" },
    { title: "Meta Back-End Developer", provider: "Meta", category: "Back-End", cost: "$49/mo", rating: 4.6, link: "https://www.coursera.org/professional-certificates/meta-back-end-developer", company: "Meta" },
    { title: "Microsoft Azure AI Engineer", provider: "Microsoft", category: "AI/ML", cost: "$49/mo", rating: 4.6, link: "https://www.coursera.org/professional-certificates/microsoft-azure-ai", company: "Microsoft" },
    { title: "Microsoft Power Platform", provider: "Microsoft", category: "Low-Code Development", cost: "$49/mo", rating: 4.7, link: "https://www.coursera.org/professional-certificates/microsoft-power-platform", company: "Microsoft" }
];

async function syncCourses() {
    let added = 0, updated = 0;
    for (const c of courseData) {
        c.updatedAt = new Date();
        const existing = await CompanyCourse.findOne({ title: c.title });
        if (existing) {
            Object.assign(existing, c);
            await existing.save();
            updated++;
        } else {
            await CompanyCourse.create(c);
            added++;
        }
    }
    console.log(`📚 Courses synced: ${added} added, ${updated} updated`);
    return { added, updated };
}

// Auto-update on startup
async function autoUpdateCourses() {
    const totalBefore = await CompanyCourse.countDocuments();
    const result = await syncCourses();
    const totalAfter = await CompanyCourse.countDocuments();
    console.log(`📊 Total courses: ${totalAfter}`);
}

// Connect to MongoDB (support both MONGODB_URI and MONGO_URI env names)
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/coursehub";
mongoose.connect(MONGO_URI)
.then(async () => {
    console.log("✅ MongoDB Connected");
    await autoUpdateCourses();
})
.catch(err => {
    console.log("❌ MongoDB Error:", err.message);
});

// Start server (use PORT env variable for production)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📌 Test: http://localhost:${PORT}/api/test`);
    console.log(`🔄 Auto-update: http://localhost:${PORT}/api/auto-update`);
    console.log(`📺 YouTube Courses: http://localhost:${PORT}/api/youtube-courses`);
    console.log(`📊 YouTube Stats: http://localhost:${PORT}/api/youtube-stats`);
    startCronJob();
});
