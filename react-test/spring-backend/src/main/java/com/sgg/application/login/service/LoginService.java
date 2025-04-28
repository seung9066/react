package com.sgg.application.login.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public interface LoginService {
    int getId(Map<String, String> map) throws Exception;
}
