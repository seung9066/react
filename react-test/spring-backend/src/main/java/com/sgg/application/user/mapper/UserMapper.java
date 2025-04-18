package com.sgg.application.user.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper {
    List<Map<String, Object>> userList(Map<String, String> map) throws Exception;

    int userListCount(Map<String, String> map) throws Exception;
}
