document.addEventListener('DOMContentLoaded', function() {
  
  // ============================================
  // ELEMENTOS DEL FORMULARIO
  // ============================================

  const togglePasswordBtn = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');
  const togglePasswordIcon = document.getElementById('togglePasswordIcon');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const registerForm = document.querySelector('.needs-validation');
  const submitBtn = registerForm ? registerForm.querySelector('button[type="submit"]') : null;  // ← CORREGIDO: Definir aquí con verificación

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
  // ENVÍO AJAX DEL FORMULARIO
  // ============================================
  
  if (registerForm) {
    registerForm.addEventListener('submit', function(event) {
      // Prevenir el envío por defecto
      event.preventDefault();
      event.stopPropagation();

      // Aplicar estilos de validación de Bootstrap
      registerForm.classList.add('was-validated');

      // Si el formulario es válido, enviar vía AJAX
      if (registerForm.checkValidity()) {
        
        // Deshabilitar botón y mostrar loading (ahora seguro)
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Registrando...';
        }

        // Recoger datos del formulario (incluye CSRF token)
        const formData = new FormData(registerForm);
        
        // Enviar al endpoint de registro
        fetch('/register', {
          method: 'POST',
          body: formData
        })
        .then(response => {
          if (response.ok) {
            // Éxito: redirigir al login (Thymeleaf maneja mensajes flash)
            window.location.href = '/login?success';
          } else if (response.status === 409) {
            throw new Error('El email o nombre de usuario ya está registrado');
          } else if (response.status === 400) {
            throw new Error('Datos inválidos. Verifica el formulario');
          } else {
            throw new Error('Error del servidor. Inténtalo más tarde');
          }
        })
        .catch(error => {
          console.error('Error de registro:', error);
          
          // Mostrar error con Bootstrap toast o alert mejorado
          const errorDiv = document.createElement('div');
          errorDiv.className = 'alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-5 z-3';
          errorDiv.style.maxWidth = '400px';
          errorDiv.style.zIndex = '1060';
          errorDiv.innerHTML = `
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            ${error.message}
            <button type="button" class="btn-close float-end" data-bs-dismiss="alert"></button>
          `;
          document.body.prepend(errorDiv);
          
          // Auto-eliminar después de 5s
          setTimeout(() => errorDiv.remove(), 5000);
          
          // Resetear botón
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-person-plus-fill me-2"></i>Crear cuenta';
          }
        })
        .finally(() => {
          // Siempre resetear botón (por si hay timeout)
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="bi bi-person-plus-fill me-2"></i>Crear cuenta';
          }
        });
      } else {
        // Formulario inválido
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="bi bi-person-plus-fill me-2"></i>Crear cuenta';
        }
      }
    });
  }
});
