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
        if (StringUtils.hasText(map.get("userPw"))) {
            encPw = cmnUtil.hashEncpt(map.get("userPw"));
            map.put("userPw", encPw);
        }

        Map<String, Object> result = loginMapper.login(map);
        if (result != null && !result.isEmpty()) {
            if (StringUtils.hasText((String) result.get("passwordCheck"))) {
                if (result.get("passwordCheck").equals("N")) {
                    loginMapper.upLoginCount(map);
                } else {
                    loginMapper.resetLoginCount(map);
                }
            }
        }

        return result;
    }

    @Override
    public int log(Map<String, String> map) throws Exception {
        return loginMapper.log(map);
    }
}
