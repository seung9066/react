package com.sgg.application.login.mapper;

import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface LoginMapper {
    Map<String, Object> login(Map<String, String> map) throws Exception;

    int upLoginCount(Map<String, String> map) throws Exception;

    int resetLoginCount(Map<String, String> map) throws Exception;
}
