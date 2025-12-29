const addButton = document.getElementById("new-costumer");
const nameInput = document.getElementById("name-input");
const dateInput = document.getElementById("date-input"); // ליצור עם משתנה זה תאריך חדש
const list = document.getElementById("card-owners");
const modal = document.querySelector(".cancellation");
const modal2 = document.querySelector(".remove");
const yesButton = document.getElementById("yes");
const noButton = document.getElementById("no");
const overlay = document.querySelector(".overlay"); // עבור רקע מעורפל
const del = document.getElementById("delete");
const undel = document.getElementById("undelete");
let currentCheckbox = null;
let currentLi = null; // משתנה גלובלי לאחסון ה-li הנוכחי

//api
const POST_API = "http://localhost:5501/cards";

// הצגת חלון הביטול אם מנסים לבטל סימון
list.addEventListener("change", (event) => {
  if (event.target.classList.contains("check")) {
    const checkbox = event.target;
    if (!checkbox.checked) {
      currentCheckbox = checkbox; // שומר את הצ'קבוקס הנוכחי
      modal.style.display = "flex"; // מציג את החלון
      overlay.style.display = "block"; // מציג את הרקע המעורפל
    }
  }
});

// אישור הביטול
yesButton.addEventListener("click", () => {
  if (currentCheckbox) {
    currentCheckbox.checked = false; // ביטול הסימון
  }
  closeModal();
});

// ביטול הפעולה (הסימון נשאר)
noButton.addEventListener("click", () => {
  if (currentCheckbox) {
    currentCheckbox.checked = true; // משאיר את הסימון
  }
  closeModal();
});

// סגירת החלון
function closeModal() {
  modal.style.display = "none";
  overlay.style.display = "none"; // מסיר את הרקע המעורפל
  currentCheckbox = null;
}

function closeModal2() {
  modal2.style.display = "none";
  overlay.style.display = "none";
  currentLi = null; // אפס את המשתנה אחרי סגירת החלון
}

// הוספת לקוח חדש
addButton.addEventListener("click", function () {
  // יצירת אלמנט ה-li
  const li = document.createElement("li");

  // יצירת שם והוספתו
  const name = document.createElement("strong");
  name.textContent = nameInput.value;

  // יצירת התאריך
  const div = document.createElement("div");
  const span1 = document.createElement("span");
  const span2 = document.createElement("span");
  div.appendChild(span1);
  div.appendChild(span2);
  span1.textContent = "Purchased on: ";

  const inputDate = new Date(dateInput.value); // תאריך ברירת מחדל הוא היום
  span2.textContent = inputDate.toLocaleDateString();

  const div2 = document.createElement("div");
  const span3 = document.createElement("span");
  const span4 = document.createElement("span");
  div2.appendChild(span3);
  div2.appendChild(span4);
  span3.textContent = "Expired on: ";

  const expiredOutput = new Date(dateInput.value);
  expiredOutput.setMonth(expiredOutput.getMonth() + 6); // הוספת 6 חודשים
  span4.textContent = expiredOutput.toLocaleDateString(); // הצגת התאריך בפורמט קריא

  // יצירת שדות הצ'קבוקס
  const checkContainer = document.createElement("div");
  checkContainer.classList.add("check-container");

  // יצירת שורה ראשונה של צ'קבוקסים
  const checkRow1 = document.createElement("div");
  checkRow1.classList.add("check-row");
  for (let i = 0; i < 5; i++) {
    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.classList.add("check");
    checkRow1.appendChild(checkBox);
  }

  // יצירת שורה שנייה של צ'קבוקסים
  const checkRow2 = document.createElement("div");
  checkRow2.classList.add("check-row");
  for (let i = 0; i < 5; i++) {
    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    checkBox.classList.add("check");
    checkRow2.appendChild(checkBox);
  }

  checkContainer.appendChild(checkRow1);
  checkContainer.appendChild(checkRow2);

  // יצירת כפתור למחיקה
  const removeButton = document.createElement("button"); // הוספתי את הכפתור למקום הנכון
  removeButton.textContent = "X"; // הגדרת טקסט לכפתור
  removeButton.id = "remove";
  removeButton.addEventListener("click", function () {
    currentLi = li; // שומר את ה-li הנוכחי
    modal2.style.display = "flex"; // מציג את חלון האישור
    overlay.style.display = "block"; // מציג את הרקע המעורפל
  });

  // הוספת כל האלמנטים ל-li
  li.appendChild(name);
  li.appendChild(div);
  li.appendChild(div2);
  li.appendChild(checkContainer);
  li.appendChild(removeButton);

  async function save(li) {
    const newCard = {
      name: li.querySelector("strong").textContent,
      purchasedOn: li.querySelector("span:nth-child(2)").textContent,
      expiredOn: li.querySelector("div:nth-child(3) span:nth-child(2)")
        .textContent,
      checkboxes: [],
    };

    const checkboxes = li.querySelectorAll(".check"); // אוספים את כל הצ'קבוקסים מה-li
    checkboxes.forEach((checkbox) => {
      newCard.checkboxes.push(checkbox.checked); // דוחף את המצב של כל צ'קבוקס (true אם מסומן, false אם לא)
    });

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCard),
    };

    try {
      const response = await fetch(POST_API, options);
      const result = await response.json();
      console.log("Saved:", result);
    } catch (error) {
      console.error("oh no: " + error);
    }
  }

  save(li);

  // הוספת ה-li לרשימה
  list.appendChild(li);

  // ניקוי הקלטים לאחר הוספת הלקוח
  nameInput.value = "";
  dateInput.value = "";
});

