package es.easyfinance.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import es.easyfinance.models.CategoryModel;
import es.easyfinance.models.TransactionModel;
import es.easyfinance.models.TransactionTypeModel;
import es.easyfinance.models.UserModel;
import es.easyfinance.repositories.DashboardRepository;

@Service
public class DashboardService {
	
	@Autowired
    private DashboardRepository dashboardRepository;

    public Map<String, Object> getDatosGraficos(UserModel usuario) {
    	
    	// GRÁFICO BARRAS - INGRESOS Y GASTOS
        Map<String, Object> data = new HashMap<>();

        // Obtener últimos 6 meses dinámicos
        YearMonth inicio = YearMonth.now().minusMonths(6);
        List<String> meses = new ArrayList<>();
        List<Integer> mesesNumericos = new ArrayList<>();
        List<String> mesesNombres = Arrays.asList("Ene", "Feb", "Mar", "Abr", "May", "Jun", 
                                                  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic");

        for (int i = 0; i < 6; i++) {
            YearMonth ym = inicio.plusMonths(i);
            meses.add(mesesNombres.get(ym.getMonthValue() - 1));
            mesesNumericos.add(ym.getMonthValue());
        }
        
        data.put("meses", meses);

        TransactionTypeModel INGRESO = TransactionTypeModel.INGRESO;
        TransactionTypeModel GASTO = TransactionTypeModel.GASTO;

        List<TransactionModel> transaccionesIngresos = dashboardRepository
            .findByUsuarioIdAndTipoOrderByFechaDesc(usuario, INGRESO);
        List<TransactionModel> transaccionesGastos = dashboardRepository  
            .findByUsuarioIdAndTipoOrderByFechaDesc(usuario, GASTO);

        // Mapa con STREAM
        Map<String, BigDecimal> ingresosMap = transaccionesIngresos.stream()
            .collect(Collectors.groupingBy(
                t -> t.getFecha().getYear() + "-" + String.format("%02d", t.getFecha().getMonthValue()),
                Collectors.reducing(BigDecimal.ZERO, TransactionModel::getCantidad, BigDecimal::add)
            ));

        Map<String, BigDecimal> gastosMap = transaccionesGastos.stream()
            .collect(Collectors.groupingBy(
                t -> t.getFecha().getYear() + "-" + String.format("%02d", t.getFecha().getMonthValue()),
                Collectors.reducing(BigDecimal.ZERO, TransactionModel::getCantidad, BigDecimal::add)
            ));

        // Rellenar los 6 últimos meses
        List<String> ingresos = new ArrayList<>();
        List<String> gastosLista = new ArrayList<>();
        YearMonth mesActual = YearMonth.now();

        for (int i = 6; i >= 1; i--) {
            YearMonth ym = mesActual.minusMonths(i);
            String clave = ym.getYear() + "-" + String.format("%02d", ym.getMonthValue());
            
            ingresos.add(formatEuro(ingresosMap.getOrDefault(clave, BigDecimal.ZERO)));
            gastosLista.add(formatEuro(gastosMap.getOrDefault(clave, BigDecimal.ZERO)));
        }

        data.put("ingresos", ingresos);
        data.put("gastos", gastosLista);
        
        // GRÁFICO DONUT - GASTOS POR CATEGORÍA
        LocalDate fechaCat = YearMonth.now().atDay(1);
        List<TransactionModel> gastosRecientes = dashboardRepository
            .findByUsuarioIdAndTipoAndFechaGreaterThanEqualOrderByCantidadDesc(usuario, GASTO, fechaCat);

        // GroupBy categoría → suma
        Map<CategoryModel, BigDecimal> gastosCatMap = gastosRecientes.stream()
            .filter(t -> t.getCategoriaId() != null)  // Sin categoría NULL
            .collect(Collectors.groupingBy(
                TransactionModel::getCategoriaId,
                Collectors.reducing(BigDecimal.ZERO, TransactionModel::getCantidad, BigDecimal::add)
            ));

        // Colores aleatorios
        List<Object[]> gastosCatData = gastosCatMap.entrySet().stream()
        	    .sorted(Map.Entry.<CategoryModel, BigDecimal>comparingByValue(Comparator.reverseOrder()))
        	    .limit(6)
        	    .map(entry -> {
        	        String nombre = entry.getKey().getNombre();
        	        String valorStr = formatEuro(entry.getValue());
        	        String color = switch(nombre) {
        	            case "Alimentación" -> "#FF6384";
        	            case "Freelance" -> "#36A2EB"; 
        	            case "Alquiler" -> "#FFCE56";
        	            case "Salario" -> "#4BC0C0";
        	            default -> String.format("#%06X", (int)(Math.random() * 0xFFFFFF));
        	        };
        	        return new Object[]{nombre, valorStr, color};
        	    })
        	    .collect(Collectors.toList());

        // Llenar listas
        List<String> categorias = gastosCatData.stream().map(c -> (String) c[0]).collect(Collectors.toList());
        List<String> gastosCatStr = gastosCatData.stream().map(c -> (String) c[1]).collect(Collectors.toList());
        List<String> coloresCategorias = gastosCatData.stream().map(c -> (String) c[2]).collect(Collectors.toList());

        data.put("categorias", categorias.isEmpty() ? Arrays.asList("Sin datos") : categorias);
        data.put("gastosCategorias", gastosCatStr.isEmpty() ? Arrays.asList("0€") : gastosCatStr);
        data.put("coloresCategorias", coloresCategorias.isEmpty() ? Arrays.asList("#999999") : coloresCategorias);
        
        return data;
    }

    private String formatEuro(BigDecimal valor) {
        if (valor == null) return "0€";
        return valor.setScale(0, RoundingMode.HALF_UP).toString() + "€";
    }
	
}
