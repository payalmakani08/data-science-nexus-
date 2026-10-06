/* =========================================================
   DS/NEXUS APPLICATION
   GitHub Pages / No Backend Required
========================================================= */

"use strict";


/* =========================================================
   GLOBAL STATE
========================================================= */

let posts = [];
let currentCategory = "All";
let currentPost = null;


/* =========================================================
   LOCAL STORAGE DATABASE
========================================================= */

const DB_KEY = "ds_nexus_database";


const defaultDB = {

    visits: 0,

    likes: {},

    bookmarks: {},

    comments: {},

    newsletter: [],

    theme: "dark"

};


function getDB() {

    try {

        const saved =
            localStorage.getItem(DB_KEY);

        if (!saved) {

            localStorage.setItem(
                DB_KEY,
                JSON.stringify(defaultDB)
            );

            return structuredClone(defaultDB);

        }

        return {
            ...defaultDB,
            ...JSON.parse(saved)
        };

    } catch (error) {

        return structuredClone(defaultDB);

    }

}


function saveDB(db) {

    localStorage.setItem(
        DB_KEY,
        JSON.stringify(db)
    );

}


/* =========================================================
   DOM
========================================================= */

const postsGrid =
    document.getElementById("postsGrid");

const categoryFilters =
    document.getElementById("categoryFilters");

const searchInput =
    document.getElementById("searchInput");

const themeBtn =
    document.getElementById("themeBtn");

const signalSlider =
    document.getElementById("signalSlider");

const signalValue =
    document.getElementById("signalValue");

const probabilityValue =
    document.getElementById("probabilityValue");

const prediction =
    document.getElementById("prediction");

const ringProgress =
    document.getElementById("ringProgress");

const toastElement =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");


/* =========================================================
   LOAD POSTS.JSON
========================================================= */

async function loadPosts() {

    try {

        const response =
            await fetch("posts.json");

        if (!response.ok) {

            throw new Error(
                "Unable to load posts.json"
            );

        }

        posts =
            await response.json();

        buildCategories();

        renderPosts();

        updateHeroStats();

    } catch (error) {

        console.error(error);

        postsGrid.innerHTML = `

            <div class="col-12">

                <div class="post-card">

                    <h3>
                        Data stream unavailable
                    </h3>

                    <p class="post-excerpt">
                        Please make sure posts.json exists
                        in the same GitHub repository.
                    </p>

                </div>

            </div>

        `;

    }

}


/* =========================================================
   CATEGORY SYSTEM
========================================================= */

function buildCategories() {

    const categories = [
        "All",
        ...new Set(
            posts.map(post => post.category)
        )
    ];

    categoryFilters.innerHTML = "";

    categories.forEach(category => {

        const button =
            document.createElement("button");

        button.className =
            "filter-btn" +
            (category === "All"
                ? " active"
                : "");

        button.textContent =
            category;

        button.dataset.category =
            category;

        button.addEventListener(
            "click",
            () => {

                currentCategory =
                    category;

                document
                    .querySelectorAll(".filter-btn")
                    .forEach(btn =>
                        btn.classList.remove("active")
                    );

                button.classList.add("active");

                renderPosts();

            }
        );

        categoryFilters.appendChild(button);

    });

}


/* =========================================================
   RENDER POSTS
========================================================= */

function renderPosts() {

    const query =
        searchInput.value
            .trim()
            .toLowerCase();

    let filtered =
        posts.filter(post => {

            const categoryMatch =
                currentCategory === "All" ||
                post.category === currentCategory;

            const text =
                `${post.title}
                 ${post.excerpt}
                 ${post.category}
                 ${(post.tags || []).join(" ")}`
                    .toLowerCase();

            const searchMatch =
                !query ||
                text.includes(query);

            return categoryMatch &&
                   searchMatch;

        });


    if (!filtered.length) {

        postsGrid.innerHTML = `

            <div class="col-12">

                <div class="post-card text-center">

                    <i
                        class="bi bi-search"
                        style="font-size:40px">
                    </i>

                    <h3 class="mt-3">
                        No intelligence found
                    </h3>

                    <p class="post-excerpt">
                        Try another search term or category.
                    </p>

                </div>

            </div>

        `;

        return;

    }


    postsGrid.innerHTML =
        filtered.map(createPostCard).join("");


    document
        .querySelectorAll(".read-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openArticle(
                        Number(button.dataset.id)
                    );

                }
            );

        });


    revealElements();

}


