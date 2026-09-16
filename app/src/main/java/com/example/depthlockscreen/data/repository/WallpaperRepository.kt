package com.example.depthlockscreen.data.repository

import android.content.Context
import android.content.SharedPreferences
import android.graphics.*
import com.example.depthlockscreen.data.model.ClockConfig
import com.example.depthlockscreen.data.model.WallpaperPreset
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import kotlin.math.max

class WallpaperRepository(private val context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("depth_wallpaper_prefs", Context.MODE_PRIVATE)

    suspend fun saveAssets(background: Bitmap, foreground: Bitmap, config: ClockConfig) = withContext(Dispatchers.IO) {
        val optBg = downscaleBitmap(background, 1440)
        val optFg = downscaleBitmap(foreground, 1440)
        val bgFile = File(context.filesDir, "bg_layer.png")
        val fgFile = File(context.filesDir, "fg_subject.png")
        FileOutputStream(bgFile).use { optBg.compress(Bitmap.CompressFormat.PNG, 95, it) }
        FileOutputStream(fgFile).use { optFg.compress(Bitmap.CompressFormat.PNG, 95, it) }
        saveClockConfig(config)
    }

    suspend fun applyPreset(presetId: String): Pair<Bitmap, Bitmap> = withContext(Dispatchers.IO) {
        val preset = WallpaperPreset.ALL.find { it.id == presetId } ?: WallpaperPreset.ALL[0]
        val bg = generatePresetBg(preset)
        val fg = generatePresetFg(preset)
        val currentConfig = ClockConfig(
            fontSizePercent = preset.defaultFontSizePercent,
            horizontalPosPercent = preset.defaultHorizontalPercent,
            verticalPosPercent = preset.defaultVerticalPercent,
            fontStyle = preset.defaultFontStyle,
            colorArgb = Color.parseColor(preset.accentColorHex),
            opacity = preset.defaultOpacity,
            depthBehindSubject = preset.defaultDepthBehindSubject,
            depthSensitivity = preset.defaultDepthSensitivity,
            customTimeText = preset.defaultTimeText,
            customDateText = preset.defaultDateText,
            isBehindSubject = preset.defaultDepthBehindSubject,
            verticalBias = preset.defaultVerticalPercent / 100f
        )
        saveAssets(bg, fg, currentConfig)
        Pair(bg, fg)
    }

    fun saveClockConfig(config: ClockConfig) {
        prefs.edit()
            .putFloat("fontSizePercent", config.fontSizePercent)
            .putFloat("horizontalPosPercent", config.horizontalPosPercent)
            .putFloat("verticalPosPercent", config.verticalPosPercent)
            .putString("fontStyle", config.fontStyle)
            .putInt("colorArgb", config.colorArgb)
            .putInt("opacity", config.opacity)
            .putBoolean("depthBehindSubject", config.depthBehindSubject)
            .putInt("depthSensitivity", config.depthSensitivity)
            .putInt("blurBackground", config.blurBackground)
            .putBoolean("showDate", config.showDate)
            .putString("customDateText", config.customDateText)
            .putBoolean("useLiveTime", config.useLiveTime)
            .putString("customTimeText", config.customTimeText)
            .putBoolean("is24HourFormat", config.is24HourFormat)
            .putBoolean("showSeconds", config.showSeconds)
            .putBoolean("isClockVisible", config.isClockVisible)
            .putBoolean("isBehindSubject", config.depthBehindSubject)
            .putFloat("verticalBias", config.verticalPosPercent / 100f)
            .apply()
    }

    fun loadSavedClockConfig(): ClockConfig {
        val color = prefs.getInt("colorArgb", Color.WHITE)
        val fontStyle = prefs.getString("fontStyle", "capsule") ?: "capsule"
        val fontSize = prefs.getFloat("fontSizePercent", 27.1f)
        val hPos = prefs.getFloat("horizontalPosPercent", 50f)
        val vPos = prefs.getFloat("verticalPosPercent", 30f)
        val depth = prefs.getBoolean("depthBehindSubject", true)
        val sensitivity = prefs.getInt("depthSensitivity", 35)

        return ClockConfig(
            fontSizePercent = fontSize,
            horizontalPosPercent = hPos,
            verticalPosPercent = vPos,
            fontStyle = fontStyle,
            colorArgb = color,
            opacity = prefs.getInt("opacity", 100),
            depthBehindSubject = depth,
            depthSensitivity = sensitivity,
            blurBackground = prefs.getInt("blurBackground", 0),
            showDate = prefs.getBoolean("showDate", true),
            customDateText = prefs.getString("customDateText", "25 NOV 2028") ?: "25 NOV 2028",
            useLiveTime = prefs.getBoolean("useLiveTime", false),
            customTimeText = prefs.getString("customTimeText", "02:36") ?: "02:36",
            is24HourFormat = prefs.getBoolean("is24HourFormat", true),
            showSeconds = prefs.getBoolean("showSeconds", false),
            isClockVisible = prefs.getBoolean("isClockVisible", true),
            isBehindSubject = depth,
            verticalBias = vPos / 100f
        )
    }

    fun exportToJson(config: ClockConfig, presetId: String): String {
        val json = JSONObject()
        json.put("appName", "Depth Wallpapers Live Clock")
        json.put("version", "2.4.0")
        json.put("presetId", presetId)
        json.put("fontSizePercent", config.fontSizePercent)
        json.put("horizontalPosPercent", config.horizontalPosPercent)
        json.put("verticalPosPercent", config.verticalPosPercent)
        json.put("fontStyle", config.fontStyle)
        json.put("colorArgb", config.colorArgb)
        json.put("opacity", config.opacity)
        json.put("depthBehindSubject", config.depthBehindSubject)
        json.put("depthSensitivity", config.depthSensitivity)
        json.put("blurBackground", config.blurBackground)
        json.put("showDate", config.showDate)
        json.put("customDateText", config.customDateText)
        json.put("useLiveTime", config.useLiveTime)
        json.put("customTimeText", config.customTimeText)
        json.put("is24HourFormat", config.is24HourFormat)
        return json.toString(2)
    }

    suspend fun loadBackgroundBitmap(): Bitmap = withContext(Dispatchers.IO) {
        try {
            val file = File(context.filesDir, "bg_layer.png")
            if (file.exists()) {
                BitmapFactory.decodeFile(file.absolutePath) ?: generatePresetBg(WallpaperPreset.ALL[0])
            } else {
                generatePresetBg(WallpaperPreset.ALL[0])
            }
        } catch (e: Exception) {
            generatePresetBg(WallpaperPreset.ALL[0])
        }
    }

    suspend fun loadForegroundBitmap(): Bitmap = withContext(Dispatchers.IO) {
        try {
            val file = File(context.filesDir, "fg_subject.png")
            if (file.exists()) {
                BitmapFactory.decodeFile(file.absolutePath) ?: generatePresetFg(WallpaperPreset.ALL[0])
            } else {
                generatePresetFg(WallpaperPreset.ALL[0])
            }
        } catch (e: Exception) {
            generatePresetFg(WallpaperPreset.ALL[0])
        }
    }

    private fun downscaleBitmap(source: Bitmap, maxDim: Int): Bitmap {
        val width = source.width
        val height = source.height
        val maxSide = max(width, height)
        if (maxSide <= maxDim) return source
        val scale = maxDim.toFloat() / maxSide
        return Bitmap.createScaledBitmap(source, (width * scale).toInt(), (height * scale).toInt(), true)
    }

    private fun generatePresetBg(preset: WallpaperPreset): Bitmap {
        val w = 1080
        val h = 2340
        val bmp = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bmp)
        val paint = Paint(Paint.ANTI_ALIAS_FLAG)

        when (preset.category) {
            "Nature" -> {
                // Alpine mountain golden sunset gradient
                paint.shader = LinearGradient(
                    0f, 0f, 0f, h.toFloat(),
                    intArrayOf(Color.parseColor("#1B2A47"), Color.parseColor("#D97736"), Color.parseColor("#E5A65E")),
                    floatArrayOf(0f, 0.45f, 1f),
                    Shader.TileMode.CLAMP
                )
                canvas.drawRect(0f, 0f, w.toFloat(), h.toFloat(), paint)

                // Mountain peaks
                paint.shader = null
                paint.color = Color.parseColor("#1C2333")
                val path = Path().apply {
                    moveTo(0f, h * 0.42f)
                    lineTo(w * 0.35f, h * 0.28f)
                    lineTo(w * 0.65f, h * 0.38f)
                    lineTo(w.toFloat(), h * 0.25f)
                    lineTo(w.toFloat(), h.toFloat())
                    lineTo(0f, h.toFloat())
                    close()
                }
                canvas.drawPath(path, paint)
            }
            "Vehicles" -> {
                // Architectural modern showroom dark minimalist gradient
                paint.shader = LinearGradient(
                    0f, 0f, 0f, h.toFloat(),
                    intArrayOf(Color.parseColor("#0F172A"), Color.parseColor("#1E293B"), Color.parseColor("#0F172A")),
                    null,
                    Shader.TileMode.CLAMP
                )
                canvas.drawRect(0f, 0f, w.toFloat(), h.toFloat(), paint)

                // Studio soft lighting beam
                paint.shader = RadialGradient(
                    w * 0.5f, h * 0.3f, w * 0.6f,
                    Color.parseColor("#334155"), Color.TRANSPARENT, Shader.TileMode.CLAMP
                )
                canvas.drawCircle(w * 0.5f, h * 0.3f, w * 0.6f, paint)
            }
            "Abstract" -> {
                // Smooth desert dunes / velvet midnight
                paint.shader = LinearGradient(
                    0f, 0f, 0f, h.toFloat(),
                    intArrayOf(Color.parseColor("#090A0F"), Color.parseColor("#141E30"), Color.parseColor("#243B55")),
                    null,
                    Shader.TileMode.CLAMP
                )
                canvas.drawRect(0f, 0f, w.toFloat(), h.toFloat(), paint)
            }
            "Aerospace" -> {
                // Sunset sky with golden orange clouds
                paint.shader = LinearGradient(
                    0f, 0f, 0f, h.toFloat(),
                    intArrayOf(Color.parseColor("#0D1B2A"), Color.parseColor("#415A77"), Color.parseColor("#E0A96D")),
                    null,
                    Shader.TileMode.CLAMP
                )
                canvas.drawRect(0f, 0f, w.toFloat(), h.toFloat(), paint)
            }
            else -> {
                // Noir / Dark luxury
                paint.shader = LinearGradient(
                    0f, 0f, 0f, h.toFloat(),
                    intArrayOf(Color.parseColor("#0A0A0A"), Color.parseColor("#1A1A1A"), Color.parseColor("#111111")),
                    null,
                    Shader.TileMode.CLAMP
                )
                canvas.drawRect(0f, 0f, w.toFloat(), h.toFloat(), paint)
            }
        }
        return bmp
    }

    private fun generatePresetFg(preset: WallpaperPreset): Bitmap {
        val w = 1080
        val h = 2340
        val bmp = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bmp)
        val paint = Paint(Paint.ANTI_ALIAS_FLAG)

        when (preset.category) {
            "Nature" -> {
                // Rustic Cottage roof & golden slope covering the lower half
                paint.color = Color.parseColor("#4A3728")
                val cottagePath = Path().apply {
                    moveTo(w * 0.2f, h * 0.62f)
                    lineTo(w * 0.5f, h * 0.46f) // Cottage peak roof
                    lineTo(w * 0.8f, h * 0.62f)
                    lineTo(w.toFloat(), h * 0.68f)
                    lineTo(w.toFloat(), h.toFloat())
                    lineTo(0f, h.toFloat())
                    lineTo(0f, h * 0.68f)
                    close()
                }
                canvas.drawPath(cottagePath, paint)

                // Cottage chimney and warm details
                paint.color = Color.parseColor("#2C1E14")
                canvas.drawRect(w * 0.62f, h * 0.42f, w * 0.70f, h * 0.52f, paint)

                // Forefront golden grass
                paint.color = Color.parseColor("#8C6B38")
                canvas.drawOval(RectF(-w * 0.2f, h * 0.65f, w * 1.2f, h * 1.1f), paint)
            }
            "Vehicles" -> {
                // Superbike silhouette with headlight / body frame
                paint.color = Color.parseColor("#E2E8F0")
                val bikePath = Path().apply {
                    moveTo(w * 0.15f, h * 0.60f)
                    lineTo(w * 0.45f, h * 0.48f) // Handlebar / windshield peak
                    lineTo(w * 0.75f, h * 0.56f)
                    lineTo(w * 0.85f, h * 0.75f)
                    lineTo(w.toFloat(), h.toFloat())
                    lineTo(0f, h.toFloat())
                    close()
                }
                canvas.drawPath(bikePath, paint)

                // Crimson accent stripes
                paint.color = Color.parseColor("#EF4444")
                canvas.drawCircle(w * 0.45f, h * 0.54f, 40f, paint)
            }
            "Abstract" -> {
                // Dunes crest folding in front of the clock
                paint.color = Color.parseColor("#1E293B")
                val dunePath = Path().apply {
                    moveTo(0f, h * 0.52f)
                    cubicTo(w * 0.3f, h * 0.44f, w * 0.6f, h * 0.58f, w.toFloat(), h * 0.46f)
                    lineTo(w.toFloat(), h.toFloat())
                    lineTo(0f, h.toFloat())
                    close()
                }
                canvas.drawPath(dunePath, paint)
            }
            "Aerospace" -> {
                // Fighter jet climbing through center foreground
                paint.color = Color.parseColor("#334155")
                val jetPath = Path().apply {
                    moveTo(w * 0.5f, h * 0.38f) // Jet nose cone
                    lineTo(w * 0.78f, h * 0.58f) // Right delta wing
                    lineTo(w * 0.65f, h * 0.64f)
                    lineTo(w * 0.55f, h * 0.72f)
                    lineTo(w * 0.45f, h * 0.72f)
                    lineTo(w * 0.35f, h * 0.64f)
                    lineTo(w * 0.22f, h * 0.58f) // Left delta wing
                    close()
                }
                canvas.drawPath(jetPath, paint)
            }
            else -> {
                // Silhouette figure / portrait
                paint.color = Color.parseColor("#171717")
                val personPath = Path().apply {
                    moveTo(w * 0.35f, h * 0.42f)
                    cubicTo(w * 0.38f, h * 0.32f, w * 0.62f, h * 0.32f, w * 0.65f, h * 0.42f)
                    lineTo(w * 0.85f, h * 0.60f)
                    lineTo(w.toFloat(), h.toFloat())
                    lineTo(0f, h.toFloat())
                    lineTo(w * 0.15f, h * 0.60f)
                    close()
                }
                canvas.drawPath(personPath, paint)
            }
        }
        return bmp
    }
}
