package com.sgg.application.sggCd.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sgg.application.sggCd.service.SggCdService;

@RestController
@RequestMapping("/api/sggCd")
public class SggCdController {
    
    @Autowired
    SggCdService sggCdService;

    @GetMapping("/sggCdList")
    public List<Map<String, Object>> sggCdList(@RequestParam Map<String, String> map) throws Exception {
        return sggCdService.sggCdList(map);
    }
}