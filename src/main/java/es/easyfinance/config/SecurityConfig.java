package es.easyfinance.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, LoginSuccesHandler loginSuccesHandler,
            @Qualifier("userDetailsServiceImpl") UserDetailsService userDetailsService) throws Exception {
        
        http
            .userDetailsService(userDetailsService)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/libs/**", "/assets/**", "/css/**", "/js/**", "/index", "/login", "/register").permitAll()
                .requestMatchers("/dashboard", "/transactions", "/savings", "/categories").hasRole("USER")
                .requestMatchers("/admin-users", "/admin-categories").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/loginprocess")
                .successHandler(loginSuccesHandler)
                .permitAll()
            )
            .logout(logout -> logout.logoutSuccessUrl("/login?logout").permitAll());
        
        return http.build();
    }
    
    /**
     * Redirige por rol después del login exitoso:
     * - USER → /dashboard
     * - ADMIN → /admin-users
     */
    @Bean
    AuthenticationSuccessHandler roleBasedAuthenticationSuccessHandler() {
    	SimpleUrlAuthenticationSuccessHandler handler = new SimpleUrlAuthenticationSuccessHandler();
    	
    	return (request, response, authentication) -> {
    		String role = authentication.getAuthorities().stream()
    				.filter(authority -> authority.getAuthority().startsWith("ROLE_"))
    				.findFirst()
    				.map(authority -> authority.getAuthority().substring(5))  // Quita "ROLE_"
    				.orElse("USER");
    		
    		String redirectUrl = "ROLE_USER".equals("ROLE_" + role) ? "/dashboard" : "/admin-users";
            
            handler.setDefaultTargetUrl(redirectUrl);
            handler.onAuthenticationSuccess(request, response, authentication);
        };
    }
    
    @Bean
    BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}
