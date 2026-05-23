require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/coursehub";

const youtubeCourseSchema = new mongoose.Schema({
    videoId: { type: String, unique: true, sparse: true },
    title: { type: String, required: true },
    description: String,
    thumbnail: String,
    videoUrl: { type: String, required: true, unique: true },
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

const SEARCH_KEYWORDS = [
    'full course programming',
    'python tutorial complete',
    'web development full course',
    'machine learning tutorial',
    'data structures algorithms',
    'react js tutorial',
    'java tutorial complete',
    'ai tutorial for beginners',
    'javascript full course',
    'sql database tutorial'
];

const CHANNELS = [
    'freeCodeCamp',
    'CodeWithHarry',
    'Apna College',
    'Striver',
    'A2Z SDE',
    'Cherno',
    'Patrick Collins',
    'Fireship',
    'Net Ninja',
    'Traversy Media'
];

const categorize = (title, desc) => {
    const text = (title + ' ' + desc).toLowerCase();
    if (text.match(/ai|ml|machine learning|artificial intelligence|deep learning|neural|gpt|chatgpt/)) return 'AI';
    if (text.match(/web|html|css|react|angular|vue|node|express|mern|frontend|backend|full stack/)) return 'Web Dev';
    if (text.match(/dsa|data structure|algorithm|array|string|tree|graph|dp|dynamic programming/)) return 'DSA';
    if (text.match(/python|java|c\+\+|javascript|typescript|rust|go|swift/)) return 'Programming';
    if (text.match(/sql|database|mysql|mongodb|postgresql|firebase/)) return 'Database';
    if (text.match(/cloud|aws|azure|docker|kubernetes|devops|linux/)) return 'DevOps';
    if (text.match(/cybersecurity|security|hacking|ethical|network/)) return 'Security';
    return 'General';
};

const fetchYouTubeCourses = async (maxResults = 10) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const results = [];

    console.log('🔍 Starting YouTube course search...');

    for (const keyword of SEARCH_KEYWORDS.slice(0, 5)) {
        try {
            const searchUrl = 'https://www.googleapis.com/youtube/v3/search';
            const params = {
                part: 'snippet',
                q: keyword,
                type: 'video',
                maxResults: maxResults,
                order: 'viewCount',
                videoDuration: 'long',
                key: apiKey
            };

            const response = await axios.get(searchUrl, { params, timeout: 10000 });
            
            for (const item of response.data.items || []) {
                const snippet = item.snippet;
                const videoId = item.id.videoId;

                results.push({
                    videoId: videoId,
                    title: snippet.title,
                    description: snippet.description?.substring(0, 500) || '',
                    thumbnail: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url,
                    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
                    channelName: snippet.channelTitle,
                    channelUrl: `https://www.youtube.com/${snippet.channelId}`,
                    category: categorize(snippet.title, snippet.description),
                    publishedAt: new Date(snippet.publishedAt)
                });
            }

            await new Promise(r => setTimeout(r, 1000));
        } catch (err) {
            console.log(`⚠️ Error searching "${keyword}": ${err.message}`);
        }
    }

    console.log(`📺 Found ${results.length} courses from searches`);
    return results;
};

const fetchFromChannels = async (maxResults = 5) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const results = [];

    console.log('🔍 Fetching from popular channels...');

    for (const channel of CHANNELS) {
        try {
            const searchUrl = 'https://www.googleapis.com/youtube/v3/search';
            const params = {
                part: 'snippet',
                q: channel,
                type: 'video',
                maxResults: maxResults,
                order: 'viewCount',
                key: apiKey
            };

            const response = await axios.get(searchUrl, { params, timeout: 10000 });

            for (const item of response.data.items || []) {
                const snippet = item.snippet;
                const videoId = item.id.videoId;

                results.push({
                    videoId: videoId,
                    title: snippet.title,
                    description: snippet.description?.substring(0, 500) || '',
                    thumbnail: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url,
                    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
                    channelName: snippet.channelTitle,
                    channelUrl: `https://www.youtube.com/${snippet.channelId}`,
                    category: categorize(snippet.title, snippet.description),
                    publishedAt: new Date(snippet.publishedAt)
                });
            }

            await new Promise(r => setTimeout(r, 1000));
        } catch (err) {
            console.log(`⚠️ Error fetching from "${channel}": ${err.message}`);
        }
    }

    console.log(`📺 Found ${results.length} courses from channels`);
    return results;
};

