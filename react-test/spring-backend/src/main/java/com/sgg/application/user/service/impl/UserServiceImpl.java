package com.sgg.application.user.service.impl;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.sgg.application.user.mapper.UserMapper;
import com.sgg.application.user.service.UserService;

import com.sgg.application.cmmnUtil.cmnUtil;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    UserMapper userMapper;

    @Override
    public Map<String, Object> userList(Map<String, String> map) throws Exception {
        Map<String, Object> result = new HashMap<>();
        result.put("list", userMapper.userList(map));
        result.put("totalCount", userMapper.userListCount(map));
        return result;
    }

    @Override
    public Map<String, Object> updateUser(List<Map<String, Object>> list) throws Exception {
        Map<String, Object> result = new HashMap<>();
        Map<String, Object> mergeParam = new HashMap<>();
        for (int i = 0; i < list.size(); i++) {
            if (!StringUtils.isEmpty(list.get(i).get("userPw"))) {
                list.get(i).put("userPw", cmnUtil.hashEncpt((String) list.get(i).get("userPw")));
            }
        }
        mergeParam.put("list", list);
        result.put("cnt", userMapper.updateUser(mergeParam));
        return result;
    }
}
