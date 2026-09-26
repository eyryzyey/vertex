/* ============ Farjni Login — script.js ============ */
(() => {
  "use strict";

  // Already logged in? Go straight to dashboard.
  if (localStorage.getItem("farjni_session")) {
    window.location.replace("dashboard.html");
    return;
  }

  const $ = (s, c = document) => c.querySelector(s);

  const loginForm = $("#loginForm");
  const alertBox = $("#formAlert");    /* show / hide password */   $$(".toggle-pass").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = $("#" + btn.dataset.target);       const icon = btn.querySelector("i");       const showing = input.type === "text";       input.type = showing ? "password" : "text";       icon.className = showing ? "bx bx-show" : "bx bx-hide";     });   });   function $$(s, c) { return [...c.querySelectorAll(s)]; }

  const setError = (input, msg) => {
    const box = input.closest(".input-box");
    const err = $(`.error-msg[data-for="${input.id}"]`);
    box.classList.add("invalid"); box.classList.remove("valid");
    if (err) { err.textContent = msg; err.classList.add("show"); }
  };
  const setValid = (input) => {
    const box = input.closest(".input-box");
    const err = $(`.error-msg[data-for="${input.id}"]`);
    box.classList.remove("invalid"); box.classList.add("valid");
    if (err) { err.textContent = ""; err.classList.remove("show"); }
  };
  const showAlert = (type, msg) => {
    alertBox.className = "form-alert " + type;
    alertBox.textContent = msg;
  };

  const validators = {
    username: (v) => (v.trim().length >= 3 ? "" : "Username must be at least 3 characters"),
    password: (v) => (v.length >= 6 ? "" : "Password must be at least 6 characters"),
  };
  const validateField = (input) => {
    const kind = input.type === "password" ? "password" : "username";
    const msg = validators[kind](input.value);
    msg ? setError(input, msg) : setValid(input);
    return !msg;
  };

  $$("input", loginForm).forEach((input) => {
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("input", () => {
      if (input.closest(".input-box").classList.contains("invalid")) validateField(input);
    });
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const user = $("#loginUsername"), pass = $("#loginPassword");
    const ok = [validateField(user), validateField(pass)].every(Boolean);
    if (!ok) return;

    // ضع اسم المستخدم وكلمة المرور الخاصة بالأدمن هنا:
    const adminUser = "admin";
    const adminPass = "123456";

    if (user.value.trim() !== adminUser || pass.value !== adminPass) {
      showAlert("error", "Invalid username or password!");
      return;
    }

    const btn = $(".btn-submit", loginForm);
    btn.disabled = true;
    btn.classList.add("loading");

    setTimeout(() => {
      const session = {
        username: user.value.trim(),
        loginAt: new Date().toISOString(),
      };
      localStorage.setItem("farjni_session", JSON.stringify(session));
      showAlert("success", "✅ Login successful! Redirecting to dashboard…");
      setTimeout(() => { window.location.href = "dashboard.html"; }, 900);
    }, 1200);
  });
})();
