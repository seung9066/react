package com.sgg.application.login.service.impl;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.sgg.application.cmmnUtil.cmnUtil;
import com.sgg.application.login.mapper.LoginMapper;
import com.sgg.application.login.service.LoginService;

@Service
public class LoginServiceImpl implements LoginService {

    @Autowired
    LoginMapper loginMapper;

    @Override
    public Map<String, Object> login(Map<String, String> map) throws Exception {
        String encPw = "";
        if (!StringUtils.isEmpty(map.get("userPw"))) {
            encPw = cmnUtil.hashEncpt(map.get("userPw"));
            map.put("userPw", encPw);
        }

        Map<String, Object> result = loginMapper.login(map);
        if (!StringUtils.isEmpty(result.get("passwordCheck"))) {
            System.out.println(result.get("passwordCheck"));
            if (result.get("passwordCheck").equals("N")) {
                loginMapper.upLoginCount(map);
            } else {
                loginMapper.resetLoginCount(map);
            }
        }

        return result;
    }
}
