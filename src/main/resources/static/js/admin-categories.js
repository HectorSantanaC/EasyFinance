// Inicializar al cargar página
document.addEventListener('DOMContentLoaded', async function() {
    const tbody = document.getElementById('bodyCategoriasGlobales');
    const totalCategoriasSpan = document.getElementById('contadorCategorias');
    const filtroTipo = document.getElementById('filtroTipo');
    
    let todasCategorias = [];  // Cache local
    
    // Fetch categorías desde REST API
    async function cargarCategorias() {
        try {
            const response = await fetch('/api/categorias/globales');
            todasCategorias = await response.json();
            aplicarFiltros();
        } catch (error) {
            console.error('Error cargando categorías:', error);
            tbody.innerHTML = '<tr><td colspan="7" class="text-danger text-center py-5">Error al cargar categorías</td></tr>';
        }
    }
    
    // Función renderizar tabla (igual que antes)
    function renderCategorias(filtradas) {
        totalCategoriasSpan.textContent = `${filtradas.length} categorías`;
        if (filtradas.length === 0) {
            tbody.innerHTML = `
                <tr class="text-center">
                    <td colspan="7" class="py-5 text-muted">
                        <i class="bi bi-search fs-1 d-block mb-2"></i>
                        No hay categorías que coincidan con los filtros
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = filtradas.map(cat => `
            <tr>
                <td>${cat.id}</td>
                <td>${cat.nombre}</td>
                <td>
                    <span class="badge ${cat.tipo === 'INGRESO' ? 'bg-success' : 'bg-danger'}">
                        ${cat.tipo}
                    </span>
                </td>
                <td class="text-center">
                    <span class="badge bg-info">15 usuarios</span>  <!-- TODO: API /api/stats/users-per-category/${cat.id} -->
                </td>
                <td class="text-center">
                    <span class="badge bg-secondary">247 txns</span>  <!-- TODO: API /api/stats/transactions-per-category/${cat.id} -->
                </td>
                <td class="text-center">
                    <span class="badge bg-success">Activa</span>
                </td>
                <td class="text-center">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary edit-btn" data-id="${cat.id}" data-nombre="${cat.nombre}" data-tipo="${cat.tipo}">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger delete-btn" data-id="${cat.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Bind eventos editar/eliminar
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', e => abrirModalEditar(e.target.dataset));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', e => confirmarEliminar(e.target.dataset.id));
        });
    }
    
    // Filtros client-side
    function aplicarFiltros() {
        const tipo = filtroTipo.value;
        const filtradas = todasCategorias.filter(cat => !tipo || cat.tipo === tipo);
        renderCategorias(filtradas);
    }
    
    // Abrir modal editar/crear
    window.abrirModalEditar = function(data) {
        document.getElementById('globalCategoryId').value = data.id || '';
        document.getElementById('globalCategoryName').value = data.nombre || '';
        document.getElementById('globalCategoryType').value = data.tipo || '';
        new bootstrap.Modal(document.getElementById('modalNewGlobalCategory')).show();
    };
    
    // Eliminar con fetch + CSRF
    window.confirmarEliminar = async function(id) {
        if (confirm('¿Eliminar esta categoría global? Afectará transacciones existentes.')) {
            try {
                const csrfToken = document.querySelector('input[name="_csrf"]').value;
                await fetch(`/api/categorias/${id}`, {
                    method: 'DELETE',
                    headers: { 'X-CSRF-TOKEN': csrfToken }
                });
                cargarCategorias();  // Reload
            } catch (error) {
                alert('Error al eliminar');
            }
        }
    };
    
    // Submit form modal (crear/editar)
document.getElementById('formNewGlobalCategory').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('globalCategoryName').value;
    const tipo = document.getElementById('globalCategoryType').value;
    
    try {
        const response = await fetch('/api/categorias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: nombre,
                tipo: tipo,
                esGlobal: true,
                activa: true
            })
        });
        
        if (!response.ok) {
            const error = await response.text();
            alert('❌ ' + error);
            return;
        }
        
        alert('✅ Categoría creada!');
        location.reload();  // Recarga tabla
        
    } catch (err) {
        alert('❌ Error conexión: ' + err.message);
    }
});

    
    // Eventos filtros (igual)
    filtroTipo.addEventListener('change', aplicarFiltros);
    document.getElementById('formFiltros').addEventListener('submit', e => { e.preventDefault(); aplicarFiltros(); });
    document.getElementById('btnLimpiarFiltros').addEventListener('click', () => { filtroTipo.value = ''; aplicarFiltros(); });
    
    // Cargar inicial
    await cargarCategorias();
});
