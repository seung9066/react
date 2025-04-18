package com.sgg.application.user.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sgg.application.user.service.UserService;

@RestController
public class UserController {
    
    @Autowired
    UserService userService;

    @GetMapping("/api/user/userList")
    public List<Map<String, Object>> userList(@RequestParam Map<String, String> map) throws Exception {
        return userService.userList(map);
    }

    @GetMapping("/api/user/userListCount")
    public int userListCount(@RequestParam Map<String, String> map) throws Exception {
        return userService.userListCount(map);
    }
}