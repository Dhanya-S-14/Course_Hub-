require('dotenv').config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
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

// Models
const Course = mongoose.model("Course", courseSchema);
const CompanyCourse = mongoose.model("CompanyCourse", companyCourseSchema, "company_courses");
const User = mongoose.model("User", userSchema, "Users");

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

app.get("/api/company-courses", async (req, res) => {
    try {
        const { company } = req.query;
        let filter = {};
        if (company) filter.company = { $regex: new RegExp(company, 'i') };
        const courses = await CompanyCourse.find(filter);
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
        const users = await User.countDocuments();
        const courses = await Course.countDocuments();
        
        // Get all collections info
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
            collections: collectionInfo
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Catch all - serve index.html for any other route (keep at bottom)
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Connect to MongoDB (use MONGO_URI env variable for production)
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/coursehub";
mongoose.connect(MONGO_URI)
.then(() => {
    console.log("✅ MongoDB Connected");
})
.catch(err => {
    console.log("❌ MongoDB Error:", err.message);
});

// Start server (use PORT env variable for production)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📌 Test: http://localhost:${PORT}/api/test`);
});
