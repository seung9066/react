package com.sgg.application.login.service.impl;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sgg.application.login.service.LoginService;
import com.sgg.application.user.mapper.UserMapper;

@Service
public class LoginServiceImpl implements LoginService {

    @Autowired
    UserMapper userMapper;

    @Override
    public int getId(Map<String, String> map) throws Exception {
        return 0;
    }
}
