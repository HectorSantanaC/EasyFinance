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

import es.easyfinance.dto.TransactionFilterDTO;
import es.easyfinance.models.CategoryModel;
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
        
        // Actualiza timestamps si no están seteados
        if (transaccion.getFechaCreacion() == null) {
            transaccion.setFechaCreacion(LocalDateTime.now());
        }
        if (transaccion.getFechaModificacion() == null) {
            transaccion.setFechaModificacion(LocalDateTime.now());
        }
        
        Long currentUserId = getCurrentUserId();
        transaccion.setCreadoPor(currentUserId);
        transaccion.setModificadoPor(currentUserId);
        
        // Asigna usuario actual vía FK ID (simple Long)
        if (transaccion.getUsuarioId() == null) {
            UserModel currentUser = userRepository.findById(currentUserId).orElseThrow(
                () -> new IllegalStateException("Usuario actual no encontrado"));
            transaccion.setUsuarioId(currentUser);
        }

        return transactionRepository.save(transaccion);
    }

    public void borrar(Long id) {
    	transactionRepository.deleteById(id);
    }
    
    // Balance = ingresos - gastos
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
    public Page<TransactionModel> findByFilters(UserModel usuario, TransactionFilterDTO filtro, Pageable pageable) {
    	
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
        
        if (fechaDesde == null) fechaDesde = LocalDate.now().withDayOfMonth(1);
        if (fechaHasta == null) fechaHasta = LocalDate.now().plusMonths(1).withDayOfMonth(1).minusDays(1);
        
        if (tipoEnum != null && categoriaModel != null && fechaDesde != null && fechaHasta != null) {
            return transactionRepository.findByUsuarioIdAndTipoAndCategoriaIdAndFechaBetween(usuario, 
            		tipoEnum, categoriaModel, fechaDesde, fechaHasta, pageable);
            
        } else if (tipoEnum != null && categoriaModel != null) {
            return transactionRepository.findByUsuarioIdAndTipoAndCategoriaId(usuario, tipoEnum, categoriaModel, pageable);
            
        } else if (tipoEnum != null && fechaDesde != null && fechaHasta != null) {
            return transactionRepository.findByUsuarioIdAndTipoAndFechaBetween(usuario, tipoEnum, fechaDesde, fechaHasta, 
            		pageable);
            
        } else if (categoriaModel != null && fechaDesde != null && fechaHasta != null) {
            return transactionRepository.findByUsuarioIdAndCategoriaIdAndFechaBetween(usuario, categoriaModel, 
            		fechaDesde, fechaHasta, pageable);
            
        } else if (tipoEnum != null) {
            return transactionRepository.findByUsuarioIdAndTipo(usuario, tipoEnum, pageable);
            
        } else if (categoriaModel != null) {
            return transactionRepository.findByUsuarioIdAndCategoriaId(usuario, categoriaModel, pageable);
            
        } else if (fechaDesde != null && fechaHasta != null) {
            return transactionRepository.findByUsuarioIdAndFechaBetween(usuario, fechaDesde, fechaHasta, pageable);
            
        }
        return transactionRepository.findByUsuarioId(usuario, pageable);
    }
    
}
