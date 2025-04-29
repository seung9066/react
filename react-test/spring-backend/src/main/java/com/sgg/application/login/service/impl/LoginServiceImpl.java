package com.sgg.application.login.service.impl;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.sgg.application.login.mapper.LoginMapper;
import com.sgg.application.login.service.LoginService;

import com.sgg.application.cmmnUtil.cmnUtil;

@Service
public class LoginServiceImpl implements LoginService {

    @Autowired
    LoginMapper loginMapper;

    @Override
    public Map<String, Object> login(Map<String, String> map) throws Exception {
        String result = "";
        if (!StringUtils.isEmpty(map.get("userPw"))) {
            result = cmnUtil.hashEncpt(map.get("userPw"));
            map.put("userPw", result);
        }
        return loginMapper.login(map);
    }
}
