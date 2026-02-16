package es.easyfinance.controllers;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.easyfinance.models.TransactionModel;
import es.easyfinance.models.UserModel;
import es.easyfinance.services.TransactionService;
import es.easyfinance.services.UserDetailsServiceImpl;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
	
	@Autowired
	  private TransactionService transactionService;
	
	@Autowired
    private UserDetailsServiceImpl userDetailsService;
	
	private UserModel usuarioActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        String email = auth.getName();
        return userDetailsService.findByEmail(email);
    }

	  @GetMapping("/resumen")
	  public Map<String, Object> getDashboardResumen() {
	    UserModel usuario = usuarioActual();
	    String email = usuario.getEmail();

	    Map<String, Object> data = new HashMap<>();

	    
	    data.put("ingresosMes", transactionService.calcularIngresosMesActual(email));
	    data.put("gastosMes", transactionService.calcularGastosMesActual(email));
	    data.put("balanceMes", transactionService.calcularBalanceMesActual(email));

	    Pageable pageable = PageRequest.of(0, 5, Sort.by("fecha").descending());
	    Page<TransactionModel> ultimas = transactionService.findAllByUsuario(usuario, pageable);
	    data.put("ultimasTransacciones", ultimas.getContent());

	    data.put("ingresosFormateado", formatDecimal((BigDecimal) data.get("ingresosMes")));
	    data.put("gastosFormateado", formatDecimal((BigDecimal) data.get("gastosMes")));
	    data.put("balanceFormateado", formatDecimal((BigDecimal) data.get("balanceMes")));
	    data.put("ahorrosFormateado", "6.854€");

	    return data;
	  }

	  private String formatDecimal(BigDecimal valor) {
		  if (valor == null) return "0,00";
		  DecimalFormat df = new DecimalFormat("#,##0.00");
		  return df.format(valor.doubleValue())
		      .replace(".", ",");
	  }

}
