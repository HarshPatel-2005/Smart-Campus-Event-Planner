document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.querySelector(".search-form");
    const searchInput = document.getElementById("search");
    const cardsContainer = document.getElementById("eventCardsContainer");

    if (!searchForm || !searchInput || !cardsContainer) 
        return;

    const allCards = Array.from(cardsContainer.querySelectorAll(".cards"));

    function filterElements() {
        const query = searchInput.value.toLowerCase().trim();

        allCards.forEach(card => {
            const titleElement = card.querySelector("h4");
            const descElement = card.querySelector("p");

            const titleText = titleElement ? titleElement.textContent.toLowerCase() : "";
            const descText = descElement ? descElement.textContent.toLowerCase() : "";

            if (titleText.includes(query) || descText.includes(query)) {
                card.style.display = "flex";
            } else {
                card.style.display = "none";
            }
        });
    }

    searchForm.addEventListener("submit", (e) => {
        e.preventDefault(); 
        filterElements();
    });

    searchForm.addEventListener("reset", () => {
        setTimeout(() => {
            allCards.forEach(card => {
                card.style.display = "flex";
            });
        }, 10);
    });
});