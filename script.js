console.log("hello");
"use strict";

const STORAGE_KEY = "campusconnect_listings_v1";

const sampleListings = [
  {
    id: "demo1",
    type: "lost",
    title: "Student ID Card",
    category: "Documents",
    location: "Central Library",
    description: "A student ID card was misplaced near the library entrance.",
    contact: "student@example.com",
    resolved: false,
    createdAt: Date.now() - 1000 * 60 * 15,
    demo: true
  },
  {
    id: "demo2",
    type: "found",
    title: "Wireless Earbuds",
    category: "Electronics",
    location: "Block 12, Classroom 204",
    description: "A pair of wireless earbuds was found after class.",
    contact: "finder@example.com",
    resolved: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    demo: true
  },
  {
    id: "demo3",
    type: "resource",
    title: "Engineering Mathematics Notes",
    category: "Study Materials",
    location: "Academic Block",
    description: "Revision notes covering matrices, eigenvalues and calculus.",
    contact: "notes@example.com",
    resolved: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    demo: true
  },
  {
    id: "demo4",
    type: "lost",
    title: "Blue Water Bottle",
    category: "Personal Accessories",
    location: "University Cafeteria",
    description: "A blue reusable water bottle may have been left on a table.",
    contact: "student2@example.com",
    resolved: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    demo: true
  },
  {
    id: "demo5",
    type: "found",
    title: "Notebook",
    category: "Books",
    location: "Sports Complex",
    description: "A notebook was found on a bench near the entrance.",
    contact: "finder2@example.com",
    resolved: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 30,
    demo: true
  },
  {
    id: "demo6",
    type: "resource",
    title: "Python Programming Practice",
    category: "Study Materials",
    location: "Computer Lab",
    description: "Practice questions on loops, strings, lists and dictionaries.",
    contact: "python@example.com",
    resolved: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    demo: true
  }
];

const $ = (selector) => document.querySelector(selector);

const form = $("#listingForm");
const grid = $("#listingGrid");
const searchInput = $("#searchInput");
const categoryFilter = $("#categoryFilter");
const typeFilter = $("#typeFilter");
const statusFilter = $("#statusFilter");
const emptyState = $("#emptyState");
const resultsText = $("#resultsText");
const formMessage = $("#formMessage");
const toast = $("#toast");

let listings = loadListings();
let toastTimer;

function loadListings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleListings));
      return sampleListings;
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      throw new Error("Invalid saved data");
    }

    return parsed.filter(item =>
      item &&
      typeof item.id === "string" &&
      typeof item.title === "string" &&
      ["lost", "found", "resource"].includes(item.type)
    );
  } catch (error) {
    console.error("Could not load listings:", error);
    showToast("Saved data could not be loaded. Check browser storage.");
    return [];
  }
}

function saveListings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
    return true;
  } catch (error) {
    console.error("Could not save listings:", error);
    showToast("Could not save changes. Browser storage may be full.");
    return false;
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function formatDate(timestamp) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getRelativeTime(timestamp) {
  const elapsed = Math.max(0, Date.now() - Number(timestamp));

  if (!Number.isFinite(elapsed)) return "Date unavailable";
  if (elapsed < 60000) return "Just now";

  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  return formatDate(timestamp);
}

function getTypeLabel(type) {
  const labels = {
    lost: "Lost item",
    found: "Found item",
    resource: "Study resource"
  };

  return labels[type] || "Listing";
}

function getEmoji(item) {
  if (item.type === "resource") return "📚";

  const emojis = {
    Electronics: "🎧",
    Documents: "🪪",
    "Personal Accessories": "🎒",
    "Study Materials": "📖",
    Books: "📕",
    Other: "📦"
  };

  return emojis[item.category] || "📦";
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;

  return element;
}

function addBadge(parent, text, className) {
  const badge = createElement("span", `pill ${className}`, text);
  parent.appendChild(badge);
}

function createListingCard(item) {
  const card = createElement(
    "article",
    `listing-card${item.resolved ? " resolved-card" : ""}`
  );

  const top = createElement("div", "listing-top");
  const emoji = createElement("div", "listing-emoji", getEmoji(item));
  emoji.setAttribute("aria-hidden", "true");

  const badges = createElement("div", "badge-list");
  addBadge(badges, getTypeLabel(item.type), `pill-${item.type}`);

  if (item.resolved) {
    addBadge(badges, "Resolved", "pill-resolved");
  }

  top.append(emoji, badges);
  card.appendChild(top);

  card.appendChild(createElement("h3", "", item.title));
  card.appendChild(
    createElement("p", "listing-category", item.category || "Other")
  );
  card.appendChild(
    createElement("p", "listing-description", item.description)
  );

  const meta = createElement("div", "listing-meta");

  meta.appendChild(
    createElement("span", "", `📍 ${item.location}`)
  );

  meta.appendChild(
    createElement("span", "", `✉ ${item.contact}`)
  );

  meta.appendChild(
    createElement("span", "", `Posted: ${formatDate(item.createdAt)}`)
  );

  card.appendChild(meta);

  const footer = createElement("div", "listing-footer");
  footer.appendChild(
    createElement("span", "posted-time", getRelativeTime(item.createdAt))
  );

  const actions = createElement("div", "card-actions");

  if (!item.resolved) {
    const resolveButton = createElement("button", "small-button", "Resolve");
    resolveButton.type = "button";
    resolveButton.dataset.action = "resolve";
    resolveButton.dataset.id = item.id;
    resolveButton.setAttribute("aria-label", `Resolve ${item.title}`);
    actions.appendChild(resolveButton);
  }

  const deleteButton = createElement("button", "small-button danger", "Delete");
  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";
  deleteButton.dataset.id = item.id;
  deleteButton.setAttribute("aria-label", `Delete ${item.title}`);
  actions.appendChild(deleteButton);

  footer.appendChild(actions);
  card.appendChild(footer);

  return card;
}

function updateStatistics() {
  $("#totalCount").textContent = listings.length;
  $("#lostCount").textContent =
    listings.filter(item => item.type === "lost").length;
  $("#foundCount").textContent =
    listings.filter(item => item.type === "found").length;
  $("#resourceCount").textContent =
    listings.filter(item => item.type === "resource").length;
}

function getFilteredListings() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const type = typeFilter.value;
  const status = statusFilter.value;

  return listings
    .filter(item => {
      const searchableText = [
        item.title,
        item.category,
        item.location,
        item.description,
        item.contact
      ].join(" ").toLowerCase();

      const matchesSearch = searchableText.includes(query);
      const matchesCategory =
        category === "all" || item.category === category;
      const matchesType = type === "all" || item.type === type;

      const matchesStatus =
        status === "all" ||
        (status === "active" && !item.resolved) ||
        (status === "resolved" && item.resolved);

      return matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesStatus;
    })
    .sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
}

