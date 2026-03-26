import { requireAuth, apiFetch, logout, getUserName } from "./auth.js";

if (!requireAuth()) throw new Error("Not authenticated");

const addButton = document.getElementById("new-costumer");
const nameInput = document.getElementById("name-input");
const dateInput = document.getElementById("date-input");
const list = document.getElementById("card-owners");
const modal = document.querySelector(".cancellation");
const modal2 = document.querySelector(".remove");
const yesButton = document.getElementById("yes");
const noButton = document.getElementById("no");
const overlay = document.querySelector(".overlay");
const del = document.getElementById("delete");
const undel = document.getElementById("undelete");
const logoutBtn = document.getElementById("logout-btn");
const userGreeting = document.getElementById("user-greeting");

let currentCheckbox = null;
let currentLi = null;

// Display logged-in user name
const name = getUserName();
if (name) userGreeting.textContent = `Hello, ${name}`;

logoutBtn.addEventListener("click", logout);

// --- Checkbox uncheck confirmation modal ---

list.addEventListener("change", async (event) => {
  if (event.target.classList.contains("check")) {
    const checkbox = event.target;

    if (!checkbox.checked) {
      currentCheckbox = checkbox;
      modal.style.display = "flex";
      overlay.style.display = "block";
      return;
    }

    // When checking (not unchecking), save immediately
    const li = checkbox.closest("li");
    const cardId = li.dataset.cardId;
    const checkboxes = li.querySelectorAll(".check");
    const checkStates = Array.from(checkboxes).map((cb) => cb.checked);

    try {
      const response = await apiFetch(`/cards/${cardId}`, {
        method: "PATCH",
        body: JSON.stringify({ checkboxes: checkStates }),
      });
      if (!response || !response.ok) throw new Error("Update failed");
    } catch (error) {
      console.error("Error updating:", error);
    }
  }
});

yesButton.addEventListener("click", async () => {
  if (currentCheckbox) {
    currentCheckbox.checked = false;

    const li = currentCheckbox.closest("li");
    const cardId = li.dataset.cardId;
    const checkboxes = li.querySelectorAll(".check");
    const checkStates = Array.from(checkboxes).map((cb) => cb.checked);

    try {
      await apiFetch(`/cards/${cardId}`, {
        method: "PATCH",
        body: JSON.stringify({ checkboxes: checkStates }),
      });
    } catch (error) {
      console.error("Error updating:", error);
    }
  }
  closeModal();
});

noButton.addEventListener("click", () => {
  if (currentCheckbox) {
    currentCheckbox.checked = true;
  }
  closeModal();
});

function closeModal() {
  modal.style.display = "none";
  overlay.style.display = "none";
  currentCheckbox = null;
}

function closeModal2() {
  modal2.style.display = "none";
  overlay.style.display = "none";
  currentLi = null;
}

// --- Add new customer ---

addButton.addEventListener("click", async function () {
  const customerName = nameInput.value.trim();
  const dateValue = dateInput.value;

  if (!customerName || !dateValue) return;

  const inputDate = new Date(dateValue);
  const purchasedOn = inputDate.toLocaleDateString();

  const expiredDate = new Date(dateValue);
  expiredDate.setMonth(expiredDate.getMonth() + 6);
  const expiredOn = expiredDate.toLocaleDateString();

  const newCard = {
    name: customerName,
    purchasedOn,
    expiredOn,
    checkboxes: Array(10).fill(false),
  };

  try {
    const response = await apiFetch("/cards", {
      method: "POST",
      body: JSON.stringify(newCard),
    });

    if (!response || !response.ok) throw new Error("Save failed");

    const result = await response.json();
    newCard._id = result.insertedId;

    const cardElement = createCardElement(newCard);
    list.appendChild(cardElement);

    nameInput.value = "";
    dateInput.value = "";
  } catch (error) {
    console.error("Error saving card:", error);
  }
});

// --- Delete card ---

del.addEventListener("click", async () => {
  const cardId = modal2.dataset.cardId;
  const listItem = document.querySelector(`li[data-card-id="${cardId}"]`);

  if (!cardId) return;

  try {
    const response = await apiFetch(`/cards/${cardId}`, { method: "DELETE" });
    if (!response || !response.ok) throw new Error("Delete failed");

    if (listItem) listItem.remove();
    closeModal2();
  } catch (error) {
    console.error("Error deleting card:", error);
  }
});

undel.addEventListener("click", () => {
  closeModal2();
});

window.addEventListener("click", (event) => {
  if (event.target === modal2) {
    closeModal2();
  }
});

// --- Load cards from server ---

async function getCards() {
  try {
    const response = await apiFetch("/cards");
    if (!response) return;
    const data = await response.json();

    list.innerHTML = "";
    data.forEach((card) => {
      const cardElement = createCardElement(card);
      list.appendChild(cardElement);
    });
  } catch (error) {
    console.error("Error fetching cards:", error);
  }
}

function createCardElement(card) {
  const li = document.createElement("li");
  li.dataset.cardId = card._id;

  const strong = document.createElement("strong");
  strong.textContent = card.name;
  li.appendChild(strong);

  const purchasedDiv = document.createElement("div");
  purchasedDiv.innerHTML = `<span>purchased on:</span> <span class="date">${card.purchasedOn}</span>`;
  li.appendChild(purchasedDiv);

  const expiredDiv = document.createElement("div");
  expiredDiv.innerHTML = `<span>expired on:</span> <span class="date">${card.expiredOn}</span>`;
  li.appendChild(expiredDiv);

  const checkContainer = document.createElement("div");
  checkContainer.classList.add("check-container");

  let checkboxIndex = 0;
  for (let i = 0; i < 2; i++) {
    const checkRow = document.createElement("div");
    checkRow.classList.add("check-row");

    for (let j = 0; j < 5; j++) {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.classList.add("check");

      if (card.checkboxes && card.checkboxes[checkboxIndex]) {
        checkbox.checked = true;
      }

      checkRow.appendChild(checkbox);
      checkboxIndex++;
    }

    checkContainer.appendChild(checkRow);
  }
  li.appendChild(checkContainer);

  const removeButton = document.createElement("button");
  removeButton.classList.add("remove-btn");
  removeButton.textContent = "X";
  removeButton.addEventListener("click", () => {
    modal2.style.display = "flex";
    overlay.style.display = "block";
    modal2.dataset.cardId = card._id;
  });

  li.appendChild(removeButton);
  return li;
}

getCards();