/* =========================================================
   POST CARD
========================================================= */

function createPostCard(post) {

    const icons = {

        "Data Engineering":
            "bi-database",

        "Machine Learning":
            "bi-cpu",

        "Statistics":
            "bi-bar-chart",

        "AI Engineering":
            "bi-robot",

        "SQL":
            "bi-table",

        "Data Visualization":
            "bi-pie-chart"

    };


    const icon =
        icons[post.category] ||
        "bi-graph-up";


    return `

        <div class="col-md-6 col-xl-4">

            <article class="post-card reveal">

                <div class="post-visual">

                    <i class="bi ${icon}"></i>

                </div>

                <span class="post-category">
                    ${escapeHTML(post.category)}
                </span>

                <h3 class="post-title">
                    ${escapeHTML(post.title)}
                </h3>

                <p class="post-excerpt">
                    ${escapeHTML(post.excerpt)}
                </p>

                <div class="post-footer">

                    <span class="read-time">
                        <i class="bi bi-clock"></i>
                        ${post.readTime} min read
                    </span>

                    <button
                        class="read-btn"
                        data-id="${post.id}">

                        Read article
                        <i class="bi bi-arrow-right"></i>

                    </button>

                </div>

            </article>

        </div>

    `;

}


/* =========================================================
   ARTICLE MODAL
========================================================= */

function openArticle(id) {

    currentPost =
        posts.find(post => post.id === id);

    if (!currentPost) return;


    document.getElementById(
        "modalCategory"
    ).textContent =
        currentPost.category;


    document.getElementById(
        "modalTitle"
    ).textContent =
        currentPost.title;


    document.getElementById(
        "modalReadTime"
    ).textContent =
        `${currentPost.readTime} min read`;


    document.getElementById(
        "modalDate"
    ).textContent =
        currentPost.date;


    document.getElementById(
        "modalContent"
    ).textContent =
        currentPost.content;


    document.getElementById(
        "modalTags"
    ).innerHTML =
        (currentPost.tags || [])
            .map(tag =>
                `<span>#${escapeHTML(tag)}</span>`
            )
            .join("");


    updateArticleActions();

    loadComments();


    const modal =
        new bootstrap.Modal(
            document.getElementById(
                "articleModal"
            )
        );

    modal.show();

}


/* =========================================================
   LIKE
========================================================= */

document
    .getElementById("modalLike")
    .addEventListener(
        "click",
        () => {

            if (!currentPost) return;

            const db = getDB();

            db.likes[currentPost.id] =
                !db.likes[currentPost.id];

            saveDB(db);

            updateArticleActions();

            updateStats();

            showToast(
                db.likes[currentPost.id]
                    ? "Article liked."
                    : "Like removed."
            );

        }
    );


/* =========================================================
   BOOKMARK
========================================================= */

document
    .getElementById("modalBookmark")
    .addEventListener(
        "click",
        () => {

            if (!currentPost) return;

            const db = getDB();

            db.bookmarks[currentPost.id] =
                !db.bookmarks[currentPost.id];

            saveDB(db);

            updateArticleActions();

            updateStats();

            showToast(
                db.bookmarks[currentPost.id]
                    ? "Article bookmarked."
                    : "Bookmark removed."
            );

        }
    );


