package com.sgg.application.login.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sgg.application.login.service.LoginService;

@RestController
@RequestMapping("/api/login")
public class LoginController {
    
    @Autowired
    LoginService loginService;

    @GetMapping("/getId")
    public Map<String, Object> getId(@RequestParam Map<String, String> map) throws Exception {
        Map<String, Object> result = new HashMap<>();
        return result;
    }
}