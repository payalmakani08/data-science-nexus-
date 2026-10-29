// Get elements from HTML
const topicCards = document.getElementById("topicCards");
const searchInput = document.getElementById("searchInput");
const noResults = document.getElementById("noResults");

let topics = [];


// Load topics from JSON
fetch("data.json")
    .then(function (response) {
        if (!response.ok) {
            throw new Error("Unable to load topic data");
        }

        return response.json();
    })
    .then(function (data) {
        topics = data.topics;

        displayTopics(topics);
    })
    .catch(function (error) {
        console.error("Error loading data:", error);

        topicCards.innerHTML =
            "<p class='text-center'>Unable to load topics. Please refresh the page.</p>";
    });


// Display topic cards
function displayTopics(topicList) {

    topicCards.innerHTML = "";

    if (topicList.length === 0) {
        noResults.style.display = "block";
        return;
    }

    noResults.style.display = "none";

    topicList.forEach(function (topic) {

        const column = document.createElement("div");

        column.className = "col-md-6 col-lg-4";

        column.innerHTML = `
            <div class="topic-card">

                <img
                    src="${topic.image}"
                    alt="${topic.title}"
                    loading="lazy"
                >

                <div class="card-content">

                    <h5>${topic.title}</h5>

                    <p>${topic.description}</p>

                    <a
                        href="${topic.link}"
                        target="_blank"
                        rel="noopener"
                    >
                        Learn More →
                    </a>

                </div>

            </div>
        `;

        topicCards.appendChild(column);
    });
}


// Search topics
searchInput.addEventListener("input", function () {

    const searchText = searchInput.value.toLowerCase();

    const filteredTopics = topics.filter(function (topic) {

        return (
            topic.title.toLowerCase().includes(searchText) ||
            topic.description.toLowerCase().includes(searchText)
        );

    });

    displayTopics(filteredTopics);

});


// Show current year in footer
document.getElementById("currentYear").textContent =
    new Date().getFullYear();
