async function fetchTransactions() {
  const user = (await supabase.auth.getUser()).data.user;
  const { data, error } = await supabase.from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const container = document.getElementById("transactions");
  container.innerHTML = "";
  data.forEach(t => {
    const div = document.createElement("div");
    div.textContent = `${t.type.toUpperCase()}: ₹${t.amount} (${t.category}) - ${t.note}`;
    container.appendChild(div);
  });
}

async function addTransactionForm() {
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  const category = document.getElementById("category").value;
  const note = document.getElementById("note").value;
  const user = (await supabase.auth.getUser()).data.user;

  const { error } = await supabase.from("transactions").insert([{
    user_id: user.id,
    amount, type, category, note
  }]);

  if (error) alert(error.message);
  else fetchTransactions();
}

fetchTransactions();