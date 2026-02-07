document.addEventListener('DOMContentLoaded', function() {
  
  // ============================================
  // ELEMENTOS DEL FORMULARIO
  // ============================================

  const togglePasswordBtn = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  const togglePasswordIcon = document.getElementById('togglePasswordIcon');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const registerForm = document.querySelector('.needs-validation');

  // ============================================
  // MOSTRAR/OCULTAR CONTRASEÑA
  // ============================================
  
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

  // ============================================
  // VALIDAR QUE LAS CONTRASEÑAS COINCIDEN
  // ============================================
  
  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', function() {
      if (passwordInput.value !== confirmPasswordInput.value) {
        confirmPasswordInput.setCustomValidity('Las contraseñas no coinciden');
      } else {
        confirmPasswordInput.setCustomValidity('');
      }
    });

    // También validar cuando se cambia la contraseña principal
    passwordInput.addEventListener('input', function() {
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
  // VALIDACIÓN DEL FORMULARIO AL ENVIAR
  // ============================================
  
  if (registerForm) {
    registerForm.addEventListener('submit', function(event) {
      // Prevenir el envío por defecto
      event.preventDefault();
      event.stopPropagation();

      // Aplicar estilos de validación de Bootstrap
      registerForm.classList.add('was-validated');

      // Si el formulario es válido, permitir envío
      if (registerForm.checkValidity()) {
        console.log('Formulario válido - listo para enviar');
        // registerForm.submit();
      }
    });
  }

});
