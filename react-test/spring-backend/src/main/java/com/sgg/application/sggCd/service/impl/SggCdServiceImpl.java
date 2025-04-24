package com.sgg.application.sggCd.service.impl;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sgg.application.sggCd.mapper.SggCdMapper;
import com.sgg.application.sggCd.service.SggCdService;

@Service
public class SggCdServiceImpl implements SggCdService {

    @Autowired
    SggCdMapper sggCdMapper;

    @Override
    public List<Map<String, Object>> sggCdList(Map<String, String> map) throws Exception {
        return sggCdMapper.sggCdList(map);
    }
}
