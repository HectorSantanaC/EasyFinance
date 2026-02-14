document.addEventListener('DOMContentLoaded', function() {
    
    const form = document.getElementById('formNewTransaction');
    const modal = document.getElementById('modalNewTransaction');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        
        try {
            const response = await fetch('/api/transacciones', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                // Cerrar modal Bootstrap 5
                const modalInstance = bootstrap.Modal.getInstance(modal);
                modalInstance.hide();
				alert('¡Transacción guardada!');
                
                // Recargar página
                location.reload();
            } else {
                alert('Error al guardar');
            }
        } catch(error) {
            console.error('Error:', error);
            alert('Error de conexión');
        }
    });
});

