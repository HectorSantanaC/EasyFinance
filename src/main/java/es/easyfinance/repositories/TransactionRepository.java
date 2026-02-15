package es.easyfinance.repositories;

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

    // Transacciones Top 5 Dashboard
    List<TransactionModel> findTop5ByUsuarioIdOrderByFechaDesc(UserModel usuarioId);
    
    // Con filtro tipo (String o enum según TransactionModel)
    List<TransactionModel> findTop5ByUsuarioIdAndTipoNameOrderByFechaDesc(UserModel usuarioId, String tipo);

}