function updateArticleActions() {

    if (!currentPost) return;

    const db = getDB();

    const likeButton =
        document.getElementById(
            "modalLike"
        );

    const bookmarkButton =
        document.getElementById(
            "modalBookmark"
        );


    likeButton.classList.toggle(
        "active",
        !!db.likes[currentPost.id]
    );


    bookmarkButton.classList.toggle(
        "active",
        !!db.bookmarks[currentPost.id]
    );


    likeButton.innerHTML =
        db.likes[currentPost.id]

            ? `<i class="bi bi-heart-fill"></i> Liked`

            : `<i class="bi bi-heart"></i> Like`;


    bookmarkButton.innerHTML =
        db.bookmarks[currentPost.id]

            ? `<i class="bi bi-bookmark-fill"></i> Saved`

            : `<i class="bi bi-bookmark"></i> Bookmark`;

}


/* =========================================================
   COMMENTS
========================================================= */

document
    .getElementById("commentForm")
    .addEventListener(
        "submit",
        event => {

            event.preventDefault();

            if (!currentPost) return;


            const name =
                document
                    .getElementById(
                        "commentName"
                    )
                    .value
                    .trim();


            const text =
                document
                    .getElementById(
                        "commentText"
                    )
                    .value
                    .trim();


            if (!name || !text) return;


            const db = getDB();

            if (!db.comments[currentPost.id]) {

                db.comments[currentPost.id] =
                    [];

            }


            db.comments[currentPost.id].push({

                name,
                text,

                date:
                    new Date()
                        .toLocaleString()

            });


            saveDB(db);


            event.target.reset();

            loadComments();

            updateStats();

            showToast(
                "Comment published."
            );

        }
    );


function loadComments() {

    if (!currentPost) return;


    const db = getDB();

    const comments =
        db.comments[currentPost.id] || [];


    const container =
        document.getElementById(
            "commentsList"
        );


    if (!comments.length) {

        container.innerHTML = `

            <p class="text-secondary mt-4">
                No comments yet. Start the discussion.
            </p>

        `;

        return;

    }


    container.innerHTML =
        comments.map(comment => `

            <div class="comment">

                <strong>
                    ${escapeHTML(comment.name)}
                </strong>

                <p>
                    ${escapeHTML(comment.text)}
                </p>

                <small class="text-secondary">
                    ${escapeHTML(comment.date)}
                </small>

            </div>

        `).join("");

}


/* =========================================================
   NEWSLETTER
========================================================= */

document
    .getElementById("newsletterForm")
    .addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const input =
                document.getElementById(
                    "emailInput"
                );


            const email =
                input.value
                    .trim()
                    .toLowerCase();


            if (!email) return;


            const db = getDB();


            if (!db.newsletter.includes(email)) {

                db.newsletter.push(email);

                saveDB(db);

            }


            document.getElementById(
                "newsletterMessage"
            ).textContent =
                "✓ You're connected to the signal.";


            input.value = "";


            showToast(
                "Welcome to DS/NEXUS."
            );

        }
    );


/* =========================================================
   SEARCH
========================================================= */

searchInput.addEventListener(
    "input",
    renderPosts
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "k"
        ) {

            event.preventDefault();

            searchInput.focus();

        }

    }
);


/* =========================================================
   THEME
========================================================= */

function loadTheme() {

    const db = getDB();

    if (db.theme === "light") {

        document.body.classList.add(
            "light"
        );

        themeBtn.innerHTML =
            `<i class="bi bi-sun"></i>`;

    }

}


themeBtn.addEventListener(
    "click",
    () => {

        const db = getDB();

        const isLight =
            document.body.classList.toggle(
                "light"
            );


        db.theme =
            isLight
                ? "light"
                : "dark";


        saveDB(db);


        themeBtn.innerHTML =
            isLight

                ? `<i class="bi bi-sun"></i>`

                : `<i class="bi bi-moon-stars"></i>`;

    }
);


