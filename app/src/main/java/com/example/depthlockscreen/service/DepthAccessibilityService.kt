package com.example.depthlockscreen.service

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.util.Log
import android.view.accessibility.AccessibilityEvent

/**
 * خدمة إمكانية الوصول (Accessibility Service) لتطبيق Depth Wallpapers.
 * تتيح للتطبيق الظهور في قائمة:
 * Paramètres > Accessibilité > Applications téléchargées > Depth Wallpapers
 * ومزامنة أحداث القفل والشاشة ومنع تداخل الساعات.
 */
class DepthAccessibilityService : AccessibilityService() {

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return
        // يمكنك هنا التقاط أحداث شاشة القفل عند تغير حالة النوافذ
        if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            val pkg = event.packageName?.toString() ?: ""
            if (pkg.contains("keyguard") || pkg.contains("systemui")) {
                Log.d("DepthAccessibility", "Lock screen or SystemUI event detected")
            }
        }
    }

    override fun onInterrupt() {
        Log.d("DepthAccessibility", "Service Interrupted")
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.d("DepthAccessibility", "Depth Accessibility Service Connected Successfully")
    }
}
