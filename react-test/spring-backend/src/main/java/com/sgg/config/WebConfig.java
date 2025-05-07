package com.sgg.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.sgg.application.cmmnUtil.LogInterceptor;
import com.sgg.application.login.service.LoginService;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Autowired
	LoginService loginService;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                        "http://localhost:5173",
                                   "http://localhost:5000"
                                ) // Vite dev 서버
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    // 인터셉터 등록
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LogInterceptor(loginService))
                .addPathPatterns("/**");   // 인터셉터가 적용될 URL 패턴
    }
}
