let currentUser;

(async () => {
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    window.location.href = "login.html";
    return;
  }
  currentUser = data.user;
  fetchTransactions();
})();

// Fetch transactions
async function fetchTransactions() {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  renderTransactions(data);
  updateSummary(data);
}

// Render table
function renderTransactions(data) {
  const container = document.getElementById("transactions");
  if (!data.length) {
    container.innerHTML = "<p>No transactions yet.</p>";
    return;
  }

  container.innerHTML = `
    <table>
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
            <td>${t.type}</td>
            <td>₹${t.amount}</td>
            <td>${t.category || "-"}</td>
            <td>${t.note || "-"}</td>
            <td>
              <button onclick="editTransaction('${t.id}', ${t.amount}, '${t.type}', '${t.category || ""}', '${t.note || ""}')">Edit</button>
              <button onclick="deleteTransaction('${t.id}')">Delete</button>
            </td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

// Update summary
function updateSummary(data) {
  let income = 0, expense = 0;
  data.forEach(t => {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  });
  document.getElementById("income").textContent = income;
  document.getElementById("expense").textContent = expense;
  document.getElementById("balance").textContent = income - expense;
}

// Add transaction
document.getElementById("transaction-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const note = document.getElementById("note").value;

  const { error } = await supabase.from("transactions").insert([{
    user_id: currentUser.id, amount, type, category, note
  }]);

  if (error) return alert(error.message);
  e.target.reset();
  fetchTransactions();
});

// Edit transaction
function editTransaction(id, amount, type, category, note) {
  document.getElementById("amount").value = amount;
  document.getElementById("type").value = type;
  document.getElementById("category").value = category;
  document.getElementById("note").value = note;

  const btn = document.querySelector("#transaction-form button");
  btn.textContent = "Update";
  btn.onclick = async (e) => {
    e.preventDefault();
    const newAmount = parseFloat(document.getElementById("amount").value);
    const newType = document.getElementById("type").value;
    const newCategory = document.getElementById("category").value;
    const newNote = document.getElementById("note").value;

    const { error } = await supabase
      .from("transactions")
      .update({ amount: newAmount, type: newType, category: newCategory, note: newNote })
      .eq("id", id)
      .eq("user_id", currentUser.id);

    if (error) return alert(error.message);
    resetForm();
    fetchTransactions();
  };
}

// Delete transaction
async function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", currentUser.id);

  if (error) return alert(error.message);
  fetchTransactions();
}

// Reset form after update
function resetForm() {
  document.getElementById("transaction-form").reset();
  const btn = document.querySelector("#transaction-form button");
  btn.textContent = "Add";
  btn.onclick = null;
}
