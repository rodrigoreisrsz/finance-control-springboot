//package com.reis.financeiro.security;
//
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.userdetails.UserDetails;
//
//private UsernamePasswordAuthenticationToken getAuthentication(String token){
//    if(this.jwtUtil.isValidToken(token)){
//        String username = this.jwtUtil.getUsername(token);
//        UserDetails user = this.userDetailsService.loadUserByUSername(username);
//        UsernamePasswordAuthenticationToken authenticatedUser = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
//        return  authenticatedUser;
//    }
//    return null;
//}
