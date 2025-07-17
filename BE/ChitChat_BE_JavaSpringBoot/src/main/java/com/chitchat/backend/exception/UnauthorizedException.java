package com.chitchat.backend.exception;

public class UnauthorizedException extends ChitChatException {
    
    public UnauthorizedException(String message) {
        super(message, "UNAUTHORIZED");
    }
    
    public UnauthorizedException(String message, Throwable cause) {
        super(message, "UNAUTHORIZED", cause);
    }
}
