async function signUp(email, password) {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    alert(error.message);
  } else {
    alert("Signup successful! Please check your email to confirm your account.");
    window.location.href = "login.html";
  }
}

async function login(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) alert(error.message);
  else window.location.href = "dashboard.html";
}

async function logout() {
  await supabase.auth.signOut();
  window.location.href = "login.html";
}
