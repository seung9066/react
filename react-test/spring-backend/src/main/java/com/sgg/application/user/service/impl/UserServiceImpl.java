package com.sgg.application.user.service.impl;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sgg.application.user.mapper.UserMapper;
import com.sgg.application.user.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    UserMapper userMapper;

    @Override
    public List<Map<String, Object>> userList(Map<String, String> map) throws Exception {
        System.out.println(userMapper.userList(map));
        return userMapper.userList(map);
    }
}
