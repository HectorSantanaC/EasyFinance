document.addEventListener('DOMContentLoaded', function () {

  // ============================================
  // ELEMENTOS DEL FORMULARIO
  // ============================================
  const togglePasswordBtn = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  const togglePasswordIcon = document.getElementById('togglePasswordIcon');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const registerForm = document.querySelector('.needs-validation');
  const submitBtn = registerForm ? registerForm.querySelector('button[type="submit"]') : null;

  // ============================================
  // MOSTRAR/OCULTAR CONTRASEÑA
  // ============================================
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', function () {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;

      // Cambiar icono
      if (type === 'text') {
        togglePasswordIcon.classList.remove('bi-eye');
        togglePasswordIcon.classList.add('bi-eye-slash');
      } else {
        togglePasswordIcon.classList.remove('bi-eye-slash');
        togglePasswordIcon.classList.add('bi-eye');
      }
    });
  }

  // ============================================
  // VALIDAR QUE LAS CONTRASEÑAS COINCIDEN
  // ============================================
  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', function () {
      if (passwordInput.value !== confirmPasswordInput.value) {
        confirmPasswordInput.setCustomValidity('Las contraseñas no coinciden');
      } else {
        confirmPasswordInput.setCustomValidity('');
      }
    });

    // Validar cuando se cambia la contraseña principal
    passwordInput.addEventListener('input', function () {
      if (confirmPasswordInput.value !== '') {
        if (passwordInput.value !== confirmPasswordInput.value) {
          confirmPasswordInput.setCustomValidity('Las contraseñas no coinciden');
        } else {
          confirmPasswordInput.setCustomValidity('');
        }
      }
    });
  }

  // ============================================
  // LOADING VISUAL
  // ============================================
  if (registerForm) {
    registerForm.addEventListener('submit', function (event) {

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Registrando...';
      }
    });
  }

  // ============================================
  // INICIALIZAR BOOTSTRAP ALERTS
  // ============================================
  setTimeout(() => {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
      if (!alert.classList.contains('show')) {
        alert.classList.add('show');
      }
    });
  }, 100);

});
