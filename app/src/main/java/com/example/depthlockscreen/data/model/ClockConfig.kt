package com.example.depthlockscreen.data.model

import android.graphics.Color

data class ClockConfig(
    val fontSizePercent: Float = 27.1f,
    val horizontalPosPercent: Float = 50f,
    val verticalPosPercent: Float = 30f,
    val fontStyle: String = "capsule", // "capsule", "outline", "condensed", "stencil", "neon", "serif"
    val colorArgb: Int = Color.WHITE,
    val opacity: Int = 100,
    val depthBehindSubject: Boolean = true,
    val depthSensitivity: Int = 35,
    val blurBackground: Int = 0,
    val showDate: Boolean = true,
    val customDateText: String = "25 NOV 2028",
    val useLiveTime: Boolean = false,
    val customTimeText: String = "02:36",
    val is24HourFormat: Boolean = true,
    val showSeconds: Boolean = false,
    // Backwards compatibility properties
    val isClockVisible: Boolean = true,
    val fontSizeSp: Float = 88f,
    val verticalBias: Float = 0.28f,
    val parallaxStrength: Float = 1.0f,
    val fontFamily: String = "capsule",
    val isBehindSubject: Boolean = true
) {
    companion object {
        val DEFAULT = ClockConfig()
    }
}
