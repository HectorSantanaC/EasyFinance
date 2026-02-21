package es.easyfinance.services;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import es.easyfinance.models.CategoryModel;
import es.easyfinance.models.TransactionFilterModel;
import es.easyfinance.models.TransactionModel;
import es.easyfinance.models.TransactionTypeModel;
import es.easyfinance.models.UserModel;
import es.easyfinance.repositories.CategoryRepository;
import es.easyfinance.repositories.TransactionRepository;
import es.easyfinance.repositories.UserRepository;

@Service
public class TransactionService {
	
	@Autowired
    private TransactionRepository transactionRepository;
	
	@Autowired
    private CategoryRepository categoryRepository;
	
	@Autowired
	private UserRepository userRepository;

	private Long getCurrentUserId() {
		
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserModel user = userRepository.findByEmail(email);
        
        if (user == null) {
            throw new IllegalStateException("Usuario actual no encontrado");
        }
        
        return user.getId();
    }
	
	public Page<TransactionModel> findAllByUsuario(UserModel userModel, Pageable pageable) {
		return transactionRepository.findByUsuarioId(userModel, pageable); 
	}

    public TransactionModel buscarPorId(Long id) {
        return transactionRepository.findById(id).orElse(null);
    }

    public List<TransactionModel> listarTodas() {
        return transactionRepository.findAll();
    }

    public TransactionModel guardar(TransactionModel transaccion) {
    	
    	// Validación y asignación de categoría por defecto SOLO si no tiene categoría (AHORRO)
        if (transaccion.getCategoriaId() == null) {
        	
        	CategoryModel defaultCat = categoryRepository.findFirstByNombreAndTipoAndEsGlobal(
                    "Sin categoria", transaccion.getTipo(), true);
        	
            if (defaultCat != null) {
                transaccion.setCategoriaId(defaultCat);
            } else {
                throw new IllegalArgumentException("Categoría por defecto 'Sin categoria' no encontrada para tipo: " + 
                    transaccion.getTipo() + ". Cree la categoría global primero.");
            }
        }
        
        boolean esCreacion = (transaccion.getId() == null);
        Long currentUserId = getCurrentUserId();
        
        if(esCreacion) {
                transaccion.setFechaCreacion(LocalDateTime.now());
                transaccion.setCreadoPor(currentUserId);
            } else {
            	transaccion.setFechaModificacion(LocalDateTime.now());
            	transaccion.setModificadoPor(currentUserId);
        }

        return transactionRepository.save(transaccion);
    }

    public void borrar(Long id) {
    	transactionRepository.deleteById(id);
    }
    
    // Balance mensual
    public BigDecimal calcularBalanceMesActual(String email) {
    	return calcularIngresosMesActual(email).subtract(calcularGastosMesActual(email));
    }
    
    // Ingreso mensual
    public BigDecimal calcularIngresosMesActual(String email) {
    	
    	LocalDate inicioMes = LocalDate.now().withDayOfMonth(1);
    	
        return transactionRepository.findByUsuarioIdEmailAndTipoAndFechaGreaterThanEqual(
        	email, TransactionTypeModel.INGRESO, inicioMes).stream()
	        	.map(TransactionModel::getCantidad)
	        	.filter(Objects::nonNull)
	        	.reduce(BigDecimal.ZERO, BigDecimal::add);
    }
      
