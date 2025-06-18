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
        
        if (!response.ok) {
            throw new Error('Failed to load courses');
        }
        
        const data = await response.json();
        
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
        showError('Failed to load courses. Please try again.');
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
        
        if (response.ok) {
            const data = await response.json();
            btn.classList.toggle('bookmarked', data.bookmarked);
            
            const icon = btn.querySelector('i');
            if (data.bookmarked) {
                icon.className = 'fas fa-heart';
                showNotification('Added to bookmarks', 'success');
            } else {
                icon.className = 'far fa-heart';
                showNotification('Removed from bookmarks', 'success');
            }
        }
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        showNotification('Failed to update bookmark', 'error');
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

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showError(message) {
    showNotification(message, 'error');
}

// Enhanced course navigation functionality
class CourseNavigator {
    constructor() {
        this.courseModuleMap = {
            'python-basics': 'basics',
            'math-calculus': 'derivatives',
            'chemistry-organic': 'fundamentals',
            'javascript-advanced': 'es6-features',
            'data-structures': 'arrays-lists',
            'yt-js-tutorial': 'javascript-basics',
            'yt-machine-learning': 'ml-intro',
            'yt-spanish-beginner': 'spanish-intro'
        };
        this.init();
    }

    init() {
        this.setupSearchFunctionality();
        this.setupCourseNavigation();
        this.setupEnhancedFiltering();
    }

    setupSearchFunctionality() {
        const searchInput = document.getElementById('main-search');
        const searchResults = document.getElementById('search-results');
        
        if (!searchInput || !searchResults) return;

        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                this.hideSearchResults();
                return;
            }
            
            searchTimeout = setTimeout(() => {
                this.performSearch(query);
            }, 300);
        });

        // Hide search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                this.hideSearchResults();
            }
        });
    }

    performSearch(query) {
        const courses = this.getAllCourses();
        const results = courses.filter(course => 
            course.title.toLowerCase().includes(query.toLowerCase()) ||
            course.description.toLowerCase().includes(query.toLowerCase()) ||
            course.category.toLowerCase().includes(query.toLowerCase()) ||
            (course.instructor && course.instructor.toLowerCase().includes(query.toLowerCase()))
        );

        this.displaySearchResults(results, query);
    }

    displaySearchResults(results, query) {
        const searchResults = document.getElementById('search-results');
        
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No courses found for "${query}"</p>
                    <small>Try searching for different keywords</small>
                </div>
            `;
        } else {
            const resultsHTML = results.slice(0, 5).map(course => `
                <div class="search-result-item" onclick="courseNavigator.navigateToCourse('${course.id}')">
                    <div class="search-result-icon">
                        <i class="fas fa-${this.getIconForCourseType(course.type)}"></i>
                    </div>
                    <div class="search-result-content">
                        <h4>${this.highlightText(course.title, query)}</h4>
                        <p>${this.highlightText(course.description.substring(0, 80) + '...', query)}</p>
                        <span class="search-result-category">${course.category}</span>
                    </div>
                </div>
            `).join('');
            
            searchResults.innerHTML = resultsHTML;
        }
        
        searchResults.style.display = 'block';
    }

    highlightText(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }

    hideSearchResults() {
        const searchResults = document.getElementById('search-results');
        if (searchResults) {
            searchResults.style.display = 'none';
        }
    }

    getIconForCourseType(type) {
        const iconMap = {
            'youtube': 'play',
            'interactive': 'code',
            'guided': 'brain'
        };
        return iconMap[type] || 'graduation-cap';
    }

    navigateToCourse(courseId) {
        const course = this.getAllCourses().find(c => c.id === courseId);
        
        if (!course) {
            console.error('Course not found:', courseId);
            return;
        }

        if (course.type === 'youtube') {
            // Open YouTube courses in new tab
            window.open(course.url, '_blank');
        } else {
            // Navigate to course module for interactive courses
            const moduleId = this.courseModuleMap[courseId] || 'introduction';
            const studentId = this.getStudentId();
            let url = `/course/${courseId}/module/${moduleId}`;
            
            if (studentId) {
                url += `?student_id=${studentId}`;
            }
            
            window.location.href = url;
        }
        
        this.hideSearchResults();
    }

    setupCourseNavigation() {
        // Add click handlers to course cards
        document.addEventListener('click', (e) => {
            const courseBtn = e.target.closest('.course-btn.primary');
            if (courseBtn) {
                e.preventDefault();
                const courseCard = courseBtn.closest('.course-card');
                const courseId = this.extractCourseIdFromCard(courseCard);
                
                if (courseId) {
                    this.navigateToCourse(courseId);
                }
            }
        });
    }

    extractCourseIdFromCard(courseCard) {
        // Extract course ID from data attributes or other markers
        const title = courseCard.querySelector('.course-title')?.textContent;
        if (!title) return null;

        // Map titles to IDs (in a real app, this would be in data attributes)
        const titleToIdMap = {
            'Python Programming for Beginners': 'python-basics',
            'Complete JavaScript Tutorial': 'yt-js-tutorial',
            'Calculus I - Differential Calculus': 'math-calculus',
            'Organic Chemistry Fundamentals': 'chemistry-organic',
            'Machine Learning Course - Stanford CS229': 'yt-machine-learning',
            'Learn Spanish - Complete Beginner Course': 'yt-spanish-beginner'
        };

        return titleToIdMap[title] || null;
    }

    setupEnhancedFiltering() {
        // Add module-aware filtering
        const filterElements = document.querySelectorAll('.pill, .filter-select');
        
        filterElements.forEach(element => {
            element.addEventListener('change', () => {
                this.applyFiltersWithModuleInfo();
            });
        });
    }

    applyFiltersWithModuleInfo() {
        // Enhanced filtering that considers module availability
        const courses = document.querySelectorAll('.course-card');
        const activeFilters = this.getActiveFilters();
        
        courses.forEach(course => {
            const courseData = this.extractCourseDataFromCard(course);
            const shouldShow = this.shouldShowCourse(courseData, activeFilters);
            
            course.style.display = shouldShow ? 'block' : 'none';
        });
    }

    getActiveFilters() {
        const activePill = document.querySelector('.pill.active');
        const levelFilter = document.getElementById('level-filter');
        const typeFilter = document.getElementById('type-filter');
        
        return {
            category: activePill ? activePill.dataset.category : '',
            level: levelFilter ? levelFilter.value : '',
            type: typeFilter ? typeFilter.value : ''
        };
    }

    shouldShowCourse(courseData, filters) {
        if (filters.category && courseData.category !== filters.category) return false;
        if (filters.level && courseData.level !== filters.level) return false;
        if (filters.type && courseData.type !== filters.type) return false;
        return true;
    }

    extractCourseDataFromCard(courseCard) {
        return {
            category: courseCard.dataset.category || '',
            level: courseCard.dataset.level || '',
            type: courseCard.dataset.type || ''
        };
    }

    getAllCourses() {
        // In a real implementation, this would come from the server
        // For now, we'll extract from the existing page data
        try {
            return window.coursesData || [];
        } catch (e) {
            return [];
        }
    }

    getStudentId() {
        // Get student ID from various sources
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('student_id') || 
               localStorage.getItem('student_id') || 
               sessionStorage.getItem('student_id') ||
               this.getCookieValue('student_id');
    }

    getCookieValue(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }
}

// Initialize the course navigator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.courseNavigator = new CourseNavigator();
});

// Legacy support for inline onclick handlers
function navigateToCourseModule(courseId) {
    if (window.courseNavigator) {
        window.courseNavigator.navigateToCourse(courseId);
    }
}
