// Enhanced Courses Page JavaScript with Backend Integration

let currentPage = 1;
let totalPages = 1;
let isLoading = false;
let currentFilters = {
    category: '',
    level: '',
    type: '',
    search: '',
    sort: 'newest'
};

document.addEventListener('DOMContentLoaded', function() {
    initializeCourseFilters();
    initializeViewToggle();
    initializeSearch();
    initializeMobileMenu();
    initializeBookmarks();
    initializeLoadMore();
    loadCourseStats();
    loadInitialCourses();
});

// Load course statistics for hero section
async function loadCourseStats() {
    try {
        const response = await fetch('/api/courses/stats');
        if (response.ok) {
            const stats = await response.json();
            updateHeroStats(stats);
        }
    } catch (error) {
        console.error('Error loading course stats:', error);
    }
}

function updateHeroStats(stats) {
    const statElements = document.querySelectorAll('.stat-number');
    if (statElements.length >= 3) {
        statElements[0].textContent = stats.total_courses + '+';
        statElements[1].textContent = stats.youtube_playlists + '+';
        statElements[2].textContent = stats.active_learners;
    }
}

// Load initial courses
async function loadInitialCourses() {
    await loadCourses(true);
}

// Enhanced course loading with backend integration
async function loadCourses(reset = false) {
    if (isLoading) return;
    
    isLoading = true;
    showLoadingState();
    
    try {
        const params = new URLSearchParams();
        if (currentFilters.search) params.append('q', currentFilters.search);
        if (currentFilters.category) params.append('category', currentFilters.category);
        if (currentFilters.level) params.append('level', currentFilters.level);
        if (currentFilters.type) params.append('type', currentFilters.type);
        params.append('sort', currentFilters.sort);
        params.append('page', reset ? 1 : currentPage);
        params.append('limit', 12);
        
        const response = await fetch(`/api/courses/search?${params.toString()}`);
        
        // Use the centralized error handler
        const data = await errorHandler.handleApiResponse(response);
        
        if (reset) {
            currentPage = 1;
            renderCourses(data.courses, true);
        } else {
            renderCourses(data.courses, false);
        }
        
        totalPages = Math.ceil(data.total / 12);
        updateLoadMoreButton(data.has_more);
        showResultsCount(data.total);
        
        if (data.courses.length === 0 && reset) {
            showNoResults();
        } else {
            hideNoResults();
        }
        
    } catch (error) {
        console.error('Error loading courses:', error);
    } finally {
        isLoading = false;
        hideLoadingState();
    }
}

// Render courses in the grid
function renderCourses(courses, replace = true) {
    const container = document.getElementById('courses-container');
    
    if (replace) {
        container.innerHTML = '';
    }
    
    courses.forEach(course => {
        const courseCard = createCourseCard(course);
        container.appendChild(courseCard);
    });
}

