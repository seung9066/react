package com.sgg;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan(basePackages = "com.sgg.application.**.mapper")
public class SggApplication {

	public static void main(String[] args) {
		SpringApplication.run(SggApplication.class, args);
	}

}
