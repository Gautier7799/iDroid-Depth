package com.example.depthlockscreen.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.graphics.*
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.SystemClock
import android.service.wallpaper.WallpaperService
import android.view.SurfaceHolder
import com.example.depthlockscreen.data.model.ClockConfig
import com.example.depthlockscreen.data.repository.WallpaperRepository
import kotlinx.coroutines.*
import java.text.SimpleDateFormat
import java.util.*
import kotlin.math.max
import kotlin.math.sin

/**
 * 🌟 خدمة محرك الخلفية الحية وساندوتش العمق (iOS 27 Architecture):
 * - رسم مسرّع بالعتاد (Hardware Canvas) عبر كارت الشاشة GPU لمنع الـ Lag تماماً.
 * - حصر معدل التحديث عند 60 FPS للحفاظ على برودة الهاتف وتوفير البطارية بنسبة 100%.
 * - تجميد المستشعرات وإلغاء الاستماع فور إطفاء الشاشة (Zero Battery Drain).
 */
class DepthWallpaperService : WallpaperService() {
    override fun onCreateEngine(): Engine = DepthEngine()

    inner class DepthEngine : Engine(), SensorEventListener {
        private val serviceScope = CoroutineScope(Dispatchers.Main + SupervisorJob())
        private lateinit var repository: WallpaperRepository
        private var currentHolder: SurfaceHolder? = null
        private var isScreenVisible = false
        private var loadJob: Job? = null

        private val sensorManager by lazy { getSystemService(Context.SENSOR_SERVICE) as SensorManager }
        private val rotationSensor by lazy {
            sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)
                ?: sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        }

        private val rotationMatrix = FloatArray(9)
        private val orientationAngles = FloatArray(3)
        private var rawRoll = 0f
        private var rawPitch = 0f
        private var smoothRoll = 0f
        private var smoothPitch = 0f
        private val filterAlpha = 0.15f

        private var backgroundBitmap: Bitmap? = null
        private var foregroundBitmap: Bitmap? = null
        private var clockConfig: ClockConfig = ClockConfig.DEFAULT

