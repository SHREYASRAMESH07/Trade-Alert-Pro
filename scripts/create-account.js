

        import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
        import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
        import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js';

        // Initialize Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyBkaTBfuWHIRIT_nGFu6Fui5F39kcNblnE",
            authDomain: "tradealertprok.firebaseapp.com",
            projectId: "tradealertprok",
            storageBucket: "tradealertprok.appspot.com",
            messagingSenderId: "170112773594",
            appId: "1:170112773594:web:8c223ab2ceb0f30373a4e3",
            measurementId: "G-17R8L9915W"
        };

        const firebaseApp = initializeApp(firebaseConfig);
        const auth = getAuth(firebaseApp);
        const database = getDatabase(firebaseApp);

        // DOM elements
        const loginForm = document.getElementById("loginForm");
        const getStartedBtn = document.getElementById("getStartedBtn");
        const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
        const helpBtn = document.getElementById("helpBtn");
        const welcomeMsg = document.getElementById("welcomeMsg");
        const userNameSpan = document.getElementById("userName");
        const errorMessageDiv = document.getElementById("errorMessage");

        // Submit event listener for the login form
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const emailOrMobile = document.getElementById("emailOrMobile").value;
            const password = document.getElementById("loginPassword").value;

            try {
                // Firebase Authentication
                const userCredential = await signInWithEmailAndPassword(auth, emailOrMobile, password);
                const user = userCredential.user;

                // Check if user exists in the database
                const userRef = ref(database, 'users/' + user.uid);
                const snapshot = await get(userRef);

                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    welcomeMsg.style.display = "block";
                    userNameSpan.textContent = userData.firstName;  // Adjust based on your user data structure
                    errorMessageDiv.style.display = "none";

                    window.location.href = "dashboard.html";
                } else {
                    // User not found in the database
                    errorMessageDiv.textContent = "User not found in the database";
                    errorMessageDiv.style.display = "block";
                }
            } catch (error) {
                // Handle login errors
                errorMessageDiv.textContent = `Login failed: ${error.message}`;
                errorMessageDiv.style.display = "block";
            }
        });

        // Click event listener for the "Get Started" button
        getStartedBtn.addEventListener("click", function () {
            // Redirect to the create account page or perform other actions
            window.location.href = "create-account.html";
        });

        // Click event listener for the "Forgot Password" button
        forgotPasswordBtn.addEventListener("click", function () {
            // Redirect to the forgot password page or perform other actions
            window.location.href = "forgot-password.html";
        });
        // Function to send a help email
        function sendHelpEmail() {
            // Implement the logic to send help email
            // You may use a library like Email.js or an email API for this
            alert("Help email sent to vronlinehelpline@gmail.com");
        }
        function showErrorMessage(message) {
            errorMessageDiv.textContent = message;
            errorMessageDiv.style.display = "block";
        }