/* =========================================================
   PROBABILITY PLAYGROUND
========================================================= */

function updateProbability() {

    const value =
        Number(signalSlider.value);


    signalValue.textContent =
        value;


    probabilityValue.textContent =
        `${value}%`;


    const degrees =
        value * 3.6;


    ringProgress.style.background =
        `conic-gradient(
            #9b7cff 0deg,
            #4de7ff ${degrees}deg,
            rgba(255,255,255,.06) ${degrees}deg
        )`;


    if (value >= 80) {

        prediction.textContent =
            "VERY HIGH SIGNAL";

        prediction.style.color =
            "#55f5a7";

    } else if (value >= 60) {

        prediction.textContent =
            "HIGH SIGNAL";

        prediction.style.color =
            "#55f5a7";

    } else if (value >= 40) {

        prediction.textContent =
            "UNCERTAIN";

        prediction.style.color =
            "#ffd166";

    } else {

        prediction.textContent =
            "LOW SIGNAL";

        prediction.style.color =
            "#ff62c7";

    }

}


signalSlider.addEventListener(
    "input",
    updateProbability
);


/* =========================================================
   MODEL CHART
========================================================= */

function generateChart() {

    const points = [];

    let value = 155;


    for (
        let i = 0;
        i < 70;
        i++
    ) {

        value +=
            (Math.random() - .47) * 20;

        value =
            Math.max(
                45,
                Math.min(
                    250,
                    value
                )
            );


        points.push(value);

    }


    const width = 900;
    const height = 300;


    const step =
        width /
        (points.length - 1);


    let line = "";

    let area = "";


    points.forEach(
        (value, index) => {

            const x =
                index * step;

            const y =
                height - value;


            line +=
                `${index === 0 ? "M" : "L"}`
                + `${x} ${y} `;

        }
    );


    area =
        line +
        `L ${width} ${height}
         L 0 ${height}
         Z`;


    document.getElementById(
        "chartLine"
    ).setAttribute(
        "d",
        line
    );


    document.getElementById(
        "chartArea"
    ).setAttribute(
        "d",
        area
    );

}


function animateRequests() {

    const counter =
        document.getElementById(
            "requestCounter"
        );


    let number = 84291;


    setInterval(
        () => {

            number +=
                Math.floor(
                    Math.random() * 8
                ) + 1;


            counter.textContent =
                number.toLocaleString();

        },
        1800
    );

}


/* =========================================================
   LOCAL ANALYTICS
========================================================= */

function updateStats() {

    const db = getDB();


    const likes =
        Object.values(db.likes)
            .filter(Boolean)
            .length;


    const bookmarks =
        Object.values(db.bookmarks)
            .filter(Boolean)
            .length;


    const comments =
        Object.values(db.comments)
            .flat()
            .length;


    document.getElementById(
        "statVisits"
    ).textContent =
        db.visits;


    document.getElementById(
        "statLikes"
    ).textContent =
        likes;


    document.getElementById(
        "statBookmarks"
    ).textContent =
        bookmarks;


    document.getElementById(
        "statComments"
    ).textContent =
        comments;

}


/* =========================================================
   VISITOR COUNT
========================================================= */

function registerVisit() {

    const db = getDB();

    db.visits++;

    saveDB(db);

    updateStats();

}


/* =========================================================
   HERO STATS
========================================================= */

function updateHeroStats() {

    document.getElementById(
        "heroArticles"
    ).textContent =
        posts.length;


    document.getElementById(
        "heroCategories"
    ).textContent =
        new Set(
            posts.map(
                post => post.category
            )
        ).size;

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    toastMessage.textContent =
        message;


    const toast =
        bootstrap.Toast.getOrCreateInstance(
            toastElement,
            {
                delay: 2200
            }
        );


    toast.show();

}


/* =========================================================
   SCROLL REVEAL
========================================================= */

