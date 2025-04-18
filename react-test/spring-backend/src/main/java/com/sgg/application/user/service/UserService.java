package com.sgg.application.user.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public interface UserService {
    List<Map<String, Object>> userList(Map<String, String> map) throws Exception;

    int userListCount(Map<String, String> map) throws Exception;
}
