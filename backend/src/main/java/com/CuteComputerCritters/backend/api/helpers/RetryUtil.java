package com.CuteComputerCritters.backend.api.helpers;

import jakarta.persistence.OptimisticLockException;

public class RetryUtil {
    public static void runWithRetry(Runnable action, int maxRetries) {
        int attempts = 0;
        while (attempts++ < maxRetries) {
            try {
                action.run();
                return;
            } catch (OptimisticLockException e) {
                if (attempts == maxRetries) {
                    throw e;
                }
            }
        }
    }
}
