document.addEventListener('DOMContentLoaded', function() {
  
  // ============================================
  // MOSTRAR/OCULTAR CONTRASEÑA
  // ============================================
  
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

  // ============================================
  // VALIDACIÓN DEL FORMULARIO
  // ============================================
  
  const loginForm = document.querySelector('.needs-validation');
  
  if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
      if (!loginForm.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      loginForm.classList.add('was-validated');
    });
  }

});
