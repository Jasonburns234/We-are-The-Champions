// Import Firebase modules from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, set } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Configure Firebase app settings (currently empty, but should contain databaseURL)
const appSettings = {
    databaseURL: "https://we-are-the-champions-85a85-default-rtdb.europe-west1.firebasedatabase.app/"
};

// Initialize the Firebase app with the provided settings
const app = initializeApp(appSettings);

// Get a reference to the Firebase database instance
const database = getDatabase(app);

// Get references to HTML elements in the DOM
const inputFieldEl = document.getElementById("input-field");
const addButtonEl = document.getElementById("add-button");
const shoppingListEl = document.getElementById("shopping-list");
const toFieldEl = document.getElementById("to-field");
const fromFieldEl = document.getElementById("from-field");

// Add a click event listener to the "Add" button
addButtonEl.addEventListener("click", function () {
    // Retrieve the values from the input fields
    const toValue = toFieldEl.value;
    const inputValue = inputFieldEl.value;
    const fromValue = fromFieldEl.value;

    // Create an object containing the "to", "input", "from", and "likes" values
    const newItem = {
        to: toValue,
        input: inputValue,
        from: fromValue,
        likes: 0, // Initialize likes count to 0 for new items
    };

    // Push the new item object to the "shoppingList" location in the database
    push(ref(database, "shoppingList"), newItem);

    // Clear the input fields after adding the item
    clearInputFields();

    // Add the heart icon under the "From" paragraph
    appendHeartIcon(fromFieldEl);
});

// Function to clear the content of the input fields
function clearInputFields() {
    toFieldEl.value = "";
    inputFieldEl.value = "";
    fromFieldEl.value = "";
}

// Function to append the heart icon under the "From" paragraph
function appendHeartIcon(fromFieldEl) {
    // Check if a heart icon already exists
    if (fromFieldEl.querySelector(".fa.fa-heart") === null) {
        // Create the heart icon element
        const heartIcon = document.createElement("i");
        heartIcon.className = "fa fa-heart";
        heartIcon.style.fontSize = "14px";
        heartIcon.style.color = "#28A9F1";

        // Append the heart icon under the "From" paragraph
        fromFieldEl.appendChild(heartIcon);
    }
}

// Add a listener to the "shoppingList" location in the database
onValue(ref(database, "shoppingList"), function (snapshot) {
    const items = snapshot.val();
    if (items) {
        const itemsArray = Object.entries(items);
        clearShoppingListEl();
        itemsArray.forEach(([itemID, item]) => {
            appendItemToShoppingListEl(itemID, item);
        });
    } else {
        shoppingListEl.innerHTML = "No items here... yet";
    }
});

// Function to append a new item to the shopping list element
function appendItemToShoppingListEl(itemID, item) {
    const { to, input, from, likes } = item;

    // Create a new list item element
    const newEl = document.createElement("div");
    newEl.setAttribute("id", "endorsedContainer");

    // Create and append the "to" paragraph element
    const toParagraph = document.createElement("p");
    toParagraph.textContent = `To: ${to}`;
    newEl.appendChild(toParagraph);

    // Create and append the input paragraph element
    const inputParagraph = document.createElement("p");
    inputParagraph.textContent = input;
    inputParagraph.setAttribute("id", "inputParagraph");
    newEl.appendChild(inputParagraph);

    // Create and append the "from" paragraph element
    const fromParagraph = document.createElement("p");
    fromParagraph.textContent = `From: ${from}`;
    newEl.appendChild(fromParagraph);

    // Create and append the "Likes" paragraph element
    const likesParagraph = document.createElement("p");
    likesParagraph.textContent = `Likes: ${likes} `;
    likesParagraph.style.textAlign = "right";

    // Create the heart icon element
    const heartIcon = document.createElement("i");
    heartIcon.className = "fa fa-heart";
    heartIcon.style.fontSize = "14px";
    heartIcon.style.color = "#28A9F1";

    // Add a click event listener to the new element to handle item likes
    let likeCounter = likes || 0;
    newEl.addEventListener("click", function () {
        likeCounter++;
        likesParagraph.textContent = `Likes: ${likeCounter} `;
        updateLikeCount(itemID, likeCounter);
    });

    // Append the heart icon to the "Likes" paragraph
    likesParagraph.appendChild(heartIcon);

    // Add a double-click event listener to the new element to handle item removal
    newEl.addEventListener("dblclick", function () {
        const exactLocationOfItemInDB = ref(database, `shoppingList/${itemID}`);
        remove(exactLocationOfItemInDB);
    });

    // Append the new element to the shopping list element in the DOM
    newEl.appendChild(likesParagraph);
    shoppingListEl.append(newEl);
}

// Function to clear the content of the shopping list element
function clearShoppingListEl() {
    shoppingListEl.innerHTML = "";
}

// Function to update the like count in the database
function updateLikeCount(itemID, likesCount) {
    set(ref(database, `shoppingList/${itemID}/likes`), likesCount);
}

