// Fetch user
let currentUser;
(async () => {
  const { data } = await supabase.auth.getUser();
  currentUser = data.user;
  fetchTransactions();
})();

// Read
async function fetchTransactions() {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (error) console.error(error);
  else renderTransactions(data);
}

// Create
async function addTransactionForm() {
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const note = document.getElementById("note").value;

  const { error } = await supabase.from("transactions").insert([{
    user_id: currentUser.id,
    amount, type, category, note
  }]);

  if (error) alert(error.message);
  else fetchTransactions();
}

// Update
async function editTransaction(id, amount, type, category, note) {
  document.getElementById("amount").value = amount;
  document.getElementById("type").value = type;
  document.getElementById("category").value = category;
  document.getElementById("note").value = note;

  // Change submit button behavior to update
  const btn = document.querySelector("form button");
  btn.textContent = "Update";
  btn.onclick = () => updateTransaction(id);
}

async function updateTransaction(id) {
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const note = document.getElementById("note").value;

  const { error } = await supabase
    .from("transactions")
    .update({ amount, type, category, note })
    .eq("id", id)
    .eq("user_id", currentUser.id);

  if (error) alert(error.message);
  else {
    resetForm();
    fetchTransactions();
  }
}

// Delete
async function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", currentUser.id);

  if (error) alert(error.message);
  else fetchTransactions();
}

function resetForm() {
  document.getElementById("amount").value = "";
  document.getElementById("type").value = "income";
  document.getElementById("category").value = "";
  document.getElementById("note").value = "";
  const btn = document.querySelector("form button");
  btn.textContent = "Add";
  btn.onclick = addTransactionForm;
}
function renderTransactions(data) {
  const tableContainer = document.getElementById("transactions");
  tableContainer.innerHTML = `
    <table border="1" width="100%">
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Amount</th>
          <th>Category</th>
          <th>Note</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${data
          .map(
            t => `
            <tr>
              <td>${new Date(t.created_at).toLocaleDateString()}</td>
              <td>${t.type.toUpperCase()}</td>
              <td>₹${t.amount}</td>
              <td>${t.category || "-"}</td>
              <td>${t.note || "-"}</td>
              <td>
                <button onclick="editTransaction('${t.id}', ${t.amount}, '${t.type}', '${t.category || ""}', '${t.note || ""}')">✏️ Edit</button>
                <button onclick="deleteTransaction('${t.id}')">🗑️ Delete</button>
              </td>
            </tr>
          `
          )
          .join("")}
      </tbody>
    </table>
  `;
}


