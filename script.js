let data = [];

async function loadData() {
  const response = await fetch("publications_data.json");
  data = await response.json();
  setupFilters();
  renderTable();
}

function setupFilters() {
  const categories = new Set();
  const types = new Set();
  const ratings = new Set();
  const publishers = new Set();

  data.forEach(pub => {
    categories.add(pub.Category);
    types.add(pub.Type);
    ratings.add(pub.Rating);
    publishers.add(pub.Publisher);
  });

  createCheckboxes("categoryFilter", Array.from(categories), ["direct", "interface", "independent"]);
  createCheckboxes("typeFilter", Array.from(types), ["journal", "conference"]);

  const ratingSortOrder = { "A+": 0, "A": 1, "B": 2, "C": 3, "D": 4 };
  const sortedRatings = Array.from(ratings).sort((a, b) => ratingSortOrder[a] - ratingSortOrder[b]);
  createCheckboxes("ratingFilter", sortedRatings, ["A+", "A", "B", "C"]);

  const publisherSection = document.getElementById("publisherFilter");
  const toggle = document.createElement("button");
  toggle.textContent = "Show/Hide Publishers";
  toggle.style.marginBottom = "10px";
  toggle.onclick = () => {
    const list = document.getElementById("publisherList");
    list.style.display = list.style.display === "none" ? "block" : "none";
  };
  publisherSection.appendChild(toggle);

  const listDiv = document.createElement("div");
  listDiv.id = "publisherList";
  listDiv.style.display = "none";
  publisherSection.appendChild(listDiv);

  createCheckboxes("publisherList", Array.from(publishers).sort(), Array.from(publishers));
}

function createCheckboxes(containerId, values, preselected = []) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  values.forEach(value => {
    const id = `${containerId}_${value.replace(/[^a-zA-Z0-9]/g, "")}`;
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.value = value;
    checkbox.checked = preselected.includes(value);
    checkbox.addEventListener("change", renderTable);

    const label = document.createElement("label");
    label.setAttribute("for", id);
    label.style.marginRight = "10px";
    label.appendChild(document.createTextNode(value));

    const wrapper = document.createElement("div");
    wrapper.appendChild(checkbox);
    wrapper.appendChild(label);

    container.appendChild(wrapper);
  });
}

function getCheckedValues(containerId) {
  return Array.from(document.querySelectorAll(`#${containerId} input:checked`)).map(cb => cb.value);
}

function renderTable() {
  const search = document.getElementById("search").value.toLowerCase();
  const categories = getCheckedValues("categoryFilter");
  const types = getCheckedValues("typeFilter");
  const ratings = getCheckedValues("ratingFilter");
  const publishers = getCheckedValues("publisherList");

  const tbody = document.querySelector("#publicationsTable tbody");
  tbody.innerHTML = "";

  const filtered = data.filter(pub => {
    const matchesSearch = pub.Title.toLowerCase().includes(search);
    const matchesCategory = categories.includes(pub.Category);
    const matchesType = types.includes(pub.Type);
    const matchesRating = ratings.includes(pub.Rating);
    const matchesPublisher = publishers.includes(pub.Publisher);
    return matchesSearch && matchesCategory && matchesType && matchesRating && matchesPublisher;
  });

  for (const pub of filtered) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><a href="${pub.Link}" target="_blank">${pub.Title}</a></td>
      <td>${pub.Rating}</td>
      <td>${pub["Votes ≥ rating [%]"]}</td>
      <td>${pub.Publisher}</td>
      <td>${pub.Category}</td>
      <td>${pub.Type}</td>
    `;
    tbody.appendChild(row);
  }
}

document.getElementById("search").addEventListener("input", renderTable);

loadData();