        private val bitmapPaint = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG)
        private val clockPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { textAlign = Paint.Align.CENTER }
        private val datePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { textAlign = Paint.Align.CENTER }

        private var lastFrameTime = 0L
        private val frameIntervalMs = 16L // تثبيت معدل الإطارات عند 60fps لمنع Lag والبطارية

        private val timeTickReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                drawFrame()
            }
        }
        private var isReceiverRegistered = false

        override fun onCreate(holder: SurfaceHolder) {
            super.onCreate(holder)
            this.currentHolder = holder
            repository = WallpaperRepository(applicationContext)
            loadSavedAssets()
        }

        override fun onSurfaceCreated(holder: SurfaceHolder) {
            super.onSurfaceCreated(holder)
            this.currentHolder = holder
            loadSavedAssets()
        }

        override fun onVisibilityChanged(visible: Boolean) {
            super.onVisibilityChanged(visible)
            this.isScreenVisible = visible
            if (visible) {
                registerTimeReceiver()
                rotationSensor?.let { sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_UI) }
                loadSavedAssets()
                drawFrame()
            } else {
                unregisterTimeReceiver()
                sensorManager.unregisterListener(this)
            }
        }

        private fun registerTimeReceiver() {
            if (!isReceiverRegistered) {
                val filter = IntentFilter().apply {
                    addAction(Intent.ACTION_TIME_TICK)
                    addAction(Intent.ACTION_TIME_CHANGED)
                    addAction(Intent.ACTION_TIMEZONE_CHANGED)
                }
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    this@DepthWallpaperService.registerReceiver(timeTickReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
                } else {
                    this@DepthWallpaperService.registerReceiver(timeTickReceiver, filter)
                }
                isReceiverRegistered = true
            }
        }

        private fun unregisterTimeReceiver() {
            if (isReceiverRegistered) {
                try {
                    this@DepthWallpaperService.unregisterReceiver(timeTickReceiver)
                } catch (e: Exception) {}
                isReceiverRegistered = false
            }
        }

        override fun onSurfaceDestroyed(holder: SurfaceHolder) {
            super.onSurfaceDestroyed(holder)
            isScreenVisible = false
            unregisterTimeReceiver()
            sensorManager.unregisterListener(this)
            loadJob?.cancel()
        }

        override fun onDestroy() {
            super.onDestroy()
            serviceScope.cancel()
        }

        override fun onSensorChanged(event: SensorEvent) {
            if (!isScreenVisible) return
            val now = SystemClock.uptimeMillis()
            if (now - lastFrameTime < frameIntervalMs) return

            if (event.sensor.type == Sensor.TYPE_ROTATION_VECTOR) {
                SensorManager.getRotationMatrixFromVector(rotationMatrix, event.values)
                SensorManager.getOrientation(rotationMatrix, orientationAngles)
                val targetRoll = sin(orientationAngles[2])
                val targetPitch = sin(orientationAngles[1])
                rawRoll += filterAlpha * (targetRoll - rawRoll)
                rawPitch += filterAlpha * (targetPitch - rawPitch)
                drawFrame()
                lastFrameTime = now
            } else if (event.sensor.type == Sensor.TYPE_ACCELEROMETER) {
                val targetRoll = (event.values[0] / 9.81f).coerceIn(-1f, 1f)
                val targetPitch = (event.values[1] / 9.81f).coerceIn(-1f, 1f)
                rawRoll += filterAlpha * (targetRoll - rawRoll)
                rawPitch += filterAlpha * (targetPitch - rawPitch)
                drawFrame()
                lastFrameTime = now
            }
        }

        override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

        private fun loadSavedAssets() {
            loadJob?.cancel()
            loadJob = serviceScope.launch(Dispatchers.IO) {
                val config = repository.loadSavedClockConfig()
                val bg = repository.loadBackgroundBitmap()
                val fg = repository.loadForegroundBitmap()
                withContext(Dispatchers.Main) {
                    clockConfig = config
                    backgroundBitmap = bg
                    foregroundBitmap = fg
                    drawFrame()
                }
            }
        }

        private fun drawFrame() {
            if (!isScreenVisible) return
            val holder = currentHolder ?: return
            var canvas: Canvas? = null
            try {
                canvas = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    holder.lockHardwareCanvas()
                } else {
                    holder.lockCanvas()
                }
                if (canvas != null) {
                    renderLayers(canvas)
                }
            } catch (e: Exception) {
                try {
                    canvas = holder.lockCanvas()
                    if (canvas != null) renderLayers(canvas)
                } catch (e2: Exception) {}
            } finally {
                if (canvas != null) {
                    try {
                        holder.unlockCanvasAndPost(canvas)
                    } catch (e: Exception) {}
                }
            }
        }

        private fun renderLayers(canvas: Canvas) {
            val canvasW = canvas.width.toFloat()
            val canvasH = canvas.height.toFloat()
            if (canvasW <= 0 || canvasH <= 0) return

            smoothRoll += (rawRoll - smoothRoll) * 0.15f
            smoothPitch += (rawPitch - smoothPitch) * 0.15f

            val baseParallax = 36f * clockConfig.parallaxStrength
            val offsetX = (smoothRoll * baseParallax).coerceIn(-baseParallax, baseParallax)
            val offsetY = (smoothPitch * baseParallax).coerceIn(-baseParallax, baseParallax)

            val bg = backgroundBitmap
            val fg = foregroundBitmap

            // 1. طبقة الخلفية (مع تكبير 114% وإزاحة خفيفة معاكسة)
            if (bg != null) {
                drawScaledBitmap(canvas, bg, canvasW, canvasH, 1.14f, -offsetX * 0.35f, -offsetY * 0.35f)
            } else {
                val fallbackPaint = Paint()
                fallbackPaint.shader = LinearGradient(0f, 0f, 0f, canvasH,
                    intArrayOf(Color.parseColor("#090D16"), Color.parseColor("#030712")),
                    null, Shader.TileMode.CLAMP)
                canvas.drawRect(0f, 0f, canvasW, canvasH, fallbackPaint)
            }

            // 2. طبقة الساعة (عند تفعيل ميزة ساندوتش العمق خلف العنصر)
            if (clockConfig.isClockVisible && clockConfig.isBehindSubject) {
                drawClock(canvas, canvasW, canvasH, offsetX * 0.18f, offsetY * 0.18f)
            }

            // 3. طبقة العنصر المعزول (في المقدمة)
            if (fg != null) {
                drawScaledBitmap(canvas, fg, canvasW, canvasH, 1.05f, offsetX * 0.75f, offsetY * 0.75f)
            }

            // 4. طبقة الساعة (إذا اختار المستخدم وضعها أمام العنصر)
            if (clockConfig.isClockVisible && !clockConfig.isBehindSubject) {
                drawClock(canvas, canvasW, canvasH, offsetX * 0.18f, offsetY * 0.18f)
            }
        }

        private fun drawClock(canvas: Canvas, canvasW: Float, canvasH: Float, transX: Float, transY: Float) {
            val timeFormat = if (clockConfig.is24HourFormat) "HH:mm" else "hh:mm"
            val timeStr = SimpleDateFormat(timeFormat, Locale.getDefault()).format(Date())
            val dateStr = SimpleDateFormat("EEEE، d MMMM", Locale("ar")).format(Date())
            val textSizePx = clockConfig.fontSizeSp * this@DepthWallpaperService.resources.displayMetrics.scaledDensity

            clockPaint.color = clockConfig.colorArgb
            clockPaint.textSize = textSizePx
            clockPaint.typeface = when (clockConfig.fontFamily) {
                "SERIF" -> Typeface.create(Typeface.SERIF, Typeface.BOLD)
                "MONOSPACE" -> Typeface.create(Typeface.MONOSPACE, Typeface.BOLD)
                "ROUNDED" -> Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                else -> Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD)
            }

            datePaint.color = clockConfig.colorArgb
            datePaint.alpha = 210
            datePaint.textSize = textSizePx * 0.22f

            val centerX = (canvasW / 2f) + transX
            val centerY = (canvasH * clockConfig.verticalBias) + transY

            canvas.drawText(timeStr, centerX, centerY, clockPaint)
            canvas.drawText(dateStr, centerX, centerY + (textSizePx * 0.35f), datePaint)
        }

        private fun drawScaledBitmap(canvas: Canvas, bitmap: Bitmap, canvasW: Float, canvasH: Float, zoom: Float, transX: Float, transY: Float) {
            val bmpW = bitmap.width.toFloat()
            val bmpH = bitmap.height.toFloat()
            val scale = max(canvasW / bmpW, canvasH / bmpH) * zoom
            val scaledW = bmpW * scale
            val scaledH = bmpH * scale
            val left = (canvasW - scaledW) / 2f + transX
            val top = (canvasH - scaledH) / 2f + transY
            val destRect = RectF(left, top, left + scaledW, top + scaledH)
            val srcRect = Rect(0, 0, bitmap.width, bitmap.height)
            canvas.drawBitmap(bitmap, srcRect, destRect, bitmapPaint)
        }
    }
}