const scrapeFallback = async () => {
    console.log('🔄 Using fallback scraping method...');
    const results = [];

    const popularCourses = [
        { title: 'Python Full Course 2024', channelName: 'freeCodeCamp', category: 'Programming', keyword: 'python' },
        { title: 'React JS Full Course', channelName: 'freeCodeCamp', category: 'Web Dev', keyword: 'react' },
        { title: 'Machine Learning Complete Course', channelName: 'freeCodeCamp', category: 'AI', keyword: 'machine learning' },
        { title: 'Java Script Full Course', channelName: 'CodeWithHarry', category: 'Programming', keyword: 'javascript' },
        { title: 'C++ Complete Tutorial', channelName: 'CodeWithHarry', category: 'Programming', keyword: 'c++' },
        { title: 'DSA for Placements', channelName: 'Striver', category: 'DSA', keyword: 'dsa' },
        { title: 'Web Development Bootcamp', channelName: 'Apna College', category: 'Web Dev', keyword: 'web development' },
        { title: 'AI Tutorial for Beginners', channelName: 'freeCodeCamp', category: 'AI', keyword: 'ai' },
        { title: 'Data Structures Course', channelName: 'Apna College', category: 'DSA', keyword: 'data structures' },
        { title: 'Full Stack Development', channelName: 'Traversy Media', category: 'Web Dev', keyword: 'full stack' }
    ];

    for (const course of popularCourses) {
        results.push({
            videoId: btoa(course.keyword).substring(0, 11),
            title: course.title,
            description: `Learn ${course.keyword} with this comprehensive tutorial. Perfect for beginners and advanced learners.`,
            thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg`,
            videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(course.title)}`,
            channelName: course.channelName,
            channelUrl: `https://www.youtube.com/@${course.channelName.toLowerCase().replace(' ', '')}`,
            category: course.category,
            publishedAt: new Date()
        });
    }

    return results;
};

const syncCourses = async () => {
    await mongoose.connect(MONGO_URI);
    console.log('🔄 Syncing YouTube courses...');

    let coursesToAdd = [];

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (apiKey && apiKey.length > 20) {
        const searchResults = await fetchYouTubeCourses(5);
        const channelResults = await fetchFromChannels(3);
        coursesToAdd = [...searchResults, ...channelResults];
    } else {
        console.log('⚠️ No YouTube API key - using fallback data');
        coursesToAdd = await scrapeFallback();
    }

    const uniqueCourses = [];
    const seen = new Set();
    for (const c of coursesToAdd) {
        const key = c.title.toLowerCase();
        if (!seen.has(key)) {
            seen.add(key);
            uniqueCourses.push(c);
        }
    }

    let added = 0, updated = 0;
    let duplicates = 0;

    for (const c of uniqueCourses) {
        c.updatedAt = new Date();

        const existingByUrl = await YouTubeCourse.findOne({ videoUrl: c.videoUrl });
        if (existingByUrl) {
            duplicates++;
            continue;
        }

        const existingByTitle = await YouTubeCourse.findOne({ title: c.title });
        if (existingByTitle) {
            duplicates++;
            continue;
        }

        try {
            await YouTubeCourse.create(c);
            added++;
        } catch (err) {
            if (err.code !== 11000) {
                console.log(`⚠️ Error: ${err.message}`);
            }
        }
    }

    const total = await YouTubeCourse.countDocuments();
    console.log(`✅ Sync complete! Added: ${added}, Duplicates: ${duplicates}, Total: ${total}`);

    await mongoose.disconnect();
    return { added, updated: 0, duplicates, total };
};

const getCourses = async (filters = {}) => {
    await mongoose.connect(MONGO_URI);

    let query = {};
    if (filters.category) query.category = filters.category;
    if (filters.channelName) query.channelName = filters.channelName;

    const courses = await YouTubeCourse.find(query)
        .sort({ createdAt: -1 })
        .limit(filters.limit || 50)
        .select('-__v');

    await mongoose.disconnect();
    return courses;
};

const getStats = async () => {
    await mongoose.connect(MONGO_URI);

    const total = await YouTubeCourse.countDocuments();
    const categories = await YouTubeCourse.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
    const channels = await YouTubeCourse.distinct('channelName');

    await mongoose.disconnect();
    return { total, categories, channels: channels.length };
};

if (require.main === module) {
    mongoose.connect(MONGO_URI)
        .then(() => syncCourses())
        .catch(err => console.log('❌ Error:', err.message));
}

module.exports = { syncCourses, getCourses, getStats, fetchYouTubeCourses, fetchFromChannels, scrapeFallback };