function revealElements() {

    const elements =
        document.querySelectorAll(
            ".reveal"
        );


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target
                                .classList
                                .add(
                                    "visible"
                                );

                        }

                    }
                );

            },
            {
                threshold: .08
            }
        );


    elements.forEach(
        element =>
            observer.observe(element)
    );

}


/* =========================================================
   CURSOR
========================================================= */

const cursorGlow =
    document.querySelector(
        ".cursor-glow"
    );


document.addEventListener(
    "mousemove",
    event => {

        cursorGlow.style.left =
            `${event.clientX}px`;

        cursorGlow.style.top =
            `${event.clientY}px`;

    }
);


/* =========================================================
   NEURAL NETWORK CANVAS
========================================================= */

function startNeuralNetwork() {

    const canvas =
        document.getElementById(
            "neuralCanvas"
        );


    const ctx =
        canvas.getContext("2d");


    let width;
    let height;


    const nodes = [];


    function resize() {

        width =
            canvas.width =
            window.innerWidth *
            devicePixelRatio;


        height =
            canvas.height =
            window.innerHeight *
            devicePixelRatio;


        canvas.style.width =
            `${window.innerWidth}px`;

        canvas.style.height =
            `${window.innerHeight}px`;


        ctx.scale(
            devicePixelRatio,
            devicePixelRatio
        );

    }


    resize();


    window.addEventListener(
        "resize",
        resize
    );


    const count =
        Math.min(
            75,
            Math.floor(
                window.innerWidth / 18
            )
        );


    for (
        let i = 0;
        i < count;
        i++
    ) {

        nodes.push({

            x:
                Math.random() *
                window.innerWidth,

            y:
                Math.random() *
                window.innerHeight,

            vx:
                (Math.random() - .5) *
                .25,

            vy:
                (Math.random() - .5) *
                .25

        });

    }


    function animate() {

        ctx.clearRect(
            0,
            0,
            window.innerWidth,
            window.innerHeight
        );


        nodes.forEach(
            node => {

                node.x += node.vx;
                node.y += node.vy;


                if (
                    node.x < 0 ||
                    node.x > window.innerWidth
                ) {

                    node.vx *= -1;

                }


                if (
                    node.y < 0 ||
                    node.y > window.innerHeight
                ) {

                    node.vy *= -1;

                }

            }
        );


        for (
            let i = 0;
            i < nodes.length;
            i++
        ) {

            for (
                let j = i + 1;
                j < nodes.length;
                j++
            ) {

                const a = nodes[i];
                const b = nodes[j];


                const dx =
                    a.x - b.x;

                const dy =
                    a.y - b.y;


                const distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );


                if (distance < 150) {

                    ctx.beginPath();

                    ctx.moveTo(
                        a.x,
                        a.y
                    );

                    ctx.lineTo(
                        b.x,
                        b.y
                    );


                    ctx.strokeStyle =
                        `rgba(
                            130,
                            110,
                            255,
                            ${1 - distance / 150}
                        )`;


                    ctx.lineWidth =
                        .5;


                    ctx.stroke();

                }

            }

        }


        nodes.forEach(
            node => {

                ctx.beginPath();

                ctx.arc(
                    node.x,
                    node.y,
                    1.5,
                    0,
                    Math.PI * 2
                );


                ctx.fillStyle =
                    "rgba(77,231,255,.6)";


                ctx.fill();

            }
        );


        requestAnimationFrame(
            animate
        );

    }


    animate();

}


/* =========================================================
   SECURITY / HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   INITIALIZE
========================================================= */

window.addEventListener(
    "load",
    () => {

        setTimeout(
            () => {

                document
                    .getElementById("loader")
                    .classList
                    .add("hide");

            },
            700
        );

    }
);


document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadTheme();

        registerVisit();

        loadPosts();

        updateProbability();

        generateChart();

        animateRequests();

        startNeuralNetwork();

        revealElements();

    }
);
