package es.easyfinance.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import es.easyfinance.models.TransactionModel;
import es.easyfinance.models.TransactionTypeModel;
import es.easyfinance.models.UserModel;

public interface DashboardRepository extends JpaRepository<TransactionModel, Long> {
	
	// Categorías gráfico
	List<TransactionModel> findByUsuarioIdAndTipoAndFechaGreaterThanEqualOrderByCantidadDesc(
		    UserModel usuario, TransactionTypeModel tipo, LocalDate fechaInicio
		);
	
    // Meses gráficos
	List<TransactionModel> findByUsuarioIdAndTipoOrderByFechaDesc(UserModel usuario, TransactionTypeModel tipo);

}
