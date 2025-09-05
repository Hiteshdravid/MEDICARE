// ---------------------------
// Flash Popup
// ---------------------------
document.addEventListener('DOMContentLoaded', () => {
    const flashPopup = document.querySelector('.flash-popup');
    if (flashPopup) {
        flashPopup.classList.add('show');
        setTimeout(() => {
            flashPopup.classList.remove('show');
            setTimeout(() => flashPopup.remove(), 500);
        }, 5000);
    }
});

// ---------------------------
// Password Toggle
// ---------------------------
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.querySelector('.password-toggle');
    const toggleIcon = toggleButton.querySelector('i');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'fas fa-eye';
    }

    toggleButton.style.transform = 'scale(0.9)';
    setTimeout(() => toggleButton.style.transform = 'scale(1)', 150);
}

// Attach the password toggle event listener outside the function
document.querySelector('.password-toggle').addEventListener('click', togglePassword);


// ---------------------------
// Toast Notifications
// ---------------------------
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="${getToastIcon(type)}"></i>${message}`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    }, 100);

    setTimeout(() => removeToast(toast), 4000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

function getToastIcon(type) {
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    return icons[type] || icons.info;
}

function removeToast(toast) {
    toast.style.transform = 'translateX(100%)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
}

// ---------------------------
// Form Animations
// ---------------------------
function animateFormFields() {
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        group.style.animationDelay = `${index * 0.1}s`;
        group.style.animation = 'fadeInUp 0.6s ease-out forwards';
    });
}

// ---------------------------
// Login Form Handling
// ---------------------------
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return; // Skip if login form not present

    const loginButton = document.querySelector('.login-button');
    animateFormFields();

    loginForm.addEventListener('submit', (e) => {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            e.preventDefault();
            showToast('Please fill in all required fields', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            e.preventDefault();
            showToast('Please enter a valid email address', 'error');
            return;
        }

        showLoadingState(loginButton);
    });
});

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showLoadingState(button) {
    button.disabled = true;
    button.classList.add('loading');
    const buttonText = button.querySelector('.button-text');
    const buttonIcon = button.querySelector('.button-icon');
    buttonText.textContent = 'Signing In...';
    if (buttonIcon) buttonIcon.style.display = 'none';
}

function hideLoadingState(button) {
    button.disabled = false;
    button.classList.remove('loading');
    const buttonText = button.querySelector('.button-text');
    const buttonIcon = button.querySelector('.button-icon');
    buttonText.textContent = 'Sign In';
    if (buttonIcon) buttonIcon.style.display = 'inline';
}

// ---------------------------
// Registration Form Handling + Specialization Toggle
// ---------------------------
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return; // Skip if registration form not present

    const registerButton = registerForm.querySelector('.login-button');
    const doctorRadio = document.getElementById('doctorRole');
    const patientRadio = document.getElementById('patientRole');
    const specializationField = document.getElementById('specializationField');
    const specializationInput = document.getElementById('specialization');

    animateFormFields();
    console.log("✅ JS Loaded");

    // ✅ Specialization toggle function (Updated to remove floating label behavior)
    function toggleSpecializationField() {
        if (doctorRadio.checked) {
            specializationField.classList.add('visible');
            specializationInput.required = true;
            // Optionally, add a placeholder if you're not using a floating label
            specializationInput.setAttribute('placeholder', 'Enter your specialization');
        } else {
            specializationField.classList.remove('visible');
            specializationInput.required = false;
            specializationInput.value = "";
            specializationInput.removeAttribute('placeholder'); // Remove placeholder when hidden
            // Ensure no floating label classes are left
            specializationField.classList.remove('focused', 'has-content'); 
        }
    }

    // Run once at start
    toggleSpecializationField();

    // Watch for role changes
    doctorRadio.addEventListener('change', toggleSpecializationField);
    patientRadio.addEventListener('change', toggleSpecializationField);

    // Removed the specialization floating label event listeners from here
    // as per your request. The label will now act as a standard placeholder.

    // ✅ Form submission validation
    registerForm.addEventListener('submit', (e) => {
        const fullName = document.getElementById('full_name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        // Basic validation
        if (!fullName || !email || !password) {
            e.preventDefault();
            showToast('Please fill in all required fields', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            e.preventDefault();
            showToast('Please enter a valid email address', 'error');
            return;
        }

        // Require specialization if doctor is selected
        if (doctorRadio.checked && !specializationInput.value.trim()) {
            e.preventDefault();
            showToast('Please enter your specialization', 'error');
            specializationInput.focus();
            return;
        }

        showLoadingState(registerButton);
    });
});
