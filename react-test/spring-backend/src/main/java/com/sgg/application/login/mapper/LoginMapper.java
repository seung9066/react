package com.sgg.application.login.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface LoginMapper {
    int getId(Map<String, String> map) throws Exception;
}
