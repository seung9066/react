package com.sgg.application.sggCd.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface SggCdMapper {
    List<Map<String, Object>> sggCdList(Map<String, String> map) throws Exception;
}
