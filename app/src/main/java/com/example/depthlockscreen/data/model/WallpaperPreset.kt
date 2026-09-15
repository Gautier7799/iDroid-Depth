package com.example.depthlockscreen.data.model

data class WallpaperPreset(
    val id: String,
    val title: String,
    val subtitle: String,
    val accentColorHex: String,
    val defaultVerticalBias: Float = 0.22f,
    val defaultFontSize: Float = 88f,
    val defaultFontFamily: String = "SF_BOLD"
) {
    companion object {
        val ALL = listOf(
            WallpaperPreset(
                id = "CYBERPUNK",
                title = "متجول النيون",
                subtitle = "Cyberpunk Nomad 2077",
                accentColorHex = "#38BDF8",
                defaultVerticalBias = 0.22f,
                defaultFontSize = 88f,
                defaultFontFamily = "SF_BOLD"
            ),
            WallpaperPreset(
                id = "ALPINE",
                title = "نسر القمم الألبية",
                subtitle = "Alpine Eagle",
                accentColorHex = "#F59E0B",
                defaultVerticalBias = 0.18f,
                defaultFontSize = 84f,
                defaultFontFamily = "SERIF"
            ),
            WallpaperPreset(
                id = "ECLIPSE",
                title = "الكسوف الكوني",
                subtitle = "Cosmic Eclipse",
                accentColorHex = "#EC4899",
                defaultVerticalBias = 0.25f,
                defaultFontSize = 92f,
                defaultFontFamily = "MONOSPACE"
            ),
            WallpaperPreset(
                id = "HYPERCAR",
                title = "السرعة الليلية",
                subtitle = "Neon Hypercar",
                accentColorHex = "#10B981",
                defaultVerticalBias = 0.20f,
                defaultFontSize = 86f,
                defaultFontFamily = "ROUNDED"
            )
        )
    }
}
