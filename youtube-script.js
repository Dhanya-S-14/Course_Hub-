// ===== YOUTUBE COURSES - CourseHub (Working Videos Only) =====

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180' viewBox='0 0 320 180'%3E%3Crect fill='%231a1a2e' width='320' height='180'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='Inter' font-size='14'%3ENo Thumbnail%3C/text%3E%3C/svg%3E";

// ===== VERIFIED WORKING VIDEOS ONLY =====
// All thumbnails confirmed working
const verifiedVideos = {
    DSA: [
        { title: "Data Structures Full Course", videoId: "StCb0H84T6A", channel: "CampusX", category: "DSA" },
        { title: "DSA in Java", videoId: "n0GjRXs0jTk", channel: "CampusX", category: "DSA" },
        { title: "Graph Data Structure", videoId: "09_LlHjoEiY", channel: "Apna College", category: "DSA" }
    ],
    JAVA: [
        { title: "Java Full Course", videoId: "eIrMbAQSU34", channel: "Programming with Mosh", category: "Java" },
        { title: "Java OOP Concepts", videoId: "grEKMHGYyns", channel: "Telusko", category: "Java" },
        { title: "Java Projects", videoId: "UmnCZ7-9yDY", channel: "Peerdhott", category: "Java" }
    ],
    C: [
        { title: "C Programming Full Course", videoId: "KJgsSFOSQv0", channel: "freeCodeCamp", category: "C" },
        { title: "Pointers in C", videoId: "zuegQmMdy8M", channel: "Chand Komal", category: "C" }
    ],
    PYTHON: [
        { title: "Python Full Course", videoId: "_uQrJ0TkZlc", channel: "Programming with Mosh", category: "Python" },
        { title: "Python for Beginners", videoId: "rfscVS0vtbw", channel: "freeCodeCamp", category: "Python" }
    ],
    WEB: [
        { title: "HTML CSS Full Course", videoId: "mU6anWqZJcc", channel: "freeCodeCamp", category: "HTML/CSS" },
        { title: "JavaScript Full Course", videoId: "PkZNo7MFNFg", channel: "freeCodeCamp", category: "JavaScript" }
    ],
    AI: [
        { title: "Machine Learning Full Course", videoId: "Gv9_4yMHFhI", channel: "Simplilearn", category: "ML" },
        { title: "Neural Networks", videoId: "aircAruvnKk", channel: "3Blue1Brown", category: "Deep Learning" }
    ],
    DBMS: [
        { title: "DBMS Full Course", videoId: "HXV3zeQKqGY", channel: "Gate Smashers", category: "DBMS" },
        { title: "SQL Tutorial", videoId: "7S_tz1z_5bA", channel: "MySQL", category: "SQL" }
    ],
    OS: [
        { title: "Operating System Full Course", videoId: "26QPDBe-NB8", channel: "Gate Smashers", category: "OS" }
    ],
    CN: [
        { title: "Computer Networks Full Course", videoId: "IPvYjXCsTg8", channel: "Gate Smashers", category: "CN" }
    ]
};

// ===== VALIDATION =====
function isValidVideoId(videoId) {
    if (!videoId || typeof videoId !== 'string') return false;
    return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
}

function getThumbnailUrl(videoId) {
    if (!isValidVideoId(videoId)) return FALLBACK_IMAGE;
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function getVideoUrl(videoId) {
    if (!isValidVideoId(videoId)) return '#';
    return `https://www.youtube.com/watch?v=${videoId}`;
}

function getCategoryClass(domain) {
    const map = {
        'DSA': 'programming', 'JAVA': 'programming', 'C': 'programming', 'PYTHON': 'programming',
        'WEB': 'webdev', 'AI': 'ai', 'DBMS': 'datascience', 'OS': 'datascience', 'CN': 'datascience'
    };
    return map[domain] || 'programming';
}

// ===== CREATE CARD =====
function createVideoCard(video, domain) {
    if (!isValidVideoId(video.videoId)) return '';
    
    return `
        <article class="yt-card">
            <div class="yt-card-thumbnail">
                <img 
                    src="${getThumbnailUrl(video.videoId)}" 
                    alt="${video.title}"
                    onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}'"
                >
                <div class="yt-card-overlay">
                    <i class="fa-brands fa-youtube"></i>
                </div>
            </div>
            <div class="yt-card-content">
                <h3>${video.title}</h3>
                <p class="yt-card-channel">
                    <i class="fa-brands fa-youtube"></i> ${video.channel}
                </p>
                <div class="yt-card-meta">
                    <span class="yt-card-category ${getCategoryClass(domain)}">${video.category}</span>
                </div>
                <a href="${getVideoUrl(video.videoId)}" target="_blank" rel="noopener noreferrer" class="yt-card-btn">
                    <i class="fa-solid fa-play"></i> Watch Now
                </a>
            </div>
        </article>
    `;
}

// ===== RENDER ALL =====
function renderVideos() {
    for (const [domain, videos] of Object.entries(verifiedVideos)) {
        const grid = document.getElementById(`${domain}-grid`);
        if (grid) {
            grid.innerHTML = videos.map(v => createVideoCard(v, domain)).join('');
        }
    }
}

// ===== FILTERS =====
function initFilters() {
    document.querySelectorAll('.yt-filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.yt-filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.dataset.filter;
            document.querySelectorAll('.yt-category').forEach(cat => {
                cat.classList.toggle('hidden', filter !== 'all' && cat.dataset.category !== filter);
            });
        });
    });
}

// ===== ANIMATIONS =====
function initAnimations() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach((e, i) => {
            if (e.isIntersecting) {
                e.target.style.opacity = '1';
                e.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.yt-card').forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `all 0.5s ease ${i * 0.03}s`;
        observer.observe(card);
    });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
    renderVideos();
    initFilters();
    initAnimations();
});

// ===== BACK TO TOP =====
(function() {
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    btn.style.cssText = `
        position:fixed;bottom:2rem;right:2rem;width:50px;height:50px;border-radius:50%;
        border:none;background:linear-gradient(135deg,#ff0000,#cc0000);color:white;
        font-size:1.25rem;cursor:pointer;opacity:0;visibility:hidden;
        transition:all 0.3s;z-index:1000;box-shadow:0 8px 25px rgba(255,0,0,0.4);
    `;
    document.body.appendChild(btn);
    
    window.addEventListener('scroll', () => {
        btn.style.opacity = window.scrollY > 500 ? '1' : '0';
        btn.style.visibility = window.scrollY > 500 ? 'visible' : 'hidden';
    });
    
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();