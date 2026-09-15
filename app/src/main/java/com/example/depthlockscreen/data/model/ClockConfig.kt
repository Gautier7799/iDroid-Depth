package com.example.depthlockscreen.data.model

import android.graphics.Color

/**
 * 🕰️ إعدادات وتخصيص ساعة قفل الشاشة ثلاثية الأبعاد (iOS 27 Depth Architecture):
 * تدعم التحكم بموقع الساعة بالنسبة للشخصية (ساندوتش العمق)، نوع الخط، الحجم، اللون، وقوة الحركة.
 */
data class ClockConfig(
    val isClockVisible: Boolean = true,
    val isBehindSubject: Boolean = true, // ✨ ميزة العمق: الساعة تقع خلف رأس أو كتف العنصر المعزول
    val colorArgb: Int = Color.WHITE,
    val fontSizeSp: Float = 88f,
    val verticalBias: Float = 0.22f, // 0.10f لأعلى الشاشة وحتى 0.50f لوسط الشاشة
    val is24HourFormat: Boolean = true,
    val parallaxStrength: Float = 1.0f,
    val fontFamily: String = "SF_BOLD" // "SF_BOLD", "SERIF", "MONOSPACE", "ROUNDED"
) {
    companion object {
        val DEFAULT = ClockConfig()
    }
}
