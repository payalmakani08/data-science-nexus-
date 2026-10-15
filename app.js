// =====================================
// DS/NEXUS — SIMPLE BLOG SCRIPT
// =====================================

const postsContainer = document.getElementById("postsContainer");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const articleCount = document.getElementById("articleCount");
const emptyMessage = document.getElementById("emptyMessage");

let posts = [];

document.getElementById("currentYear").textContent =
    new Date().getFullYear();

// Load articles from posts.json
async function loadPosts() {
    try {
        const response = await fetch("./posts.json");

        if (!response.ok) {
            throw new Error("Could not load posts.json");
        }

        posts = await response.json();

        if (!Array.isArray(posts)) {
            throw new Error("The article data is not valid.");
        }

        showPosts();
    } catch (error) {
        postsContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning">
                    <strong>Articles could not be loaded.</strong>
                    Please check that posts.json is in the same folder
                    as index.html and contains valid JSON.
                </div>
            </div>
        `;

        articleCount.textContent = "Articles unavailable";
        console.error(error);
    }
}

// Display articles
function showPosts() {
    const keyword = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;

    const filteredPosts = posts.filter(function (post) {
        const title = (post.title || "").toLowerCase();
        const description = (post.description || "").toLowerCase();
        const postCategory = post.category || "";

        const matchesKeyword =
            title.includes(keyword) ||
            description.includes(keyword) ||
            postCategory.toLowerCase().includes(keyword);

        const matchesCategory =
            category === "all" || postCategory === category;

        return matchesKeyword && matchesCategory;
    });

    articleCount.textContent =
        `${filteredPosts.length} article${filteredPosts.length === 1 ? "" : "s"}`;

    emptyMessage.classList.toggle(
        "d-none",
        filteredPosts.length !== 0
    );

    if (filteredPosts.length === 0) {
        postsContainer.innerHTML = "";
        return;
    }

    postsContainer.innerHTML = filteredPosts.map(function (post) {
        const title = escapeHTML(post.title || "Untitled Article");
        const categoryName = escapeHTML(post.category || "General");
        const description = escapeHTML(post.description || "");
        const date = escapeHTML(post.date || "DS/NEXUS");
        const readTime = escapeHTML(post.readTime || "5 min read");

        const icon = getIcon(post.icon);
        const cover = getCover(post.cover);

        return `
            <div class="col-md-6 col-lg-4">
                <article class="post-card">
                    <div class="post-cover ${cover}">
                        <i class="bi ${icon}" aria-hidden="true"></i>
                    </div>

                    <div class="post-content">
                        <span class="post-category">
                            ${categoryName}
                        </span>

                        <h3>${title}</h3>

                        <p>${description}</p>

                        <div class="post-meta">
                            <span>
                                <i class="bi bi-bookmark me-1"></i>
                                ${date}
                            </span>

                            <span>
                                <i class="bi bi-clock me-1"></i>
                                ${readTime}
                            </span>
                        </div>
                    </div>
                </article>
            </div>
        `;
    }).join("");
}

// Keep article text safe when inserting it into HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return characters[character];
    });
}

// Use only the icons and cover styles included in this website
function getIcon(icon) {
    const allowedIcons = [
        "bi-bar-chart-line",
        "bi-cpu",
        "bi-code-slash",
        "bi-pie-chart",
        "bi-robot",
        "bi-graph-up-arrow"
    ];

    return allowedIcons.includes(icon) ? icon : "bi-journal-text";
}

function getCover(cover) {
    const allowedCovers = [
        "cover-purple",
        "cover-pink",
        "cover-blue",
        "cover-orange",
        "cover-teal",
        "cover-indigo"
    ];

    return allowedCovers.includes(cover) ? cover : "cover-purple";
}

// Search and category filter
searchInput.addEventListener("input", showPosts);
categoryFilter.addEventListener("change", showPosts);

// Select a topic from the topic cards
document.querySelectorAll(".topic-card").forEach(function (card) {
    card.addEventListener("click", function () {
        categoryFilter.value = card.dataset.topic;
        showPosts();
    });
});

// Start the website
loadPosts();