// Create course card element
function createCourseCard(course) {
    const card = document.createElement('article');
    card.className = 'course-card';
    card.dataset.category = course.category;
    card.dataset.level = course.level;
    card.dataset.type = course.type;
    card.dataset.rating = course.rating;
    card.dataset.enrolled = course.enrolled_count;
    
    const priceDisplay = course.is_free ? 
        '<div class="course-price free">FREE</div>' : 
        `<div class="course-price">$${course.price}</div>`;
    
    const videoCountDisplay = course.video_count ? 
        `<div class="stat">
            <i class="fas fa-play-circle"></i>
            <span>${course.video_count} videos</span>
        </div>` : '';
    
    const badgeIcon = course.type === 'youtube' ? 'fab fa-youtube' : 
                     course.type === 'interactive' ? 'fas fa-code' : 'fas fa-brain';
    const badgeText = course.type === 'youtube' ? 'YouTube' : 
                     course.type === 'interactive' ? 'Interactive' : 'AI-Guided';
    
    card.innerHTML = `
        <div class="course-image">
            <img src="${course.thumbnail}" alt="${course.title}" loading="lazy">
            
            <div class="course-badge ${course.type}">
                <i class="${badgeIcon}"></i>
                ${badgeText}
            </div>
            
            <button class="bookmark-btn" data-course-id="${course.id}">
                <i class="far fa-heart"></i>
            </button>
            
            ${course.is_new ? '<div class="new-badge">NEW</div>' : ''}
        </div>
        
        <div class="course-content">
            <div class="course-header">
                <div class="course-meta">
                    <span class="course-category">${course.category.toUpperCase()}</span>
                    <span class="course-level level-${course.level}">${course.level.toUpperCase()}</span>
                </div>
                
                <div class="course-rating">
                    <i class="fas fa-star"></i>
                    <span>${course.rating}</span>
                </div>
            </div>
            
            <h3 class="course-title">${course.title}</h3>
            <p class="course-description">${course.description}</p>
            
            <div class="course-instructor">
                <i class="fas fa-user-tie"></i>
                <span>${course.instructor}</span>
            </div>
            
            <div class="course-stats">
                ${videoCountDisplay}
                <div class="stat">
                    <i class="fas fa-clock"></i>
                    <span>${course.duration}</span>
                </div>
                <div class="stat">
                    <i class="fas fa-users"></i>
                    <span>${course.enrolled_count} enrolled</span>
                </div>
            </div>
            
            <div class="course-footer">
                ${priceDisplay}
                <button class="course-btn primary" onclick="startCourse('${course.id}', '${course.type}', '${course.url || ''}')">
                    ${course.type === 'youtube' ? 
                        '<i class="fas fa-external-link-alt"></i> Watch Now' : 
                        '<i class="fas fa-play"></i> Start Learning'}
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Start course function
function startCourse(courseId, courseType, courseUrl) {
    if (courseType === 'youtube' && courseUrl) {
        window.open(courseUrl, '_blank');
    } else {
        // Redirect to course page
        window.location.href = `/course/${courseId}`;
    }
}

// Enhanced filtering with backend integration
function initializeCourseFilters() {
    const categoryPills = document.querySelectorAll('.pill[data-category]');
    const levelFilter = document.getElementById('level-filter');
    const typeFilter = document.getElementById('type-filter');
    const sortFilter = document.getElementById('sort-filter');
    
    categoryPills.forEach(pill => {
        pill.addEventListener('click', function() {
            categoryPills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            currentFilters.category = this.dataset.category;
            loadCourses(true);
        });
    });
    
    if (levelFilter) {
        levelFilter.addEventListener('change', function() {
            currentFilters.level = this.value;
            loadCourses(true);
        });
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', function() {
            currentFilters.type = this.value;
            loadCourses(true);
        });
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            currentFilters.sort = this.value;
            loadCourses(true);
        });
    }
}

// Enhanced search with debouncing
function initializeSearch() {
    const searchInput = document.getElementById('main-search');
    let searchTimeout;
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentFilters.search = this.value;
                loadCourses(true);
            }, 500); // Debounce for 500ms
        });
    }
}

// Bookmark functionality with backend integration
function initializeBookmarks() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.bookmark-btn')) {
            const btn = e.target.closest('.bookmark-btn');
            const courseId = btn.dataset.courseId;
            toggleBookmark(btn, courseId);
        }
    });
}

async function toggleBookmark(btn, courseId) {
    try {
        const formData = new FormData();
        formData.append('course_id', courseId);
        
        const response = await fetch('/api/courses/bookmark', {
            method: 'POST',
            body: formData
        });
        
        // Use the centralized error handler
        const data = await errorHandler.handleApiResponse(
            response, 
            null, // No success message here, we'll show custom messages below
            '/login?redirect_url=/courses'
        );
        
        btn.classList.toggle('bookmarked', data.bookmarked);
        
        const icon = btn.querySelector('i');
        if (data.bookmarked) {
            icon.className = 'fas fa-heart';
            errorHandler.showNotification('Added to bookmarks', 'success');
        } else {
            icon.className = 'far fa-heart';
            errorHandler.showNotification('Removed from bookmarks', 'success');
        }
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        // Error already handled by errorHandler
    }
}

// Load more functionality
function initializeLoadMore() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            currentPage++;
            loadCourses(false);
        });
    }
}

function updateLoadMoreButton(hasMore) {
    const loadMoreSection = document.querySelector('.load-more-section');
    if (loadMoreSection) {
        loadMoreSection.style.display = hasMore ? 'block' : 'none';
    }
}

// UI Helper Functions
function showLoadingState() {
    const container = document.getElementById('courses-container');
    container.classList.add('loading');
}

function hideLoadingState() {
    const container = document.getElementById('courses-container');
    container.classList.remove('loading');
}

function showNoResults() {
    const noResults = document.getElementById('no-results');
    if (noResults) {
        noResults.style.display = 'block';
    }
}

function hideNoResults() {
    const noResults = document.getElementById('no-results');
    if (noResults) {
        noResults.style.display = 'none';
    }
}

function showResultsCount(count) {
    const resultsText = document.querySelector('.results-count');
    if (resultsText) {
        resultsText.textContent = `${count} courses found`;
    }
}

// Using centralized error handler for notifications
function showNotification(message, type = 'info') {
    errorHandler.showNotification(message, type);
}

function showError(message) {
    errorHandler.showNotification(message, 'error');
}
