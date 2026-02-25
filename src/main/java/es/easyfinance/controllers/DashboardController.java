package es.easyfinance.controllers;

import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.easyfinance.models.UserModel;
import es.easyfinance.services.DashboardService;
import es.easyfinance.services.UserDetailsServiceImpl;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
	
	@Autowired
    private UserDetailsServiceImpl userDetailsService;
	
	@Autowired
	private DashboardService dashboardService;
	
	private UserModel usuarioActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        String email = auth.getName();
        return userDetailsService.findByEmail(email);
    }
	
	private String formatDecimal(BigDecimal valor) {
		  if (valor == null) return "0,00";
		  DecimalFormat df = new DecimalFormat("#,##0.00");
		  return df.format(valor.doubleValue())
		      .replace(".", ",");
	  }

	  @GetMapping("/resumen")
	  public Map<String, Object> getDashboardResumen() {
	    UserModel usuario = usuarioActual();
	    
	    if (usuario == null) return new HashMap<>();

	    Map<String, Object> data = dashboardService.getDashboardResumen(usuario);

	    data.put("ingresosFormateado", formatDecimal((BigDecimal) data.get("ingresosMes")));
	    data.put("gastosFormateado", formatDecimal((BigDecimal) data.get("gastosMes")));
	    data.put("balanceFormateado", formatDecimal((BigDecimal) data.get("balanceMes")));
	    data.put("ahorrosFormateado", formatDecimal((BigDecimal) data.get("ahorrosMes")));

	    return data;
	  }

	  @GetMapping("/graficos")
	  public Map<String, Object> getDashboardGraficos() {
	      UserModel usuario = usuarioActual();
	      return usuario == null ? new HashMap<>() : dashboardService.getDatosGraficos(usuario);
	  }

}
