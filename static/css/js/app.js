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

// ---------------------------
// Specialization Field Toggle
// ---------------------------
document.addEventListener('DOMContentLoaded', () => {
    const doctorRadio = document.getElementById('doctorRole');
    const patientRadio = document.getElementById('patientRole');
    const specializationField = document.getElementById('specializationField');

    function toggleSpecializationField() {
        if (doctorRadio.checked) {
            specializationField.classList.remove('hidden');
        } else {
            specializationField.classList.add('hidden');
        }
    }

    // Initial check
    toggleSpecializationField();

    // Event listeners
    doctorRadio.addEventListener('change', toggleSpecializationField);
    patientRadio.addEventListener('change', toggleSpecializationField);
});

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
