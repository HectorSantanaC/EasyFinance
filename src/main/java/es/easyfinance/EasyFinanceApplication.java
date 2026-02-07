package es.easyfinance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "es.easyfinance")
public class EasyFinanceApplication {

	public static void main(String[] args) {
		SpringApplication.run(EasyFinanceApplication.class, args);
	}

}
