package com.sgg.application.sggCd.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public interface SggCdService {
    List<Map<String, Object>> sggCdList(Map<String, String> map) throws Exception;
}
