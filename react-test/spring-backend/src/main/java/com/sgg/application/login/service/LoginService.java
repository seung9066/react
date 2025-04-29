package com.sgg.application.login.service;

import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public interface LoginService {
    Map<String, Object> login(Map<String, String> map) throws Exception;
}
