package com.sgg.application.user.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public interface UserService {
    Map<String, Object> userList(Map<String, String> map) throws Exception;

    Map<String, Object> updateUser(List<Map<String, Object>> list) throws Exception;

}
