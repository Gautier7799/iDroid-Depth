package com.example.depthlockscreen.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val ObsidianBlack = Color(0xFF030712)
val DeepSpace = Color(0xFF0B0F19)
val GlassSurface = Color(0xFF131B2E)
val GlassBorder = Color(0xFF1F2A44)
val CyanAccent = Color(0xFF38BDF8)
val NeonPurple = Color(0xFFA855F7)
val EmeraldGlow = Color(0xFF10B981)

private val DarkColorScheme = darkColorScheme(
    primary = CyanAccent,
    secondary = NeonPurple,
    tertiary = EmeraldGlow,
    background = ObsidianBlack,
    surface = DeepSpace,
    onPrimary = Color.Black,
    onSecondary = Color.White,
    onTertiary = Color.White,
    onBackground = Color.White,
    onSurface = Color.White
)

@Composable
fun DepthLockScreenTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
