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
    private CategoryRepository categoriaRepository;
	
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
            CategoryModel defaultCat = categoriaRepository.findFirstByNombreAndTipoAndEsGlobal(
                "Ahorro", transaccion.getTipo(), true);
            if (defaultCat != null) {
                transaccion.setCategoriaId(defaultCat);
            } else {
                throw new IllegalArgumentException("Categoría por defecto 'Ahorro' no encontrada para tipo: " + 
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
    
    // Balance = ingresos - gastos
    public BigDecimal calcularBalanceMesActual(String email) {
    	return calcularIngresosMesActual(email).subtract(calcularGastosMesActual(email));
    }
    
}