    // Gasto mensual
    public BigDecimal calcularGastosMesActual(String email) {
    	
    	LocalDate inicioMes = LocalDate.now().withDayOfMonth(1);
    	
    	return transactionRepository.findByUsuarioIdEmailAndTipoAndFechaGreaterThanEqual(
    		email, TransactionTypeModel.GASTO, inicioMes).stream()
    			.map(TransactionModel::getCantidad)
    			.filter(Objects::nonNull)
    			.reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    // Ahorro mensual
    public BigDecimal calcularAhorrosMesActual(String email) {
    	
    	LocalDate inicioMes = LocalDate.now().withDayOfMonth(1);
    	
    	return transactionRepository.findByUsuarioIdEmailAndTipoAndFechaGreaterThanEqual(
    		email, TransactionTypeModel.AHORRO, inicioMes).stream()
    			.map(TransactionModel::getCantidad)
    			.filter(Objects::nonNull)
    			.reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    // Filtros
    public Page<TransactionModel> findByFilters(UserModel usuario, TransactionFilterModel filtro, Pageable pageable) {

        TransactionTypeModel tipoEnum = null;
        if (filtro.getTipo() != null && !filtro.getTipo().isEmpty()) {
            tipoEnum = TransactionTypeModel.valueOf(filtro.getTipo());
        }

        CategoryModel categoriaModel = null;
        if (filtro.getCategoria() != null && !filtro.getCategoria().isEmpty()) {
            Long catId = Long.parseLong(filtro.getCategoria());
            categoriaModel = categoryRepository.findById(catId).orElse(null);
        }

        LocalDate fechaDesde = filtro.getFechaDesde();
        LocalDate fechaHasta = filtro.getFechaHasta();

        // Detectar si hay filtro de fecha explícito
        boolean tieneFiltroFecha = (fechaDesde != null || fechaHasta != null);

        // NO normalizar si NO hay filtro explícito
        if (!tieneFiltroFecha) {
            fechaDesde = null;
            fechaHasta = null;
        }

        // Combinaciones con fecha
        if (tipoEnum != null && categoriaModel != null && tieneFiltroFecha) {
            if (fechaDesde == null) fechaDesde = LocalDate.now().withDayOfMonth(1);
            if (fechaHasta == null) fechaHasta = LocalDate.now().plusMonths(1).withDayOfMonth(1).minusDays(1);
            return transactionRepository.findByUsuarioIdAndTipoAndCategoriaIdAndFechaBetween(usuario, 
                tipoEnum, categoriaModel, fechaDesde, fechaHasta, pageable);
        }
        
        // Tipo + Categoría (sin fecha)
        else if (tipoEnum != null && categoriaModel != null) {
            return transactionRepository.findByUsuarioIdAndTipoAndCategoriaId(usuario, tipoEnum, categoriaModel, pageable);
        }
        
        // Tipo + Fecha
        else if (tipoEnum != null && tieneFiltroFecha) {
            if (fechaDesde == null) fechaDesde = LocalDate.now().withDayOfMonth(1);
            if (fechaHasta == null) fechaHasta = LocalDate.now().plusMonths(1).withDayOfMonth(1).minusDays(1);
            return transactionRepository.findByUsuarioIdAndTipoAndFechaBetween(usuario, tipoEnum, fechaDesde, fechaHasta, pageable);
        }
        
        // Categoría + Fecha
        else if (categoriaModel != null && tieneFiltroFecha) {
            if (fechaDesde == null) fechaDesde = LocalDate.now().withDayOfMonth(1);
            if (fechaHasta == null) fechaHasta = LocalDate.now().plusMonths(1).withDayOfMonth(1).minusDays(1);
            return transactionRepository.findByUsuarioIdAndCategoriaIdAndFechaBetween(usuario, categoriaModel, fechaDesde, fechaHasta, pageable);
        }
        
        // Solo Tipo (sin fecha)
        else if (tipoEnum != null) {
            return transactionRepository.findByUsuarioIdAndTipo(usuario, tipoEnum, pageable);
        }
        
        // Solo Categoría (sin fecha)
        else if (categoriaModel != null) {
            return transactionRepository.findByUsuarioIdAndCategoriaId(usuario, categoriaModel, pageable);
        }
        
        // Solo Fecha
        else if (tieneFiltroFecha) {
            if (fechaDesde == null) fechaDesde = LocalDate.now().withDayOfMonth(1);
            if (fechaHasta == null) fechaHasta = LocalDate.now().plusMonths(1).withDayOfMonth(1).minusDays(1);
            return transactionRepository.findByUsuarioIdAndFechaBetween(usuario, fechaDesde, fechaHasta, pageable);
        }
        
        // SIN NINGÚN FILTRO (TODAS las transacciones)
        else {
            return transactionRepository.findByUsuarioId(usuario, pageable);
        }
    }
        
}
