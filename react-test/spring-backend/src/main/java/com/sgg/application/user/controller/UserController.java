package com.sgg.application.user.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sgg.application.user.service.UserService;

@RestController
@RequestMapping("/api/user")
public class UserController {
    
    @Autowired
    UserService userService;

    @GetMapping("/userList")
    public Map<String, Object> userList(@RequestParam Map<String, String> map) throws Exception {
        return userService.userList(map);
    }

    @PostMapping("/updateUser")
    public Map<String, Object> updateUser(@RequestBody ArrayList<Map<String, Object>> list) throws Exception {
        return userService.updateUser(list);
    }
}