
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
    import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
    import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js';

    const firebaseConfig = {
        apiKey: "AIzaSyBkaTBfuWHIRIT_nGFu6Fui5F39kcNblnE",
        authDomain: "tradealertprok.firebaseapp.com",
        projectId: "tradealertprok",
        storageBucket: "tradealertprok.appspot.com",
        messagingSenderId: "170112773594",
        appId: "1:170112773594:web:8c223ab2ceb0f30373a4e3",
        measurementId: "G-17R8L9915W"
    };

    // Initialize Firebase
    const firebaseApp = initializeApp(firebaseConfig);
    const auth = getAuth(firebaseApp);
    const database = getDatabase(firebaseApp);

    const loginForm = document.getElementById("loginForm");
    const getStartedBtn = document.getElementById("getStartedBtn");
    const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
    const helpBtn = document.getElementById("helpBtn");
    const welcomeMsg = document.getElementById("welcomeMsg");
    const userNameSpan = document.getElementById("userName");

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const emailOrMobile = document.getElementById("emailOrMobile").value;
        const password = document.getElementById("loginPassword").value;

        // Firebase Authentication
        signInWithEmailAndPassword(auth, emailOrMobile, password)
            .then((userCredential) => {
                const user = userCredential.user;

                // Check if user exists in the database
                const userRef = ref(database, 'users/' + user.uid);
                get(userRef).then((snapshot) => {
                    if (snapshot.exists()) {
                        const userData = snapshot.val();
                        welcomeMsg.style.display = "block";
                        userNameSpan.textContent = userData.firstName;  // You may need to adjust this based on your user data structure
                    } else {
                        // User not found in the database
                        alert("Get out from SITE!!!");
                    }
                });

                // Redirect to another page or perform other actions
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error(`Login failed: ${errorCode} - ${errorMessage}`);
            });
    });

    getStartedBtn.addEventListener("click", function () {
        // Redirect to the create account page or perform other actions
        window.location.href = "create-account.html";
    });

    function sendHelpEmail() {
        // Implement the logic to send help email
        // You may use a library like Email.js or an email API for this
        alert("Help email sent to vronlinehelpline@gmail.com");
    }

