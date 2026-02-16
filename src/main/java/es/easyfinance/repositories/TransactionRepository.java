package es.easyfinance.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import es.easyfinance.models.TransactionModel;
import es.easyfinance.models.TransactionTypeModel;
import es.easyfinance.models.UserModel;

public interface TransactionRepository extends JpaRepository<TransactionModel, Long> {
	
	// Transacciones del usuario logueado
    List<TransactionModel> findByUsuarioIdOrderByFechaDesc(UserModel usuario);
    
    // Filtrar por usuario y tipo
    List<TransactionModel> findByUsuarioIdAndTipoOrderByFechaDesc(UserModel usuario, TransactionTypeModel tipo);
    
    // Transacciones por páginas
    Page<TransactionModel> findByUsuarioId(UserModel usuarioId, Pageable pageable);

    // Ingresos y gastos mes actual
    List<TransactionModel> findByUsuarioIdEmailAndTipoAndFechaGreaterThanEqual(
	   String email, 
	   TransactionTypeModel tipo, 
	   LocalDate inicioMes
	 );

}
