require('dotenv').config();
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: String,
    provider: String,
    category: String,
    cost: String,
    rating: Number,
    link: String,
    company: String,
    updatedAt: Date
});

const CompanyCourse = mongoose.model("CompanyCourse", courseSchema, "company_courses");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/coursehub";

const newCourses = [
    { title: "AWS Certified Solutions Architect", provider: "Amazon (AWS)", category: "Cloud Computing", cost: "Paid", rating: 4.8, link: "https://aws.amazon.com/training/", company: "Amazon" },
    { title: "Google AI/ML Certificate", provider: "Google (Coursera)", category: "AI/Machine Learning", cost: "$49/mo", rating: 4.7, link: "https://www.coursera.org/professional-certificates/google-ai-ml", company: "Google" },
    { title: "Microsoft Azure AI Engineer", provider: "Microsoft (Coursera)", category: "AI/ML", cost: "$49/mo", rating: 4.6, link: "https://www.coursera.org/professional-certificates/microsoft-azure-ai", company: "Microsoft" },
    { title: "Meta Database Engineer", provider: "Meta (Coursera)", category: "Database", cost: "$49/mo", rating: 4.6, link: "https://www.coursera.org/professional-certificates/meta-database-engineer", company: "Meta" },
    { title: "Apple Swift Programming", provider: "Apple", category: "iOS Development", cost: "Free", rating: 4.8, link: "https://developer.apple.com/", company: "Apple" },
    { title: "Adobe Creative Cloud", provider: "Adobe", category: "Design", cost: "Paid", rating: 4.7, link: "https://www.adobe.com/", company: "Adobe" },
    { title: "Oracle Database Administration", provider: "Oracle", category: "Database", cost: "Free", rating: 4.5, link: "https://www.oracle.com/", company: "Oracle" },
    { title: "Cisco CCNA", provider: "Cisco", category: "Networking", cost: "Paid", rating: 4.7, link: "https://www.cisco.com/", company: "Cisco" },
    { title: "TCS CodeVita Preparation", provider: "TCS", category: "Competitive Programming", cost: "Free", rating: 4.4, link: "https://www.tcs.com/", company: "TCS" },
    { title: "Wipro Elite Software Engineering", provider: "Wipro", category: "Software Engineering", cost: "Free", rating: 4.3, link: "https://www.wipro.com/", company: "Wipro" },
    { title: "Infosys Certified Expert", provider: "Infosys", category: "Software Development", cost: "Free", rating: 4.4, link: "https://www.infosys.com/", company: "Infosys" },
    { title: "Cognizant Digital Academy", provider: "Cognizant", category: "Digital Skills", cost: "Free", rating: 4.5, link: "https://www.cognizant.com/", company: "Cognizant" },
    { title: "HCL Tech Mahindra Training", provider: "HCL", category: "Technical Training", cost: "Free", rating: 4.2, link: "https://www.hcltech.com/", company: "HCL" },
    { title: "Accenture Future Talent", provider: "Accenture", category: "Career Development", cost: "Free", rating: 4.5, link: "https://www.accenture.com/", company: "Accenture" },
    { title: "GenC Plus Training", provider: "Cognizant", category: "Programming", cost: "Free", rating: 4.4, link: "https://www.cognizant.com/", company: "Cognizant" }
];

const courseProviders = [
    { title: "Programming for Everybody", provider: "University of Michigan", category: "Python", company: "Coursera", link: "https://www.coursera.org/learn/python", cost: "$49/mo", rating: 4.8 },
    { title: "IBM AI Engineering", provider: "IBM", category: "AI/ML", company: "IBM", link: "https://www.coursera.org/professional-certificates/ibm-ai-engineer", cost: "$49/mo", rating: 4.6 },
    { title: "Full Stack Web Development", provider: "The Hong Kong University", category: "Web Development", company: "Coursera", link: "https://www.coursera.org/learn/full-stack-web", cost: "$49/mo", rating: 4.7 },
    { title: "Google Digital Garage", provider: "Google", category: "Digital Marketing", company: "Google", link: "https://skillshop.exceedlms.com/", cost: "Free", rating: 4.7 },
    { title: "Microsoft Learn", provider: "Microsoft", category: "Cloud", company: "Microsoft", link: "https://learn.microsoft.com/", cost: "Free", rating: 4.7 },
    { title: "AWS Partner Learning", provider: "Amazon", category: "Cloud", company: "Amazon", link: "https://aws.amazon.com/training/", cost: "Paid", rating: 4.8 }
];

let isRunning = false;

async function runAutoUpdate(intervalHours = 24) {
    if (isRunning) return;
    isRunning = true;
    
    console.log(`⏰ Auto-update scheduler started (every ${intervalHours} hours)`);
    
    async function update() {
        try {
            await mongoose.connect(MONGO_URI);
            console.log("🔄 Running scheduled course update...");
            
            let added = 0, updated = 0;
            const timestamp = new Date();
            const allNew = [...newCourses, ...courseProviders];
            
            for (const c of allNew) {
                c.updatedAt = timestamp;
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
            
            const total = await CompanyCourse.countDocuments();
            console.log(`✅ Update done! Added: ${added}, Updated: ${updated}, Total: ${total}`);
            
            await mongoose.disconnect();
        } catch (err) {
            console.log("❌ Update error:", err.message);
        }
    }
    
    await update();
    
    const intervalMs = intervalHours * 60 * 60 * 1000;
    setInterval(update, intervalMs);
}

if (require.main === module) {
    runAutoUpdate(24);
}

module.exports = { runAutoUpdate };