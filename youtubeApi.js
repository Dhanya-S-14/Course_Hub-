require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const path = require('path');
const cors = require('cors');

const app = express();
const server = require('http').createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/coursehub";

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

const YouTubeCourse = mongoose.models.YouTubeCourse || mongoose.model('YouTubeCourse', youtubeCourseSchema, 'youtube_courses');

const { syncCourses, getCourses, getStats } = require('./youtubeScraper');

app.get('/api/youtube-courses', async (req, res) => {
    try {
        const { category, channel, limit = 50 } = req.query;
        
        await mongoose.connect(MONGO_URI);
        
        let query = {};
        if (category) query.category = category;
        if (channel) query.channelName = { $regex: new RegExp(channel, 'i') };

        const courses = await YouTubeCourse.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .select('-__v');

        await mongoose.disconnect();
        res.json({ success: true, count: courses.length, courses });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/youtube-stats', async (req, res) => {
    try {
        await mongoose.connect(MONGO_URI);
        
        const total = await YouTubeCourse.countDocuments();
        const categories = await YouTubeCourse.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        const channels = await YouTubeCourse.distinct('channelName');

        await mongoose.disconnect();
        res.json({ 
            success: true, 
            total, 
            categories: categories.map(c => ({ category: c._id, count: c.count })),
            channels: channels.length 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/sync-youtube', async (req, res) => {
    try {
        const result = await syncCourses();
        res.json({ success: true, message: 'YouTube courses synced', ...result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const startCronJob = () => {
    console.log('⏰ Setting up cron job (every 6 hours)...');
    
    cron.schedule('0 */6 * * *', async () => {
        console.log('🔄 Running scheduled YouTube sync...');
        try {
            const result = await syncCourses();
            console.log(`✅ Auto-sync complete: ${result.added} added, ${result.total} total`);
        } catch (err) {
            console.log('❌ Auto-sync failed:', err.message);
        }
    });

    console.log('✓ Cron job scheduled: runs every 6 hours');
};

app.use(express.static(path.join(__dirname)));

app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB Connected');
        startCronJob();
    })
    .catch(err => console.log('❌ MongoDB Error:', err.message));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📺 YouTube Courses: http://localhost:${PORT}/api/youtube-courses`);
    console.log(`📊 YouTube Stats: http://localhost:${PORT}/api/youtube-stats`);
    console.log(`🔄 Manual Sync: http://localhost:${PORT}/api/sync-youtube`);
});

module.exports = app;