// מחיקת ה-li כאשר לוחצים על YES בחלון האישור
del.addEventListener("click", () => {
  if (currentLi) {
    currentLi.remove(); // מחיקת ה-li הרלוונטי
    closeModal2();
  }
});

// סגירת חלון האישור בלי למחוק
undel.addEventListener("click", () => {
  closeModal2();
});
console.log("hi!");

const BASE_API = "http://localhost:5501/cards";

async function getCards() {
  try {
    const response = await fetch(BASE_API);
    const data = await response.json();
    console.log("📜 קיבלנו נתונים מהשרת:", data);

    const list = document.getElementById("card-owners");
    list.innerHTML = ""; // מנקה את הרשימה לפני טעינה מחדש

    data.forEach((card) => {
      const cardElement = createCardElement(card);
      list.appendChild(cardElement);
    });
  } catch (error) {
    console.error("❌ שגיאה בשליפת נתונים:", error);
  }
}

// פונקציה ליצירת כרטיס HTML
function createCardElement(card) {
  const li = document.createElement("li");
  li.dataset.cardId = card._id; // שומרים את ה-ID של הכרטיס בתוך ה-li

  // שם הכרטיס
  const strong = document.createElement("strong");
  strong.textContent = card.name;
  li.appendChild(strong);

  // תאריכים
  const purchasedDiv = document.createElement("div");
  purchasedDiv.innerHTML = `<span>purchased on:</span> <span class="date">${card.purchasedOn}</span>`;
  li.appendChild(purchasedDiv);

  const expiredDiv = document.createElement("div");
  expiredDiv.innerHTML = `<span>expired on:</span> <span class="date">${card.expiredOn}</span>`;
  li.appendChild(expiredDiv);

  // יצירת צ'קבוקסים
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

    // ✅ סימון אם checkbox אמור להיות מסומן לפי הנתונים מהשרת
    if (card.checkboxes && card.checkboxes[checkboxIndex]) {
      checkbox.checked = true;
    }

    checkRow.appendChild(checkbox);
    checkboxIndex++;
  }

  checkContainer.appendChild(checkRow);
}
  li.appendChild(checkContainer);

  // כפתור מחיקה
  const removeButton = document.createElement("button");
  removeButton.id = "remove";
  removeButton.textContent = "X";
  removeButton.addEventListener("click", () => openDeleteModal(li, card._id));

  li.appendChild(removeButton);

  return li;
}

// פתיחת המודאל ושמירת ה-ID למחיקה
function openDeleteModal(listItem, cardId) {
  const modal = document.getElementById("modal2");
  modal.style.display = "block";
  modal.dataset.cardId = cardId; // שמירת ה-ID למחיקה
  modal.dataset.listItemId = listItem.dataset.cardId; // מזהה את האלמנט ב-HTML
  console.log("🗑 מחיקת כרטיס עם ID:", cardId);
}

// מאזין קבוע לכפתור YES (מחיקה מהשרת)
document.getElementById("delete").addEventListener("click", async () => {
  const modal = document.getElementById("modal2");
  const cardId = modal.dataset.cardId;
  const listItem = document.querySelector(`li[data-card-id="${cardId}"]`);

  if (!cardId) {
    console.error("❌ שגיאה: אין ID למחיקה!");
    return;
  }

  try {
    const response = await fetch(`${BASE_API}/${cardId}`, { method: "DELETE" });

    if (!response.ok) throw new Error("❌ מחיקה נכשלה!");

    console.log(`✅ כרטיס עם ID ${cardId} נמחק בהצלחה!`);

    // מחיקת הכרטיס מה-HTML
    if (listItem) listItem.remove();

    // סגירת המודאל
    modal.style.display = "none";
  } catch (error) {
    console.error("❌ שגיאה במחיקת הכרטיס:", error);
  }
});

// מאזין קבוע לכפתור NO (סגירת המודאל)
document.getElementById("undelete").addEventListener("click", () => {
  document.getElementById("modal2").style.display = "none";
});

// סגירת המודאל בלחיצה מחוץ לו
window.addEventListener("click", (event) => {
  const modal = document.getElementById("modal2");
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

list.addEventListener("change", async (event) => {
  if (event.target.classList.contains("check")) {
    const checkbox = event.target;
    const li = checkbox.closest("li");
    const cardId = li.dataset.cardId;
    const checkboxes = li.querySelectorAll(".check");
    const checkStates = Array.from(checkboxes).map(cb => cb.checked);

    try {
      const response = await fetch(`http://localhost:5501/cards/${cardId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ checkboxes: checkStates }),
      });

      if (!response.ok) throw new Error("❌ עדכון נכשל");
      console.log("✅ עודכן במונגו");
    } catch (error) {
      console.error("⚠️ שגיאה בעדכון:", error);
    }
  }
});

// הפעלת הפונקציה הראשית להבאת הנתונים
getCards();