function renderListings() {
  const filtered = getFilteredListings();

  grid.replaceChildren();

  filtered.forEach(item => {
    grid.appendChild(createListingCard(item));
  });

  emptyState.hidden = filtered.length !== 0;
  grid.hidden = filtered.length === 0;

  resultsText.textContent =
    `Showing ${filtered.length} of ${listings.length} listings`;

  updateStatistics();
}

function resetFilters() {
  searchInput.value = "";
  categoryFilter.value = "all";
  typeFilter.value = "all";
  statusFilter.value = "active";
  renderListings();
}

function openReportForm() {
  $("#report").scrollIntoView({ behavior: "smooth" });
  $("#itemTitle").focus({ preventScroll: true });
}

$("#showFormButton").addEventListener("click", openReportForm);
$("#emptyPostButton").addEventListener("click", openReportForm);

searchInput.addEventListener("input", renderListings);
categoryFilter.addEventListener("change", renderListings);
typeFilter.addEventListener("change", renderListings);
statusFilter.addEventListener("change", renderListings);

$("#clearFilters").addEventListener("click", resetFilters);

$("#currentYear").textContent = new Date().getFullYear();

$("#itemType").addEventListener("change", () => {
  const type = $("#itemType").value;
  const category = $("#itemCategory");

  if (type === "resource") {
    category.value = "Study Materials";
  }
});

form.addEventListener("submit", event => {
  event.preventDefault();

  if (!form.reportValidity()) return;

  const data = new FormData(form);

  const newListing = {
    id: (
      window.crypto &&
      typeof window.crypto.randomUUID === "function"
    ) ? window.crypto.randomUUID() :
      `${Date.now()}-${Math.random().toString(36).slice(2)}`,

    type: String(data.get("type")),
    title: String(data.get("title")).trim(),
    category: String(data.get("category")),
    location: String(data.get("location")).trim(),
    description: String(data.get("description")).trim(),
    contact: String(data.get("contact")).trim(),
    resolved: false,
    createdAt: Date.now(),
    demo: false
  };

  if (
    !newListing.title ||
    !newListing.location ||
    !newListing.description ||
    !newListing.contact
  ) {
    formMessage.textContent = "Please complete all required fields.";
    return;
  }

  listings.unshift(newListing);

  if (!saveListings()) {
    listings.shift();
    return;
  }

  form.reset();
  formMessage.textContent = "Your listing was published successfully!";

  resetFilters();
  showToast("Your listing has been published!");

  $("#listings").scrollIntoView({ behavior: "smooth" });
});

grid.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");

  if (!button || !grid.contains(button)) return;

  const { action, id } = button.dataset;
  const index = listings.findIndex(item => item.id === id);

  if (index === -1) {
    showToast("This listing could not be found.");
    return;
  }

  const item = listings[index];

  if (action === "resolve") {
    const previousValue = item.resolved;
    item.resolved = true;

    if (!saveListings()) {
      item.resolved = previousValue;
      return;
    }

    renderListings();
    showToast("Listing marked as resolved!");
  }

  if (action === "delete") {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.title}"?`
    );

    if (!confirmed) return;

    const removed = listings.splice(index, 1)[0];

    if (!saveListings()) {
      listings.splice(index, 0, removed);
      return;
    }

    renderListings();
    showToast("Listing deleted.");
  }
});

renderListings();
