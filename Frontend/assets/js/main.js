let userPlans = [];

// CLEAN TOKEN (GLOBAL)
function cleanToken() {
  const token = localStorage.getItem("token");

  if (!token || token === "undefined" || token === "null") {
    localStorage.removeItem("token");
    return null;
  }

  return token;
}

// LOGIN CHECK (FINAL)
function isLoggedIn() {
  const token = cleanToken();
  return !!token;
}

const toggle = document.getElementById("theme-toggle");
const knob = toggle.nextElementSibling.nextElementSibling;

toggle.addEventListener("change", () => {
  document.documentElement.classList.toggle("dark");

  if (document.documentElement.classList.contains("dark")) {
    knob.textContent = "🌞";
  } else {
    knob.textContent = "🌙";
  }
});

// ==========================
// BLOG SECTION (FINAL 🔥)
// ==========================

document.addEventListener("DOMContentLoaded", async () => {
  

// ==========================
// PLAN SYNC SYSTEM
// ==========================


async function syncUserUI() {

  await fetchActivePlans(); // MUST LOAD FIRST

  //userPlans = [...userPlans]; // 🔥 force reactivity (IMPORTANT FIX)

  updateCardLabels();
  updateIntegrationLabels();

  highlightActivePlans(userPlans);
}

  const blogSection = document.getElementById("blogpagedetails");
  const blogCards = document.querySelector("#blog .grid");
  const details = document.querySelectorAll('[id^="detail"]');

  details.forEach(d => d.style.display = "none");

 
  // ==========================
  // FETCH USER PLANS (🔥 IMPORTANT1)
  // ==========================
 async function fetchActivePlans() {
  const token = cleanToken();

  if (!token) {
    userPlans = [];
    return [];
  }

  try {
    const res = await fetch("http://localhost:5000/api/pricing/me", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    const plans = data
      .filter(p => p.plan)
      .map(p => p.plan.toLowerCase());

    userPlans = plans;   // 🔥 ONLY HERE SET STATE

    return plans;

  } catch (err) {
    userPlans = [];
    return [];
  }
}

 // ==========================
  // PLAN HIERARCHY
  // ==========================
  const hierarchy = ["free","standard","advanced","premium","enterprise"];

function hasAccess(requiredPlan) {
  if (!userPlans.length) return false;

  const userMax = Math.max(...userPlans.map(p => hierarchy.indexOf(p)));
  const required = hierarchy.indexOf(requiredPlan);

  return userMax >= required;
}

  // ==========================
  // BLOG ACCESS RULES
  // ==========================
  const blogAccess = {
    detail1: "public",
    detail2: "login",
    detail3: "login",
    detail4: "free",
    detail5: "standard",
    detail6: "standard"
  };

  // ==========================
  // UPDATE LABELS
  // ==========================
  async function updateCardLabels(){

    

    const loggedIn = isLoggedIn();

    const cards = document.querySelectorAll("#blog .group");

    cards.forEach(card => {

      const btn = card.querySelector("button");
      const label = card.querySelector(".label-container");

      if(!btn || !label) return;

      const id = btn.getAttribute("onclick")?.match(/openDetail\('(.+)'\)/)?.[1];
      const access = blogAccess[id];

      let text = "";
      let color = "";

      // PUBLIC → NO LABEL
      if(access === "public"){
        label.innerHTML = "";
        return;
      }

      if (access === "login") {
  if (!loggedIn) {
    text = "🔒 Login Required";
    color = "bg-red-600";

    label.innerHTML = `<span class="text-white text-sm font-bold px-2 py-1 rounded ${color}">${text}</span>`;
    return;
  } else {
    label.innerHTML = ""; // ✅ CLEAR PROPERLY
    return;
  }
}

      // PLAN BASED
      if(["free","standard","advanced","premium","enterprise"].includes(access)){

        if(!loggedIn){
          text = `🔒 Login + ${access.toUpperCase()} or Upgrade Plan`;
          color = "bg-yellow-600";
        }

        else if(!hasAccess(access)){
          text = `🔒 ${access.toUpperCase()} or Upgrade Plan`;
          color = "bg-yellow-600";
        }

        else {
          // ✅ USER HAS ACCESS → REMOVE LABEL
          label.innerHTML = "";
          return;
        }

      }

      label.innerHTML = text
        ? `<span class="text-white text-sm font-bold px-2 py-1 rounded ${color}">${text}</span>`
        : "";

    });

  }

  await updateCardLabels();


  // ==========================
  // OPEN BLOG
  // ==========================
  window.openDetail = async function(id){

    

    const access = blogAccess[id];
    const loggedIn = isLoggedIn();

    // LOGIN REQUIRED
    if (!isLoggedIn() && access !== "public"){

      const modal = document.getElementById("authModal");

      if(modal){
        modal.classList.remove("hidden");
        modal.classList.add("flex");
      }

      return;
    }

    // PLAN CHECK
    if(["free","standard","advanced","premium","enterprise"].includes(access)){

      if(!hasAccess(access)){
        alert(`⚠️ ${access.toUpperCase()} plan required`);
        return;
      }

    }

    const detail = document.getElementById(id);
    if(!detail) return;

    blogCards.style.display = "none";
    details.forEach(d => d.style.display = "none");

    detail.style.display = "block";

    window.scrollTo({
      top: detail.offsetTop - 20,
      behavior: "auto"
    });

  }

  // ==========================
  // BACK
  // ==========================
  window.backToBlog = function(){

    details.forEach(d => d.style.display = "none");
    blogCards.style.display = "grid";

    updateCardLabels();

    window.scrollTo({
      top: blogSection.offsetTop - 20,
      behavior: "auto"
    });

  };


// ==========================
// INTEGRATION SECTION (FIXED ✅)
// ==========================

// ELEMENTS
const integrationSection = document.getElementById("integrationpagedetails");
const integrationCards = document.querySelector("#integrationpagedetails .grid");

const detailsIntegration = document.querySelectorAll(
  "#zoom,#slack,#docker,#github,#googlecloud,#kubernetes,#aws,#datadog,#salesforce"
);

// HIDE ALL DETAILS INITIALLY
detailsIntegration.forEach(detail => {
  detail.style.display = "none";
  detail.classList.add("hidden");
});


// ==========================
// ACCESS LEVEL
// ==========================
const integrationAccess = {
  zoom: "login",
  slack: "free",
  docker: "standard",
  github: "advanced",
  googlecloud: "advanced",
  kubernetes: "premium",
  datadog: "premium",
  aws: "enterprise",
  salesforce: "enterprise"
};

// ==========================
// LABELS (🔥 SAME AS BLOG)
// ==========================
async function updateIntegrationLabels() {

  // 🔥 use backend plans


  const loggedIn = isLoggedIn();

  const cards = document.querySelectorAll("#integrationpagedetails .group");

  cards.forEach(card => {

    const btn = card.querySelector("button");
    const label = card.querySelector(".label-container");

    if (!btn || !label) return;

    const id = btn.getAttribute("onclick")?.match(/'([^']+)'/)?.[1];
    const access = integrationAccess[id];

    let text = "";
    let color = "";

    // LOGIN REQUIRED
    if (access === "login" && !loggedIn) {
      text = "🔒 Login Required";
      color = "bg-red-600";

      label.innerHTML = `<span class="text-white text-sm font-bold px-2 py-1 rounded ${color}">${text}</span>`;
      return;
    }

    // PLAN BASED
    if (["free","standard","advanced","premium","enterprise"].includes(access)) {

      if (!loggedIn) {
        text = `🔒 Login + ${access.toUpperCase()} Plan Required`;
        color = "bg-yellow-600";
      }

      else if (!hasAccess(access)) {
        text = `🔒 ${access.toUpperCase()} Plan Required`;
        color = "bg-yellow-600";
      }

      else {
        // ✅ HAS ACCESS → REMOVE LABEL
        label.innerHTML = "";
        return;
      }
    }

    label.innerHTML = text
      ? `<span class="text-white text-sm font-bold px-2 py-1 rounded ${color}">${text}</span>`
      : "";

  });
}

// RUN LABELS
updateIntegrationLabels();

// ==========================
// OPEN DETAIL (🔥 FIXED)
// ==========================
window.openIntegrationDetail = async function(id){

  

  const access = integrationAccess[id];
  const loggedIn = isLoggedIn();

  // LOGIN REQUIRED
  if (!loggedIn && access !== "public") {

    const modal = document.getElementById("authModal");

    if(modal){
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }

    return;
  }

  // PLAN CHECK
  if (["free","standard","advanced","premium","enterprise"].includes(access)) {

    if (!hasAccess(access)) {
      alert(`⚠️ ${access.toUpperCase()} plan required`);
      return;
    }
  }

  const detail = document.getElementById(id);
  if(!detail) return;

  // HIDE CARDS
  integrationCards.style.display = "none";

  // HIDE ALL DETAILS
  detailsIntegration.forEach(d => {
    d.style.display = "none";
    d.classList.add("hidden");
  });

  // SHOW SELECTED
  detail.style.display = "block";
  detail.classList.remove("hidden");

  window.scrollTo({
    top: detail.offsetTop - 20,
    behavior: "auto"
  });
}

// ==========================
// BACK
// ==========================
window.backToIntegration = function(){

  detailsIntegration.forEach(d => {
    d.style.display = "none";
    d.classList.add("hidden");
  });

  integrationCards.style.display = "grid";

  updateIntegrationLabels();

  window.scrollTo({
    top: integrationSection.offsetTop - 20,
    behavior: "auto"
  });

};

// ==========================
// Subscribe form
// ==========================

const subscribeBtn = document.getElementById('subscribeBtn');
const emailInput = document.getElementById('subscribeEmail');
const messageEl = document.getElementById('subscribeMessage');
const countEl = document.getElementById('subscriberCount');

const API_URL_subscribe = "http://localhost:5000/api/subscribe";

// Fetch total subscriber count
async function fetchSubscriberCount() {
  try {
    const res = await fetch(`${API_URL_subscribe}/count`);
    const data = await res.json();
    countEl.textContent = `Total Subscribers: ${data.count || 0}`;
  } catch (err) {
    console.error("Failed to fetch subscriber count:", err);
  }
}

// Initial fetch on page load
fetchSubscriberCount();

let messageTimeout; // store timeout so we can clear it if needed

if (subscribeBtn && emailInput) {
  subscribeBtn.addEventListener('click', async function () {
    const email = emailInput.value.trim();

    // Clear previous timeout if exists
    if (messageTimeout) clearTimeout(messageTimeout);

    // Hide previous message and reset classes
    messageEl.classList.add('hidden');
    messageEl.classList.remove('text-green-400', 'text-red-400');

    // Validate input
    if (!email) {
      messageEl.textContent = "Please enter your email!";
      messageEl.classList.remove('hidden');
      messageEl.classList.add('text-red-400');
      messageTimeout = setTimeout(() => messageEl.classList.add('hidden'), 10000);
      return;
    }

    try {
      const res = await fetch(`${API_URL_subscribe}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      // Display success or error
      messageEl.textContent = data.message || (res.ok ? "Subscribed successfully!" : "Subscription failed!");
      messageEl.classList.remove('hidden');
      messageEl.classList.add(res.ok ? 'text-green-500' : 'text-red-500');

      // Clear input and update count on success
      if (res.ok) {
        emailInput.value = '';
        fetchSubscriberCount();
      }

      // Auto-hide message after 10 seconds
      messageTimeout = setTimeout(() => {
        messageEl.classList.add('hidden');
      }, 10000);
    } catch (err) {
      console.error(err);
      messageEl.textContent = "Something went wrong!";
      messageEl.classList.remove('hidden');
      messageEl.classList.add('text-red-400');
      messageTimeout = setTimeout(() => messageEl.classList.add('hidden'), 10000);
    }
  });
}

// =====================================================
// AUTH MODAL + BUTTONS (UPDATED SLIDER VERSION)
// =====================================================

const API_URL_SIGNIN = "http://localhost:5000/api/auth/signin";
const API_URL_SIGNUP = "http://localhost:5000/api/auth/signup";
const API_URL_FORGOT_RESET = "http://localhost:5000/api/auth/forgot-reset";

const signsignupBtn = document.getElementById('signsignupBtn');
const signoutBtn = document.getElementById('signoutBtn');


// ==========================
// PROFILE DROPDOWN
// ==========================
const profileBtn = document.getElementById("profileBtn");
const profileDropdown = document.getElementById("profileDropdown");
const dropdownSignout = document.getElementById("dropdownSignout");

// TOGGLE DROPDOWN
profileBtn?.addEventListener("click", () => {
  profileDropdown.classList.toggle("hidden");
});

// CLOSE WHEN CLICK OUTSIDE
document.addEventListener("click", (e) => {
  if (!profileBtn?.contains(e.target) && !profileDropdown?.contains(e.target)) {
    profileDropdown?.classList.add("hidden");
  }
});

// DROPDOWN SIGNOUT
dropdownSignout?.addEventListener("click", authLogout);


const authModal = document.getElementById('authModal');
const closeAuthBtn = document.getElementById('closeAuthModal');

const signin = document.getElementById("signin");
const signup = document.getElementById("signup");
const forgot = document.getElementById("forgot");

const signinForm = document.getElementById("signinForm");
const signupForm = document.getElementById("signupForm");
const forgotForm = document.getElementById("forgotResetForm");

const forgotEmail = document.getElementById("forgotEmail");
const forgotOTP = document.getElementById("forgotOTP");
const forgotNewPassword = document.getElementById("forgotNewPassword");
const forgotResetBtn = document.getElementById("forgotResetBtn");

const welcomeTitle = document.getElementById("welcomeTitle");
const welcomeText = document.getElementById("welcomeText");

let otpStep = false;


// =====================================================
// PANEL SLIDER (SMOOTH)
// =====================================================

function slideTo(panelIndex) {

  const slider = document.getElementById("formSlider");
  if (!slider) return;

  slider.style.transform = `translateX(-${panelIndex * 100}%)`;

  updateWelcome(panelIndex);

}

window.showSignin = () => slideTo(0);
window.showSignup = () => slideTo(1);
window.showForgot = () => slideTo(2);


// =====================================================
// WELCOME PANEL TEXT CONTROL
// =====================================================

function updateWelcome(panelIndex){

  if(!welcomeTitle || !welcomeText) return;

  if(panelIndex === 0){
    welcomeTitle.innerText = "Welcome Back";
    welcomeText.innerText = "Login to continue your journey";
  }

  if(panelIndex === 1){
    welcomeTitle.innerText = "Join PrimeCloud";
    welcomeText.innerText = "Create your account to get started";
  }

  if(panelIndex === 2){
    welcomeTitle.innerText = "Forgot Password";
    welcomeText.innerText = "Enter your email to reset your password";
  }

}


// =====================================================
// FORM RESET FUNCTION
// =====================================================

function resetForms(){

  signinForm?.reset();
  signupForm?.reset();
  forgotForm?.reset();

  if(forgotOTP) forgotOTP.classList.add("hidden");
  if(forgotNewPassword) forgotNewPassword.classList.add("hidden");

  if(forgotResetBtn) forgotResetBtn.textContent = "Send OTP";

  otpStep = false;

}


// =====================================================
// MODAL CONTROL
// =====================================================

if (signsignupBtn) {
  signsignupBtn.addEventListener("click", () => {

    resetForms();

    authModal.classList.remove("hidden");
    showSignin();

  });
}

if (closeAuthBtn) {
  closeAuthBtn.addEventListener("click", () => {

    authModal.classList.add("hidden");
    resetForms();

  });
}

if (authModal) {
  authModal.addEventListener("click", (e) => {

    if (e.target === authModal){
      authModal.classList.add("hidden");
      resetForms();
    }

  });
}


// =====================================================
// AUTH LOGIN / LOGOUT
// =====================================================

async function authLogin(token, user) {

  localStorage.setItem('token', token);

  // ✅ STORE USER DATA
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  // ❌ OLD BUTTONS HIDE
  if (signsignupBtn) signsignupBtn.classList.add('hidden');
  if (signoutBtn) signoutBtn.classList.add('hidden');

  // ✅ SHOW PROFILE ICON
  document.getElementById("profileContainer")?.classList.remove("hidden");

  // ✅ SET USER DATA IN DROPDOWN
  const storedUser = user || JSON.parse(localStorage.getItem("user") || "{}");

  document.getElementById("userName").textContent = storedUser.fullName || "User";
  document.getElementById("userEmail").textContent = storedUser.email || "";

  if (authModal) authModal.classList.add('hidden');

  resetForms();

  setTimeout(async () => {
    await syncUserUI();
  }, 0);
}

function authLogout() {
  const confirmLogout = confirm("Are you sure you want to sign out?");
  if (!confirmLogout) return;

  // ✅ clear only required things (not full clear)
  localStorage.removeItem("token");
  localStorage.removeItem("plan");

  userPlans = [];


   // ✅ REMOVE USER ALSO
localStorage.removeItem("user");

// ❌ HIDE PROFILE
document.getElementById("profileContainer")?.classList.add("hidden");


  if (signsignupBtn) signsignupBtn.classList.remove('hidden');
  if (signoutBtn) signoutBtn.classList.add('hidden');



  resetForms();
  resetPlansUI();

  // 🔥 update UI everywhere
  updateCardLabels();
  updateIntegrationLabels();
}



// =====================================================
// SIGNIN
// =====================================================

if (signin) {

  const signinBtn = signin.querySelector("button");

  signinBtn.addEventListener("click", async (e) => {

    e.preventDefault();

    const email = signin.querySelector("input[type='email']").value.trim();
    const password = signin.querySelector("input[type='password']").value.trim();

    if (!email || !password) return alert("Please fill all fields");

    try {

      const res = await fetch(API_URL_SIGNIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert("Signin successful ✅");

     authLogin(data.token, data.user);

    } catch (err) {

      alert(err.message);

    }

  });

}


// =====================================================
// SIGNUP
// =====================================================

if (signup) {

  const signupBtn = signup.querySelector("button");

  signupBtn.addEventListener("click", async (e) => {

    e.preventDefault();

    const fullName = signup.querySelector("input[placeholder='Full Name']").value.trim();
    const email = signup.querySelector("input[placeholder='Email Address']").value.trim();
    const password = signup.querySelector("input[placeholder='Password']").value.trim();
    const confirmPassword = signup.querySelector("input[placeholder='Confirm Password']").value.trim();

    if (!fullName || !email || !password || !confirmPassword)
      return alert("Please fill all fields");

    if (password !== confirmPassword)
      return alert("Passwords do not match");

    try {

      const res = await fetch(API_URL_SIGNUP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, confirmPassword })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert("Account created successfully ✅");

      resetForms();
      showSignin();

    } catch (err) {

      alert(err.message);

    }

  });

}





if (forgotResetBtn) {

  forgotResetBtn.addEventListener("click", async (e) => {

    e.preventDefault();

    const email = forgotEmail.value.trim();

    if (!otpStep) {

      if (!email)
        return alert("Enter your email");

      try {

        const res = await fetch(API_URL_FORGOT_RESET, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        alert("OTP sent to your email 📧");

        forgotOTP.classList.remove("hidden");
        forgotNewPassword.classList.remove("hidden");

        forgotResetBtn.textContent = "Reset Password";

        otpStep = true;

      } catch (err) {
        alert(err.message);
      }

    } else {

      const otp = forgotOTP.value.trim();
      const newPassword = forgotNewPassword.value.trim();

      if (!otp || !newPassword)
        return alert("Enter OTP and new password");

      try {

        const res = await fetch(API_URL_FORGOT_RESET, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, newPassword })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        alert("Password reset successful ✅");

        otpStep = false;

        forgotOTP.classList.add("hidden");
        forgotNewPassword.classList.add("hidden");

        forgotEmail.value = "";
        forgotOTP.value = "";
        forgotNewPassword.value = "";

        forgotResetBtn.textContent = "Send OTP";

        // instantly move to signin
        showSignin();

      } catch (err) {
        alert(err.message);
      }

    }

  });

}



// =====================================================
// SIGNOUT
// =====================================================

if (signoutBtn) signoutBtn.addEventListener("click", authLogout);


// =====================================================
// MOBILE MENU TOGGLE
// =====================================================

const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");

if (menuBtn && navMenu) {

  menuBtn.addEventListener("click", () => {

    navMenu.classList.toggle("hidden");

  });

}


// Close mobile menu when clicking links

const navLinks = document.querySelectorAll("#navMenu a");

navLinks.forEach(link => {

  link.addEventListener("click", () => {

    if (window.innerWidth < 1024)
      navMenu.classList.add("hidden");

  });

});

  // =====================================================
  // HERO BACKGROUND SLIDER
  // =====================================================
  const slides = document.querySelectorAll('#hero-bg-slider img');
  if (slides.length > 0) {
    let current = 0;
    setInterval(() => {
      slides[current].classList.remove('opacity-100');
      slides[current].classList.add('opacity-0');
      current = (current + 1) % slides.length;
      slides[current].classList.remove('opacity-0');
      slides[current].classList.add('opacity-100');
    }, 3000);
  }
// =====================================================
// DEMO VIDEO MODAL
// =====================================================
const watchDemoBtn = document.getElementById('watch-demo-btn');
const videoOverlay = document.getElementById('video-overlay');
const closeVideoBtn = document.getElementById('close-video');
const videoModal = document.getElementById('video-modal');
const iframe = document.getElementById('demo-video');

if (watchDemoBtn && videoOverlay && closeVideoBtn && iframe && videoModal) {

  // OPEN MODAL
  watchDemoBtn.addEventListener('click', () => {

    videoOverlay.classList.remove('opacity-0','pointer-events-none');
    videoOverlay.classList.add('opacity-100');

    setTimeout(() => {
      videoModal.classList.remove('scale-90','opacity-0');
      videoModal.classList.add('scale-100','opacity-100');
    }, 50);

    iframe.src += "&autoplay=1";

  });

  // CLOSE BUTTON
  closeVideoBtn.addEventListener('click', closeVideo);

  // CLOSE WHEN CLICK OUTSIDE
  videoOverlay.addEventListener('click',(e)=>{
    if(e.target === videoOverlay){
      closeVideo();
    }
  });

  // ESC KEY CLOSE
  document.addEventListener("keydown",(e)=>{
    if(e.key === "Escape"){
      closeVideo();
    }
  });

  function closeVideo(){

    videoModal.classList.remove('scale-100','opacity-100');
    videoModal.classList.add('scale-90','opacity-0');

    setTimeout(()=>{
      videoOverlay.classList.remove('opacity-100');
      videoOverlay.classList.add('opacity-0','pointer-events-none');

      const src = iframe.src;
      iframe.src = src.replace("&autoplay=1","");

    },250);

  }

}


// ================================
// PRICING + RAZORPAY (FINAL CLEAN)
// ================================

const API_BASE = "http://localhost:5000/api";
const buttons = document.querySelectorAll(".pay-btn");
const getStartedBtn = document.querySelector("#getStartedBtn");

let isProcessing = false;


// ================================
// UPDATE UI
// ================================
function highlightActivePlans(activePlans = []) {
  buttons.forEach(btn => {
    const plan = btn.dataset.plan?.toLowerCase();
    const card = btn.closest("div[class*='bg-']");
    if (!card) return;

    let badge = card.querySelector(".active-badge");

    if (!badge) {
      badge = document.createElement("span");
      badge.textContent = "Active";
      badge.className =
        "active-badge text-white bg-green-500 px-3 py-1 rounded-full self-start mb-3";
      card.prepend(badge);
    }

    if (activePlans.includes(plan)) {
      badge.classList.remove("hidden");

      btn.disabled = true;
      btn.textContent = "Active";

      btn.classList.remove("from-orange-400", "to-yellow-400");
      btn.classList.add("bg-gray-400", "cursor-not-allowed");
    } else {
      badge.classList.add("hidden");

      btn.disabled = false;
      btn.textContent = "Get Started";

      btn.classList.add("from-orange-400", "to-yellow-400");
      btn.classList.remove("bg-gray-400", "cursor-not-allowed");
    }
  });
}

// ================================
// RESET UI (VERY IMPORTANT 🔥)
// ================================
function resetPlansUI() {
  buttons.forEach(btn => {
    const card = btn.closest("div[class*='bg-']");
    if (!card) return;

    const badge = card.querySelector(".active-badge");

    badge?.classList.add("hidden");

    btn.disabled = false;
    btn.textContent = "Get Started";

    btn.classList.add("from-orange-400", "to-yellow-400");
    btn.classList.remove("bg-gray-400", "cursor-not-allowed");
  });
}

// ================================
// BUTTON CLICK HANDLER
// ================================
buttons.forEach(btn => {
  btn.addEventListener("click", async e => {
    e.preventDefault();

    if (isProcessing) return;
    isProcessing = true;


    const token = cleanToken();

    if (!token) {
        alert("Please login first to continue");
        isProcessing = false;
        return;
      }


    const plan = (btn.dataset.plan || "").toLowerCase();
    const amount = Number(btn.dataset.month) || 0;

    try {
      // 🔥 check already active
      const currentPlans = await fetchActivePlans();
      if (currentPlans.includes(plan)) {
        isProcessing = false;
        return;
      }

      // ================================
      // FREE PLAN
      // ================================
      if (plan === "free" || amount === 0) {
        const res = await fetch(`${API_BASE}/pricing/free`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
             Authorization: `Bearer ${cleanToken()}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          alert("Free plan activated 🎉");

          const updatedPlans = await fetchActivePlans();
          highlightActivePlans(updatedPlans);
          
            userPlans = updatedPlans;
            updateCardLabels();
            updateIntegrationLabels();

        } 
        else {
          alert(data.message || "Failed to activate free plan");
        }

        isProcessing = false;
        return;
      }

      // ================================
      // RAZORPAY FLOW
      // ================================
      const orderRes = await fetch(`${API_BASE}/pricing/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanToken()}`,
        },
        body: JSON.stringify({ amount }),
      });

      if (!orderRes.ok) {
        alert("Order creation failed");
        isProcessing = false;
        return;
      }

      const order = await orderRes.json();

      const rzp = new Razorpay({
        key: "rzp_test_SpzbKMDY3dawF0",
        amount: order.amount,
        currency: "INR",
        name: "PrimeCloud",
        description: `${plan} plan`,
        order_id: order.id,

        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_BASE}/pricing/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${cleanToken()}`,
              },
              body: JSON.stringify({ ...response, plan, amount }),
            });

            const data = await verifyRes.json();

            if (verifyRes.ok) {
              alert("Payment successful 🚀");

              const updatedPlans = await fetchActivePlans();
              highlightActivePlans(updatedPlans);

                userPlans = updatedPlans;
                updateCardLabels();
                updateIntegrationLabels();

            } else {
              alert(data.message || "Payment verification failed");
            }
          } catch (err) {
            console.error(err);
            alert("Verification error");
          }

          isProcessing = false;
        },

        modal: {
          ondismiss: function () {
            isProcessing = false;
          },
        },

        prefill: {
          name: "User",
          email: "user@email.com",
          contact: "9618844132",
        },

        theme: { color: "#f97316" },
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
      isProcessing = false;
    }
  });
});

// ================================
// GET STARTED BUTTON
// ================================
if (getStartedBtn) {
  getStartedBtn.addEventListener("click", e => {

 const token = cleanToken();

if (!token) {
  alert("Please login first to continue");
  isProcessing = false;
  return;
}
  });
}

// connect logout button
document.getElementById("logoutBtn")?.addEventListener("click", authLogout);

// =====================================================
  // TESTIMONIAL SLIDER
  // =====================================================
  const track = document.getElementById("sliderTrack");
  const dotsContainer = document.getElementById("dots");

  if (track && dotsContainer) {
    const cards = track.children;
    let index = 0;
    let autoSlide;

    function cardsPerSlide() {
      return window.innerWidth < 768 ? 1 : 2;
    }

    function totalSlides() {
      return Math.ceil(cards.length / cardsPerSlide());
    }

    function createDots() {
      dotsContainer.innerHTML = "";
      for (let i = 0; i < totalSlides(); i++) {
        const dot = document.createElement("button");
        dot.className = "w-3 h-3 rounded-full transition " + (i === index ? "bg-orange-400" : "bg-slate-500");
        dot.onclick = () => { index = i; updateSlider(); resetAutoSlide(); };
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      [...dotsContainer.children].forEach((dot, i) => {
        dot.classList.toggle("bg-orange-400", i === index);
        dot.classList.toggle("bg-slate-500", i !== index);
      });
    }

    function updateSlider() {
      track.style.transform = `translateX(-${index * 100}%)`;
      updateDots();
    }

    function nextSlide() {
      index = (index + 1) % totalSlides();
      updateSlider();
    }

    function prevSlide() {
      index = (index - 1 + totalSlides()) % totalSlides();
      updateSlider();
    }

    function resetAutoSlide() {
      clearInterval(autoSlide);
      autoSlide = setInterval(nextSlide, 8000);
    }

    window.addEventListener("resize", () => {
      index = 0;
      createDots();
      updateSlider();
    });

    createDots();
    updateSlider();
    autoSlide = setInterval(nextSlide, 8000);

    // Make arrows work globally
    window.nextSlide = nextSlide;
    window.prevSlide = prevSlide;
  }

  // =====================================================
// FAQ SECTION
// =====================================================
const faqItems = document.querySelectorAll(".faq-item");
const searchInput = document.getElementById("searchInput");
const categoryButtons = document.querySelectorAll(".category-btn");

// Create "No records found" message
let noRecordMsg = document.createElement("p");
noRecordMsg.textContent = "No records found";
noRecordMsg.className = "text-center text-red-500 font-semibold mt-6 bg-red-100 border border-red-400 px-4 py-2 rounded-lg shadow-md";
noRecordMsg.style.display = "none";
searchInput.parentNode.after(noRecordMsg); // insert after search input

// Accordion
faqItems.forEach(item => {
  const btn = item.querySelector(".faq-question");
  const answer = item.querySelector(".faq-answer");
  const arrow = item.querySelector(".arrow");

  btn.addEventListener("click", () => {
    const open = answer.classList.contains("max-h-[600px]");
    faqItems.forEach(i => {
      i.querySelector(".faq-answer").classList.remove("max-h-[600px]");
      i.querySelector(".faq-answer").classList.add("max-h-0");
      i.querySelector(".arrow").classList.remove("rotate-90");
    });
    if (!open) {
      answer.classList.remove("max-h-0");
      answer.classList.add("max-h-[600px]");
      arrow.classList.add("rotate-90");
    }
  });
});

// Category filter
categoryButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    categoryButtons.forEach(b => {
      b.classList.remove(
        "bg-teal-700","text-white",
        "bg-gradient-to-r","from-orange-400","to-yellow-400","text-gray-900"
      );
      b.classList.add("bg-slate-800","text-gray-300");
    });

    if (btn.dataset.category === "all") {
      btn.classList.remove("bg-slate-800","text-gray-300");
      btn.classList.add("bg-gradient-to-r","from-orange-400","to-yellow-400","text-gray-900","font-semibold");
    } else {
      btn.classList.remove("bg-slate-800","text-gray-300");
      btn.classList.add("bg-teal-700","text-white");
    }

    const cat = btn.dataset.category;
    let anyVisible = false;
    faqItems.forEach(item => {
      const match = cat === "all" || item.dataset.category === cat;
      item.style.display = match ? "block" : "none";
      if(match) anyVisible = true;
    });

    noRecordMsg.style.display = anyVisible ? "none" : "block";
  });
});

// FAQ Search
if (searchInput) {
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase();
    let anyVisible = false;

    faqItems.forEach(item => {
      const qt = item.querySelector(".question-text");
      const at = item.querySelector(".answer-text");
      qt.innerHTML = qt.textContent;
      at.innerHTML = at.textContent;

      const text = (qt.textContent + " " + at.textContent).toLowerCase();
      if (text.includes(q)) {
        item.style.display = "block";
        anyVisible = true;
        if (q) {
          const r = new RegExp(`(${q})`, "gi");
          qt.innerHTML = qt.textContent.replace(r, "<mark class='bg-yellow-300 text-black px-1 rounded'>$1</mark>");
          at.innerHTML = at.textContent.replace(r, "<mark class='bg-yellow-300 text-black px-1 rounded'>$1</mark>");
        }
      } else {
        item.style.display = "none";
      }
    });

    noRecordMsg.style.display = anyVisible ? "none" : "block";
  });
}

// =====================================================
  // CONTACT FORM
  // =====================================================
  
  const API_URL_CONTACT = "http://localhost:5000/api/contact";

  const countrySelect = document.getElementById('countrySelect');
  const phoneInput = document.getElementById('phoneInput');
  const form = document.getElementById("contactForm");

  const countryCodes = {
    "India": "+91",
    "United Kingdom": "+44",
    "France": "+33",
    "Singapore": "+65",
    "United States": "+1",
    "Germany": "+49",
    "Australia": "+61"
  };

  if (countrySelect && phoneInput && form) {
    countrySelect.addEventListener('change', () => {
      const code = countryCodes[countrySelect.value] || "";
      phoneInput.value = code + " ";
    });

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const firstName = form.querySelector("input[placeholder='First Name *']").value.trim();
      const lastName = form.querySelector("input[placeholder='Last Name *']").value.trim();
      const email = form.querySelector("input[type='email']").value.trim();
      const educationOrJobRole = form.querySelector("input[placeholder='Education / Job Role']").value.trim();
      const phone = phoneInput.value.trim();
      const message = form.querySelector("textarea").value.trim();

      if (!firstName || !lastName || !email || !message || !phone) {
        alert("Please fill all required fields.");
        return;
      }

      try {
        const res = await fetch(API_URL_CONTACT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            educationOrJobRole,
            countryCode: countryCodes[countrySelect.value] || "",
            phone,
            message
          })
        });

        const data = await res.json();

        if (res.ok) {
          alert(data.message || "Message sent successfully!");
          form.reset();
        } else {
          alert(data.message || "Failed to send message.");
        }
      } catch (error) {
        console.error(error);
        alert("Server error. Please try again later.");
      }
    });
  }

  // =====================================================
  // INTEGRATION PAGE ROUTING
  // =====================================================
  function renderPage() {
    const hash = location.hash.replace('#', '');
    const cards = document.getElementById('integration-cards');
    const tools = document.getElementById('tool-details');

    if (!cards || !tools) return;

    const sections = tools.querySelectorAll('section');

    if (!hash) {
      cards.classList.remove('hidden');
      tools.classList.add('hidden');
      return;
    }

    cards.classList.add('hidden');
    tools.classList.remove('hidden');

    sections.forEach(s => s.classList.add('hidden'));

    const active = document.getElementById(hash);
    if (active) active.classList.remove('hidden');

    const title = document.getElementById('tool-title');
    if (title) title.textContent = hash.charAt(0).toUpperCase() + hash.slice(1) + ' Integration';
  }

  window.addEventListener('load', renderPage);
  window.addEventListener('hashchange', renderPage);


  const token = cleanToken();

if (!token) {
  userPlans = [];
  resetPlansUI();
  updateCardLabels();
  updateIntegrationLabels();
  return;
}

const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

document.getElementById("profileContainer")?.classList.remove("hidden");
signsignupBtn?.classList.add("hidden");

document.getElementById("userName").textContent = storedUser.fullName || "User";
document.getElementById("userEmail").textContent = storedUser.email || "";

await syncUserUI();

}); // END DOMContentLoaded

// =====================================================
// ✅ GLOBAL goBack FUNCTION
// =====================================================
window.goBack = function () {
  history.replaceState(null, null, window.location.pathname);

  const cards = document.getElementById('integration-cards');
  const tools = document.getElementById('tool-details');

  if (cards && tools) {
    cards.classList.remove('hidden');
    tools.classList.add('hidden');
  }
};