const courseGrid = document.getElementById("courseGrid");
const searchInput = document.getElementById("searchInput");
const radios = document.querySelectorAll("input[name='costFilter']");
const resultCount = document.getElementById("resultCount");
const noResults = document.getElementById("noResults");
const searchResultsPanel = document.getElementById("searchResultsPanel");
const searchResultsList = document.getElementById("searchResultsList");
const searchResultCount = document.getElementById("searchResultCount");
const viewAllResults = document.getElementById("viewAllResults");

let selectedCost = "all";
let allCoursesCache = [];

document.addEventListener('DOMContentLoaded', () => {
    const companiesScroll = document.querySelector('.companies-scroll');
    const companyCards = document.querySelectorAll('.company-card');
    
    if (companiesScroll && companyCards.length > 0) {
        let isDragging = false;
        let startX;
        let scrollLeft;
        
        companiesScroll.addEventListener('mousedown', (e) => {
            if (e.target.closest('.company-card')) {
                isDragging = false;
            } else {
                isDragging = true;
                startX = e.pageX - companiesScroll.offsetLeft;
                scrollLeft = companiesScroll.scrollLeft;
            }
        });
        
        companiesScroll.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - companiesScroll.offsetLeft;
            const walk = (x - startX) * 2;
            companiesScroll.scrollLeft = scrollLeft - walk;
        });
        
        companyCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
        
        companiesScroll.addEventListener('mouseleave', () => {
            isDragging = false;
        });
        
        companiesScroll.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }
    
    const trendingCards = document.querySelectorAll('.trending-card');
    if (trendingCards.length > 0) {
        const skillCategories = {
            'AI & ML': 'AI & ML',
            'Generative AI': 'Generative AI',
            'Cloud Computing': 'Cloud Computing',
            'Data Science': 'Data Analytics',
            'Full Stack': 'Full Stack Development',
            'Cybersecurity': 'Cyber Security',
            'Mobile App': 'Mobile App Development',
            'DevOps': 'DevOps & Automation',
            'UI/UX': 'UI/UX Design',
            'Blockchain': 'Blockchain Technology'
        };
        
        trendingCards.forEach(card => {
            card.addEventListener('click', () => {
                const skillName = card.getAttribute('data-skill');
                const category = skillCategories[skillName] || skillName;
                
                if (searchInput) {
                    searchInput.value = category;
                    searchInput.setAttribute('data-category', category);
                    searchInput.dispatchEvent(new Event('input'));
                    
                    const catalogSection = document.querySelector('.catalog-section');
                    if (catalogSection) {
                        catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        });
    }
});

/* 🔐 Check if user is logged in */
const currentUser = localStorage.getItem('currentUser');
const techSection = document.getElementById('techSection');
const featureSection = document.getElementById('featureSection');
const loginCtaSection = document.getElementById('loginCta');
const registerBtn = document.getElementById('registerBtn');
const loginBtn = document.getElementById('loginBtn');
const jobsBtn = document.getElementById('jobsBtn');
const jobsBtnLocked = document.getElementById('jobsBtnLocked');
const navLinks = document.getElementById('navLinks');

if (currentUser) {
    const user = JSON.parse(currentUser);
    console.log("Logged in as:", user.name);
    
    // Show special sections
    if (techSection) techSection.style.display = 'block';
    if (featureSection) featureSection.style.display = 'block';
    if (loginCtaSection) loginCtaSection.style.display = 'none';
    
    // Show Jobs button (unlocked)
    if (jobsBtn) jobsBtn.style.display = 'flex';
    if (jobsBtnLocked) jobsBtnLocked.style.display = 'none';
    
    // Update navbar - show Logout button
    if (registerBtn) registerBtn.style.display = 'none';
    if (loginBtn) loginBtn.style.display = 'none';
    
    // Add Logout button
    if (navLinks) {
        const logoutBtn = document.createElement('a');
        logoutBtn.href = '#';
        logoutBtn.className = 'nav-btn nav-btn-outline';
        logoutBtn.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i> Logout';
        logoutBtn.onclick = function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.reload();
        };
        navLinks.appendChild(logoutBtn);
    }
} else {
    console.log("Not logged in - showing login CTA");
    if (techSection) techSection.style.display = 'none';
    if (featureSection) featureSection.style.display = 'none';
    if (loginCtaSection) loginCtaSection.style.display = 'block';
    if (jobsBtn) jobsBtn.style.display = 'none';
    if (jobsBtnLocked) jobsBtnLocked.style.display = 'flex';
}

/* 🚀 Fetch Courses from Backend */
async function fetchCourses() {
    const search = searchInput.value;
    const category = searchInput.getAttribute('data-category') || '';

    try {
        const res = await fetch(
            `http://localhost:5000/api/courses?search=${search}&cost=${selectedCost}&category=${category}`
        );

        const data = await res.json();
        allCoursesCache = data;
        displayCourses(data);
        updateSearchPanel(data);
    } catch (err) {
        console.log(err);
    }
}

function updateSearchPanel(courses) {
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm.length === 0) {
        searchResultsPanel.style.display = "none";
        return;
    }
    
    const filteredCourses = courses.slice(0, 6);
    searchResultCount.textContent = `${courses.length} results found`;
    
    if (courses.length === 0) {
        searchResultsList.innerHTML = `
            <div class="no-search-results">
                <i class="fa-solid fa-search"></i>
                <p>No courses found for "${searchTerm}"</p>
            </div>
        `;
        viewAllResults.style.display = "none";
    } else {
        searchResultsList.innerHTML = filteredCourses.map(course => {
            const imageUrl = getImageForCourse(course.title);
            const badgeClass = course.cost && course.cost.toLowerCase().includes("paid") ? "badge-paid" : "badge-free";
            return `
                <div class="search-result-item" data-course='${JSON.stringify(course).replace(/'/g, "&#39;")}'>
                    <img src="${imageUrl}" alt="${course.title}">
                    <div class="result-info">
                        <div class="result-title">${course.title}</div>
                        <div class="result-meta">
                            <span class="badge-small ${badgeClass}">${course.cost}</span>
                            <span>${course.category || course.provider || ''}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        viewAllResults.style.display = courses.length > 6 ? "block" : "none";
        
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                try {
                    const courseData = JSON.parse(item.dataset.course.replace(/&#39;/g, "'"));
                    const imageUrl = getImageForCourse(courseData.title);
                    openModal(courseData, imageUrl);
                    searchResultsPanel.style.display = "none";
                    searchInput.value = '';
                } catch (e) {
                    console.log('Error parsing course data:', e);
                }
            });
        });
    }
    
    searchResultsPanel.style.display = "block";
}

document.addEventListener('click', (e) => {
    const searchContainer = document.querySelector('.search-container');
    if (searchContainer && !searchContainer.contains(e.target)) {
        searchResultsPanel.style.display = "none";
    }
});

if (viewAllResults) {
    viewAllResults.addEventListener('click', (e) => {
        e.preventDefault();
        searchResultsPanel.style.display = "none";
        const catalogSection = document.querySelector('.catalog-section');
        if (catalogSection) {
            catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
}

/* 🎨 Display Courses */
const courseImages = [
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1536148935331-408321065b18?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80"
];

function getImageForCourse(title) {
    if (!title) return courseImages[0];
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
        hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    return courseImages[Math.abs(hash) % courseImages.length];
}

function displayCourses(courses) {
    courseGrid.innerHTML = "";

    if (courses.length === 0) {
        noResults.style.display = "block";
        resultCount.innerText = "No courses found";
        return;
    }

    noResults.style.display = "none";
    resultCount.innerText = `Showing ${courses.length} courses`;

    let delay = 0;
    courses.forEach((c, index) => {
        delay = index * 0.1;
        const imageUrl = getImageForCourse(c.title);
        let badgeClass = "badge-free";
        if (c.cost && c.cost.toLowerCase().includes("paid")) {
            badgeClass = "badge-paid";
        }

        let noteText = c.note || '';
        let noteLink = '';
        const provider = c.provider ? c.provider.toLowerCase() : '';
        
        if (!noteText) {
            if (provider.includes('udemy')) {
                noteText = 'Paid course. Refer our Udemy Coupon section to get discount';
                noteLink = 'udemy-guide.html';
            } else if (provider.includes('coursera')) {
                noteText = 'Refer our Coursera financial aid apply to get this course mostly free';
                noteLink = 'coursera-guide.html';
            }
        } else {
            if (noteText.toLowerCase().includes('udemy')) {
                noteLink = 'udemy-guide.html';
            } else if (noteText.toLowerCase().includes('coursera')) {
                noteLink = 'coursera-guide.html';
            }
        }

        const card = document.createElement("div");
        card.className = "course-card";
        card.style.animationDelay = `${delay}s`;
        
        const noteIcon = noteLink 
            ? `<a href="${noteLink}" class="card-note-link"><i class="fa-solid fa-info-circle"></i></a>`
            : `<i class="fa-solid fa-info-circle"></i>`;
        
        card.innerHTML = `
            <div class="card-image-wrap">
                <img src="${imageUrl}" alt="${c.title}">
            </div>
            <div class="card-content">
                <div class="card-badges">
                    <span class="badge ${badgeClass}">${c.cost}</span>
                    <span class="badge badge-category">${c.category}</span>
                </div>
                <h3 class="card-title">${c.title}</h3>
                <p class="card-platform"><i class="fa-solid fa-building-columns"></i> <strong>${c.provider}</strong></p>
                ${noteText ? `<p class="card-note">${noteIcon} ${noteText}</p>` : ''}
                <div class="card-meta">
                    <button class="btn btn-outline btn-sm view-course-btn">View</button>
                </div>
            </div>
        `;

        const viewBtn = card.querySelector(".view-course-btn");
        viewBtn.addEventListener("click", () => openModal(c, imageUrl));

        courseGrid.appendChild(card);
    });
}

/* 🎯 Modal Logic */
const courseModal = document.getElementById("courseModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalBody = document.getElementById("modalBody");
const enrollBtn = document.getElementById("enrollBtn");

function getHashNum(str, min, max) {
    let hash = 0;
    if (!str) return min;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    return Math.floor((Math.abs(hash) % (max - min + 1)) + min);
}

function openModal(course, imageUrl) {
    let badgeClass = "badge-free";
    if (course.cost && course.cost.toLowerCase().includes("paid")) badgeClass = "badge-paid";

    const ratingRaw = getHashNum(course.title, 40, 50);
    const rating = (ratingRaw / 10).toFixed(1);
    const reviews = getHashNum(course.title, 100, 5000).toLocaleString();
    const students = getHashNum(course.title, 1000, 50000).toLocaleString();

    // Mock Review Data
    const authorInitials = ["JD", "SM", "AK", "EW", "PL", "RK"];
    const authorNames = ["John Doe", "Sarah M.", "Alex K.", "Emily W.", "Peter L.", "Rachel K."];
    const reviewTexts = [
        "Absolutely amazing course! The instructor explained everything clearly.",
        "Very comprehensive. I went from zero to knowing enough to build my own projects.",
        "Great materials, though some parts were a bit challenging. Highly recommended overall.",
        "The best course on this topic I have taken. Real-world examples were pure gold.",
        "Exceeded my expectations! Will definitely look for more courses from them."
    ];

    const idx1 = getHashNum(course.title + "1", 0, 4);
    const idx2 = getHashNum(course.title + "2", 0, 4);

    const rText1 = reviewTexts[idx1];
    const rText2 = reviewTexts[(idx1 + 1) % reviewTexts.length];
    
    const aInit1 = authorInitials[idx1];
    const aName1 = authorNames[idx1];
    
    const aInit2 = authorInitials[idx2 + 1];
    const aName2 = authorNames[idx2 + 1];

    let modalHtml = `
        <img src="${imageUrl}" class="modal-course-image" alt="${course.title}">
        <div class="card-badges" style="margin-bottom: 1rem;">
            <span class="badge ${badgeClass}">${course.cost}</span>
            <span class="badge badge-category">${course.category}</span>
        </div>
        <h2 class="modal-course-title">${course.title}</h2>
        <p class="modal-course-provider"><i class="fa-solid fa-building-columns"></i> <strong>${course.provider}</strong></p>
        
        <div class="modal-stats-container">
            <div class="modal-stat-box">
                <i class="fa-solid fa-star modal-stat-icon rating"></i>
                <div class="modal-stat-value">${rating}</div>
                <div class="modal-stat-label">${reviews} Reviews</div>
            </div>
            <div class="modal-stat-box">
                <i class="fa-solid fa-users modal-stat-icon students"></i>
                <div class="modal-stat-value">${students}</div>
                <div class="modal-stat-label">Enrolled</div>
            </div>
            <div class="modal-stat-box">
                <i class="fa-solid fa-clock modal-stat-icon level"></i>
                <div class="modal-stat-value">${getHashNum(course.title, 3, 10)}h</div>
                <div class="modal-stat-label">Duration</div>
            </div>
        </div>

        <p style="color: var(--clr-text-muted); margin-bottom: 1rem; line-height: 1.6;">Expand your knowledge and clear your path to success with this comprehensive course provided by <strong>${course.provider}</strong>. Enroll today to get access to all the materials, including video lectures, assignments, and community support.</p>
        
        <div class="modal-reviews-section">
            <h3 class="modal-reviews-title"><i class="fa-solid fa-comments text-gradient"></i> Top Reviews</h3>
            
            <div class="modal-review-card">
                <div class="modal-review-header">
                    <div class="modal-review-author">
                        <div class="modal-review-avatar">${aInit1}</div>
                        ${aName1}
                    </div>
                    <div class="modal-review-stars">
                        ${'<i class="fa-solid fa-star"></i>'.repeat(Math.round(ratingRaw / 10))}
                    </div>
                </div>
                <div class="modal-review-text">"${rText1}"</div>
            </div>
            
            <div class="modal-review-card">
                <div class="modal-review-header">
                    <div class="modal-review-author">
                        <div class="modal-review-avatar" style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);">${aInit2}</div>
                        ${aName2}
                    </div>
                    <div class="modal-review-stars">
                        ${'<i class="fa-solid fa-star"></i>'.repeat(Math.round(ratingRaw / 10))}
                    </div>
                </div>
                <div class="modal-review-text">"${rText2}"</div>
            </div>
        </div>
    `;

    modalBody.innerHTML = modalHtml;

    enrollBtn.href = course.link;
    courseModal.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent background scrolling
}

function closeModal() {
    courseModal.classList.remove("active");
    document.body.style.overflow = "";
}

if(closeModalBtn && courseModal) {
    closeModalBtn.addEventListener("click", closeModal);
    courseModal.addEventListener("click", (e) => {
        if (e.target === courseModal) closeModal();
    });
}

/* 🔍 Search typing */
searchInput.addEventListener("input", () => {
    if (!searchInput.value) {
        searchInput.removeAttribute('data-category');
    }
    fetchCourses();
});

/* 🎯 Filter click */
radios.forEach(radio => {
    radio.addEventListener("change", () => {
        selectedCost = radio.value;
        fetchCourses();
    });
});

/* 🚀 First Load */
fetchCourses();

/* 🏢 Company Courses Modal */
const companyModal = document.getElementById('companyModal');
const companyCoursesGrid = document.getElementById('companyCoursesGrid');
const closeCompanyModalBtn = document.getElementById('closeCompanyModal');
const filterBtns = document.querySelectorAll('.filter-btn');

let currentCompany = '';
let allCompanyCourses = [];

const companyIcons = {
    'Google': 'fa-google',
    'Microsoft': 'fa-microsoft',
    'AWS': 'fa-aws',
    'IBM': 'fa-database',
    'Meta': 'fa-meta',
    'Cisco': 'fa-network-wired',
    'Oracle': 'fa-ring',
    'Salesforce': 'fa-cloud',
    'HubSpot': 'fa-bullseye',
    'LinkedIn': 'fa-linkedin',
    'Fortinet': 'fa-shield-halved',
    'GitHub': 'fa-github'
};

async function openCompanyModal(company) {
    console.log('Opening modal for:', company);
    currentCompany = company;
    
    const companyLogo = document.getElementById('companyLogo');
    const companyTitle = document.getElementById('companyTitle');
    const companySubtitle = document.getElementById('companySubtitle');
    
    if (!companyModal || !companyCoursesGrid) {
        alert('Error: Modal elements not found!');
        return;
    }
    
    if (companyIcons[company]) {
        companyLogo.innerHTML = `<i class="fa-brands ${companyIcons[company]}"></i>`;
    } else {
        companyLogo.innerHTML = `<i class="fa-solid fa-building"></i>`;
    }
    
    companyTitle.textContent = `${company} Courses`;
    companySubtitle.textContent = 'Professional Certificates & Free Training';
    
    // Update enroll button link
    const enrollBtnTop = document.querySelector('.enroll-btn-top');
    if (enrollBtnTop) {
        const enrollLinks = {
            'Google': 'google-guide.html',
            'Microsoft': 'microsoft-guide.html',
            'AWS': 'aws-guide.html',
            'Meta': 'meta-guide.html',
            'IBM': 'ibm-guide.html',
            'LinkedIn': 'linkedin-guide.html',
            'GitHub': 'github-guide.html',
            'Cisco': 'cisco-guide.html',
            'Oracle': 'oracle-guide.html',
            'Salesforce': 'salesforce-guide.html',
            'HubSpot': 'hubspot-guide.html',
            'Fortinet': 'fortinet-guide.html',
            'HP': 'hp-guide.html',
            'TCS': 'tcs-guide.html'
        };
        enrollBtnTop.href = enrollLinks[company] || '#';
    }
    
    companyCoursesGrid.innerHTML = '<div class="loading-spinner"><i class="fa-solid fa-spinner fa-spin"></i> Loading courses...</div>';
    companyModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    try {
        const res = await fetch(`http://localhost:5000/api/company-courses`);
        const allCourses = await res.json();
        console.log('All courses from API:', allCourses.length);
        const courses = allCourses.filter(c => c.company && c.company.toLowerCase().includes(company.toLowerCase()));
        console.log('Filtered courses:', courses.length);
        allCompanyCourses = courses;
        displayCompanyCourses(courses, 'all');
    } catch (err) {
        console.error('Error:', err);
        companyCoursesGrid.innerHTML = '<p class="error-message">Failed to load courses. Please try again.</p>';
    }
}

function displayCompanyCourses(courses, filter) {
    const filtered = filter === 'all' ? courses : courses.filter(c => {
        if (filter === 'free') return c.cost && c.cost.toLowerCase() === 'free';
        if (filter === 'paid') return c.cost && c.cost.toLowerCase() !== 'free';
        return true;
    });
    
    if (filtered.length === 0) {
        companyCoursesGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fa-solid fa-folder-open" style="font-size: 4rem; color: var(--clr-text-muted); margin-bottom: 1rem;"></i>
                <p style="color: var(--clr-text-muted);">No courses found for this category.</p>
            </div>
        `;
        return;
    }
    
    companyCoursesGrid.innerHTML = '';
    
    filtered.forEach((course, index) => {
        const isFree = course.cost && course.cost.toLowerCase() === 'free';
        const costClass = isFree ? 'free' : 'paid';
        const displayCost = course.cost;
        
        const card = document.createElement('div');
        card.className = `company-course-card ${costClass}`;
        card.style.cssText = 'background: white; color: black; padding: 20px; border-radius: 12px; border: 2px solid #8b5cf6; box-sizing: border-box; height: 100%;';
        
        card.innerHTML = `
            <div style="background: #f0f0f0; padding: 12px; margin-bottom: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <span style="background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold;">${course.category}</span>
                <span style="background: ${isFree ? '#d1fae5' : '#fef3c7'}; color: ${isFree ? '#059669' : '#d97706'}; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold;">${displayCost}</span>
            </div>
            <h3 style="color: #111; font-size: 16px; margin-bottom: 10px; font-weight: bold; line-height: 1.4;">${course.title}</h3>
            <p style="color: #666; font-size: 13px; margin-bottom: 12px; line-height: 1.5;"><strong style="color: #dc2626;">Perfect for:</strong> ${course.suitableFor}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid #eee;">
                <span style="color: #fbbf24; font-size: 15px; font-weight: bold;">★ ${course.rating}/5</span>
                <a href="${course.link}" target="_blank" style="background: linear-gradient(135deg, #8b5cf6, #06b6d4); color: white; padding: 8px 16px; border-radius: 20px; text-decoration: none; font-weight: bold; font-size: 13px;">View Course →</a>
            </div>
        `;
        
        companyCoursesGrid.appendChild(card);
    });
    console.log('Displayed', filtered.length, 'course cards');
}

function closeCompanyModal() {
    companyModal.classList.remove('active');
    document.body.style.overflow = '';
}

if (closeCompanyModalBtn && companyModal) {
    closeCompanyModalBtn.addEventListener('click', closeCompanyModal);
    companyModal.addEventListener('click', (e) => {
        if (e.target === companyModal) closeCompanyModal();
    });
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        displayCompanyCourses(allCompanyCourses, btn.dataset.filter);
    });
});

/* Skill India Modal Functions */
function openSkillIndiaModal() {
    const modal = document.getElementById('skillIndiaModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeSkillIndiaModal() {
    const modal = document.getElementById('skillIndiaModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modal on outside click
const skillIndiaModal = document.getElementById('skillIndiaModal');
if (skillIndiaModal) {
    skillIndiaModal.addEventListener('click', (e) => {
        if (e.target === skillIndiaModal) closeSkillIndiaModal();
    });
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSkillIndiaModal();
});