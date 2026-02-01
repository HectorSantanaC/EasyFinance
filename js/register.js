document.addEventListener('DOMContentLoaded', function() {
  
  // Mostrar/ocultar contraseña
  const togglePasswordBtn = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  const togglePasswordIcon = document.getElementById('togglePasswordIcon');
  
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', function() {
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

  // Validar que las contraseñas coinciden
  const confirmPasswordInput = document.getElementById('confirmPassword');
  
  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', function() {
      if (passwordInput.value !== confirmPasswordInput.value) {
        confirmPasswordInput.setCustomValidity('Las contraseñas no coinciden');
      } else {
        confirmPasswordInput.setCustomValidity('');
      }
    });
  }

});

