package com.sgg.application.cmmnUtil;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class cmnUtil {
    /**
	 * 단방향 암호화
	 * @param str
	 * @return string
	 * @throws Exception
	 */
	public static String hashEncpt(String str) throws Exception{
    	try {
    		String result = "";
        	// SHA-256 알고리즘 객체
        	MessageDigest md = MessageDigest.getInstance("SHA-256");
        	md.update(str.getBytes());
        	byte[] pw = md.digest();
        	
        	StringBuffer sb = new StringBuffer();
        	for (byte b : pw) {
        		sb.append(String.format("%02x", b));
        	}
        	
        	result = sb.toString();
        	return result;
    	} catch (NoSuchAlgorithmException e) {
    		e.printStackTrace();
    		return "";
    	}
	}
}
