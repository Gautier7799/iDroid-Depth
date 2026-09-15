package com.example.depthlockscreen.data.repository

import android.content.Context
import android.content.SharedPreferences
import android.graphics.*
import com.example.depthlockscreen.data.model.ClockConfig
import com.example.depthlockscreen.data.model.WallpaperPreset
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import kotlin.math.max

class WallpaperRepository(private val context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("depth_wallpaper_prefs", Context.MODE_PRIVATE)

    suspend fun saveAssets(background: Bitmap, foreground: Bitmap, config: ClockConfig) = withContext(Dispatchers.IO) {
        val optBg = downscaleBitmap(background, 1280)
        val optFg = downscaleBitmap(foreground, 1280)
        val bgFile = File(context.filesDir, "bg_layer.png")
        val fgFile = File(context.filesDir, "fg_subject.png")
        FileOutputStream(bgFile).use { optBg.compress(Bitmap.CompressFormat.PNG, 95, it) }
        FileOutputStream(fgFile).use { optFg.compress(Bitmap.CompressFormat.PNG, 95, it) }
        saveClockConfig(config)
    }

    suspend fun applyPreset(presetId: String): Pair<Bitmap, Bitmap> = withContext(Dispatchers.IO) {
        val bg = generatePresetBg(presetId)
        val fg = generatePresetFg(presetId)
        val preset = WallpaperPreset.ALL.find { it.id == presetId } ?: WallpaperPreset.ALL[0]
        val currentConfig = loadSavedClockConfig().copy(
            verticalBias = preset.defaultVerticalBias,
            fontSizeSp = preset.defaultFontSize,
            fontFamily = preset.defaultFontFamily,
            colorArgb = Color.parseColor(preset.accentColorHex)
        )
        saveAssets(bg, fg, currentConfig)
        Pair(bg, fg)
    }

    fun saveClockConfig(config: ClockConfig) {
        prefs.edit()
            .putBoolean("isClockVisible", config.isClockVisible)
            .putBoolean("isBehindSubject", config.isBehindSubject)
            .putInt("colorArgb", config.colorArgb)
            .putFloat("fontSizeSp", config.fontSizeSp)
            .putFloat("verticalBias", config.verticalBias)
            .putBoolean("is24HourFormat", config.is24HourFormat)
            .putFloat("parallaxStrength", config.parallaxStrength)
            .putString("fontFamily", config.fontFamily)
            .apply()
    }

    suspend fun loadBackgroundBitmap(): Bitmap = withContext(Dispatchers.IO) {
        try {
            val file = File(context.filesDir, "bg_layer.png")
            if (file.exists()) {
                BitmapFactory.decodeFile(file.absolutePath) ?: generatePresetBg("CYBERPUNK")
            } else {
                generatePresetBg("CYBERPUNK")
            }
        } catch (e: Exception) {
            generatePresetBg("CYBERPUNK")
        }
    }

    suspend fun loadForegroundBitmap(): Bitmap = withContext(Dispatchers.IO) {
        try {
            val file = File(context.filesDir, "fg_subject.png")
            if (file.exists()) {
                BitmapFactory.decodeFile(file.absolutePath) ?: generatePresetFg("CYBERPUNK")
            } else {
                generatePresetFg("CYBERPUNK")
            }
        } catch (e: Exception) {
            generatePresetFg("CYBERPUNK")
        }
    }

    fun loadSavedClockConfig(): ClockConfig {
        return ClockConfig(
            isClockVisible = prefs.getBoolean("isClockVisible", true),
            isBehindSubject = prefs.getBoolean("isBehindSubject", true),
            colorArgb = prefs.getInt("colorArgb", Color.WHITE),
            fontSizeSp = prefs.getFloat("fontSizeSp", 88f),
            verticalBias = prefs.getFloat("verticalBias", 0.22f),
            is24HourFormat = prefs.getBoolean("is24HourFormat", true),
            parallaxStrength = prefs.getFloat("parallaxStrength", 1.0f),
            fontFamily = prefs.getString("fontFamily", "SF_BOLD") ?: "SF_BOLD"
        )
    }

    fun downscaleBitmap(source: Bitmap, maxDim: Int = 1280): Bitmap {
        val w = source.width
        val h = source.height
        if (w <= maxDim && h <= maxDim) return source
        val ratio = w.toFloat() / h.toFloat()
        val newW = if (ratio > 1f) maxDim else (maxDim * ratio).toInt()
        val newH = if (ratio > 1f) (maxDim / ratio).toInt() else maxDim
        return Bitmap.createScaledBitmap(source, max(1, newW), max(1, newH), true)
    }

    fun generatePresetBg(presetId: String): Bitmap {
        val bmp = Bitmap.createBitmap(720, 1280, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bmp)
        val paint = Paint(Paint.ANTI_ALIAS_FLAG)

        when (presetId) {
            "ALPINE" -> {
                // شروق الشمس على قمم الجبال الجليدية
                paint.shader = LinearGradient(0f, 0f, 0f, 1280f,
                    intArrayOf(Color.parseColor("#1E1B4B"), Color.parseColor("#4338CA"), Color.parseColor("#F59E0B"), Color.parseColor("#1E293B")),
                    floatArrayOf(0f, 0.35f, 0.70f, 1f), Shader.TileMode.CLAMP)
                canvas.drawRect(0f, 0f, 720f, 1280f, paint)
                paint.shader = null

                // قمم الجبال
                paint.color = Color.parseColor("#0F172A")
                val mountainPath = Path().apply {
                    moveTo(0f, 1280f)
                    lineTo(0f, 850f)
                    lineTo(220f, 650f)
                    lineTo(440f, 790f)
                    lineTo(720f, 600f)
                    lineTo(720f, 1280f)
                    close()
                }
                canvas.drawPath(mountainPath, paint)
            }
            "ECLIPSE" -> {
                // فضاء كوني وأفق الكسوف مع سديم متوهج
                paint.shader = RadialGradient(360f, 400f, 500f,
                    intArrayOf(Color.parseColor("#EC4899"), Color.parseColor("#4C1D95"), Color.parseColor("#030712")),
                    floatArrayOf(0f, 0.45f, 1f), Shader.TileMode.CLAMP)
                canvas.drawRect(0f, 0f, 720f, 1280f, paint)
                paint.shader = null

                // هالة الكسوف
                paint.color = Color.parseColor("#F472B6")
                paint.style = Paint.Style.STROKE
                paint.strokeWidth = 6f
                canvas.drawCircle(360f, 380f, 170f, paint)
                paint.style = Paint.Style.FILL
            }
            "HYPERCAR" -> {
                // مضمار سباق ليلي وأضواء المدينة النيون
                paint.shader = LinearGradient(0f, 0f, 0f, 1280f,
                    intArrayOf(Color.parseColor("#022C22"), Color.parseColor("#064E3B"), Color.parseColor("#0F172A")),
                    floatArrayOf(0f, 0.4f, 1f), Shader.TileMode.CLAMP)
                canvas.drawRect(0f, 0f, 720f, 1280f, paint)
                paint.shader = null

                // خطوط السرعة النيون
                paint.color = Color.parseColor("#10B981")
                paint.strokeWidth = 3f
                paint.style = Paint.Style.STROKE
                canvas.drawLine(100f, 1280f, 320f, 700f, paint)
                canvas.drawLine(620f, 1280f, 400f, 700f, paint)
                paint.style = Paint.Style.FILL
            }
            else -> {
                // CYBERPUNK: أفق مدينة النيون المستقبلية الممطرة
                paint.shader = LinearGradient(0f, 0f, 0f, 1280f,
                    intArrayOf(Color.parseColor("#090D16"), Color.parseColor("#1E1B4B"), Color.parseColor("#311042"), Color.parseColor("#050811")),
                    floatArrayOf(0f, 0.4f, 0.75f, 1f), Shader.TileMode.CLAMP)
                canvas.drawRect(0f, 0f, 720f, 1280f, paint)
                paint.shader = null

                // ناطحات سحاب
                paint.color = Color.parseColor("#0F172A")
                canvas.drawRect(60f, 580f, 250f, 1280f, paint)
                canvas.drawRect(290f, 480f, 490f, 1280f, paint)
                canvas.drawRect(510f, 620f, 680f, 1280f, paint)

                // نوافذ نيون
                paint.color = Color.parseColor("#0284C7")
                canvas.drawRect(100f, 650f, 120f, 680f, paint)
                canvas.drawRect(330f, 550f, 350f, 580f, paint)
                canvas.drawRect(550f, 700f, 570f, 730f, paint)
            }
        }
        return bmp
    }

    fun generatePresetFg(presetId: String): Bitmap {
        val bmp = Bitmap.createBitmap(720, 1280, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bmp)
        val paint = Paint(Paint.ANTI_ALIAS_FLAG)

        when (presetId) {
            "ALPINE" -> {
                // نسر القمم الألبية المعزول
                paint.color = Color.parseColor("#D97706")
                val eaglePath = Path().apply {
                    moveTo(360f, 380f)
                    lineTo(460f, 430f)
                    lineTo(620f, 370f)
                    lineTo(480f, 500f)
                    lineTo(520f, 620f)
                    lineTo(360f, 540f)
                    lineTo(200f, 620f)
                    lineTo(240f, 500f)
                    lineTo(100f, 370f)
                    lineTo(260f, 430f)
                    close()
                }
                canvas.drawPath(eaglePath, paint)

                paint.color = Color.parseColor("#FDE68A")
                canvas.drawCircle(360f, 380f, 40f, paint)
            }
            "ECLIPSE" -> {
                // كوكب وأقمار بظل سينمائي
                paint.color = Color.parseColor("#18181B")
                canvas.drawCircle(360f, 440f, 140f, paint)

                // توهج حافة الكوكب (Rim Light)
                paint.color = Color.parseColor("#F472B6")
                paint.style = Paint.Style.STROKE
                paint.strokeWidth = 14f
                val oval = RectF(220f, 300f, 500f, 580f)
                canvas.drawArc(oval, 180f, 180f, false, paint)
                paint.style = Paint.Style.FILL
            }
            "HYPERCAR" -> {
                // سيارة سباق رياضية معزولة
                paint.color = Color.parseColor("#059669")
                val carPath = Path().apply {
                    moveTo(240f, 520f)
                    quadTo(360f, 470f, 480f, 520f)
                    lineTo(560f, 630f)
                    lineTo(580f, 850f)
                    lineTo(140f, 850f)
                    lineTo(160f, 630f)
                    close()
                }
                canvas.drawPath(carPath, paint)

                // مصابيح LED متوهجة
                paint.color = Color.parseColor("#34D399")
                canvas.drawRect(210f, 600f, 270f, 620f, paint)
                canvas.drawRect(450f, 600f, 510f, 620f, paint)
            }
            else -> {
                // CYBERPUNK: شخصية متجول النيون مع هودي وسترة متوهجة
                paint.color = Color.parseColor("#E11D48")
                val bodyPath = Path().apply {
                    moveTo(360f, 410f)
                    quadTo(460f, 410f, 480f, 550f)
                    quadTo(520f, 750f, 540f, 1280f)
                    lineTo(180f, 1280f)
                    quadTo(200f, 750f, 240f, 550f)
                    quadTo(260f, 410f, 360f, 410f)
                    close()
                }
                canvas.drawPath(bodyPath, paint)

                // الرأس مع قناع نيون
                paint.color = Color.parseColor("#FDA4AF")
                canvas.drawCircle(360f, 380f, 76f, paint)

                // قناع متوهج بأسلوب سايبربانك
                paint.color = Color.parseColor("#0284C7")
                canvas.drawRoundRect(RectF(320f, 370f, 400f, 410f), 12f, 12f, paint)
            }
        }
        return bmp
    }
}
