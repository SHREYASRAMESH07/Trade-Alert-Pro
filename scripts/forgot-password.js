// Import Firebase SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.esm.js';
import { getAuth, sendPasswordResetEmail, fetchSignInMethodsForEmail } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.esm.js';

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

// DOM elements
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const emailOrPhoneInput = document.getElementById('emailOrPhone');

// Function to display a styled alert with a message
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;

    document.body.appendChild(alertDiv);

    // Remove the alert after 3 seconds
    setTimeout(() => {
        document.body.removeChild(alertDiv);
    }, 3000);
}

// Function to create a dialog box
function createDialog(title, content, callback) {
    const dialog = document.createElement('div');
    dialog.className = 'dialog';

    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    const dialogContent = document.createElement('div');
    dialogContent.className = 'dialog-content';

    const dialogTitle = document.createElement('h3');
    dialogTitle.textContent = title;

    const dialogText = document.createElement('p');
    dialogText.textContent = content;

    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.placeholder = 'Enter the code';
    
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.addEventListener('click', function() {
        const enteredCode = inputField.value;
        callback(enteredCode);
    });

    dialogContent.appendChild(dialogTitle);
    dialogContent.appendChild(dialogText);
    dialogContent.appendChild(inputField);
    dialogContent.appendChild(submitButton);

    dialog.appendChild(overlay);
    dialog.appendChild(dialogContent);

    document.body.appendChild(dialog);
}

// Function to handle password reset
async function handlePasswordReset(emailOrPhone) {
    try {
        // Check if the user with the provided email exists
        const methods = await fetchSignInMethodsForEmail(auth, emailOrPhone);

        if (methods.length === 0) {
            showAlert('Email not found. Please enter a valid email or phone number.', 'error');
            return;
        }

        // If the user exists, send a password reset email
        await sendPasswordResetEmail(auth, emailOrPhone);

        // Display a dialog box to enter the code sent to the email or phone
        createDialog('Enter Code', 'Please enter the code sent to your email or phone:', async function(enteredCode) {
            // Verify the entered code
            // This step may involve comparing the entered code with the one sent
            const isCodeValid = true; // Replace this with your code verification logic

            if (isCodeValid) {
                // If the code matches, update the password
                createDialog('Update Password', 'Enter your new password:', async function(newPassword) {
                    // Update the password in Firebase
                    // This step may involve calling the necessary Firebase functions to update the password

                    // Display a success alert
                    showAlert('Password reset successfully!', 'success');
                });
            } else {
                // If the code doesn't match, give one more chance to enter
                createDialog('Invalid Code', 'The entered code is invalid. Please try again:', async function(secondAttemptCode) {
                    // Verify the entered code again
                    const isSecondAttemptValid = true; // Replace this with your code verification logic

                    if (isSecondAttemptValid) {
                        // If the second attempt code matches, update the password
                        createDialog('Update Password', 'Enter your new password:', async function(newPassword) {
                            // Update the password in Firebase
                            // This step may involve calling the necessary Firebase functions to update the password

                            // Display a success alert
                            showAlert('Password reset successfully!', 'success');
                        });
                    } else {
                        // If still doesn't match, state unauthorized user
                        showAlert('Unauthorized user. Please contact support for assistance.', 'error');
                    }
                });
            }
        });
    } catch (error) {
        // Handle errors
        console.error('Password reset failed:', error.message);
        showAlert('Password reset failed. Please try again.', 'error');
    }
}

// Event listener for the form submission
forgotPasswordForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const emailOrPhone = emailOrPhoneInput.value;

    // Validate email or phone format before proceeding
    if (isValidEmailOrPhone(emailOrPhone)) {
        handlePasswordReset(emailOrPhone);
    } else {
        showAlert('Please enter a valid email or phone number.', 'error');
    }
});

// Function to validate email or phone format
function isValidEmailOrPhone(input) {
    // Implement your validation logic here
    // For simplicity, this example assumes a basic format check
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) || /^\d{10}$/.test(input);
}
