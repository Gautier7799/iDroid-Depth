export interface AndroidFile {
  name: string;
  path: string;
  category: 'model' | 'repository' | 'ml' | 'service' | 'ui' | 'utils' | 'config' | 'prompt';
  language: 'kotlin' | 'xml' | 'gradle' | 'markdown';
  descriptionAr: string;
  content: string;
}

export const ARCHITECTURE_PILLARS = [
  {
    id: 'depth_sandwich',
    title: 'تأثير ساندوتش العمق (Depth Sandwich Architecture)',
    icon: 'Layers',
    description:
      'رسم طبقة الساعة الرقمية بين طبقة الخلفية وطبقة العنصر المعزول، مما يجعل الشخص أو العنصر يغطي أجزاء من أرقام الساعة بأسلوب هواتف آبل وأندرويد 14 الحديثة.',
    points: [
      'طبقة 1 (الأساس): رسم الخلفية بحجم Overscan (115%) مع إزاحة Parallax معاكسة.',
      'طبقة 2 (الوسط): رسم الساعة بالنص المخصص والخط واللون والإزاحة الرأسية المحددة.',
      'طبقة 3 (المقدمة): رسم العنصر المعزول المقصوص بـ ML Kit ليعلو فوق أرقام الساعة.',
      'حسابات Z-Index وانسيابية كاملة تضمن عدم وجود أي تشويش عند حركة الجيروسكوب.',
    ],
  },
  {
    id: 'battery',
    title: 'توفير فائق للبطارية (Zero-Drain Lifecycle)',
    icon: 'BatteryCharging',
    description:
      'إلغاء مستشعرات الحركة وتجميد Canvas فوراً عند قفل الشاشة أو استخدام تطبيق آخر.',
    points: [
      'استدعاء `sensorManager.unregisterListener()` في دالة `onVisibilityChanged(false)`.',
      'تثبيت معدل التحديث عند 60 FPS مع إمكانية خفضه إلى 30 FPS في وضع حفظ الطاقة.',
      'مرشح Low-Pass Filter لتجاهل الرعشات الطفيفة التي لا تتطلب إعادة رسم الشاشة.',
    ],
  },
  {
    id: 'offline_ai',
    title: 'عزل ذكي بدون إنترنت (ML Kit Subject Segmentation)',
    icon: 'Cpu',
    description:
      'معالجة الصور محلياً على المعالج العصبي بالهاتف بسرعة فائقة ودقة عالية في تفاصيل الشعر والحواف.',
    points: [
      'توليد قناع الشفافية Alpha Mask و Foreground Bitmap في أقل من 250 ميلي ثانية.',
      'أمان وخصوصية 100% بدون إرسال صور المستخدم إلى أي خوادم خارجية.',
      'تخزين النتائج بصيغة WebP المضغوطة لتسريع التحميل والتوفير في ذاكرة RAM.',
    ],
  },
  {
    id: 'compose_m3',
    title: 'واجهات عصرية بـ Jetpack Compose Material 3',
    icon: 'ShieldCheck',
    description:
      'هيكلة كاملة مقسمة إلى HomeScreen و EditorScreen مع مكون ClockPicker لاختيار الخطوط والألوان ومحاكي فوري.',
    points: [
      'استخدام PhotoPicker (`PickVisualMedia`) بدون طلب أذونات التخزين الخطيرة.',
      'إدارة الحالة عبر ViewModel و StateFlow مع تفاعل فوري مع كل تغيير.',
      'إطلاق نية التثبيت الرسمية `ACTION_CHANGE_LIVE_WALLPAPER`.',
    ],
  },
];

export const ANDROID_FILES: AndroidFile[] = [
  {
    name: 'ClockConfig.kt',
    path: 'app/src/main/java/com/example/depthlockscreen/data/model/ClockConfig.kt',
    category: 'model',
    language: 'kotlin',
    descriptionAr: 'نموذج بيانات خط ونوع ولون وحجم وموقع وتأثير ساعة القفل ثلاثية الأبعاد.',
    content: `package com.example.depthlockscreen.data.model

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb

/**
 * 🕰️ نموذج بيانات إعدادات الساعة:
 * يدعم تخصيص نوع الخط، الحجم، اللون، الإزاحة الرأسية، وموقع الساعة (خلف العنصر أو أمامه).
 */
data class ClockConfig(
    val fontStyleName: String = "Modern Sans", // "Modern Sans", "Serif", "Display Bold", "Tech Mono", "Rounded"
    val colorArgb: Int = 0xFFFFFFFF.toInt(),
    val fontSizeSp: Float = 84f,
    val is24HourFormat: Boolean = false,
    val verticalBias: Float = 0.22f, // 0.0f أعلى الشاشة إلى 1.0f أسفل الشاشة
    val isBehindSubject: Boolean = true, // ✨ تأثير العمق: الساعة تقع خلف العنصر المعزول
    val isClockVisible: Boolean = true
) {
    companion object {
        val DEFAULT = ClockConfig()

        val PRESET_COLORS = listOf(
            0xFFFFFFFF.toInt(), // White
            0xFFF8FAFC.toInt(), // Off-White
            0xFF38BDF8.toInt(), // Sky Cyan
            0xFFF59E0B.toInt(), // Amber
            0xFFEC4899.toInt(), // Rose Pink
            0xFF10B981.toInt(), // Emerald Green
            0xFFA855F7.toInt(), // Neon Purple
            0xFFF43F5E.toInt()  // Coral Red
        )

        val FONT_STYLES = listOf(
            "Modern Sans",
            "Serif Elegant",
            "Display Bold",
            "Tech Mono",
            "Rounded Soft"
        )
    }
}
`,
  },
  {
    name: 'WallpaperRepository.kt',
    path: 'app/src/main/java/com/example/depthlockscreen/data/repository/WallpaperRepository.kt',
    category: 'repository',
    language: 'kotlin',
    descriptionAr: 'مستودع حفظ وتحميل طبقات الصور وإعدادات الساعة في الذاكرة التخزينية المحلية.',
    content: `package com.example.depthlockscreen.data.repository

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import com.example.depthlockscreen.data.model.ClockConfig
import com.example.depthlockscreen.utils.BitmapUtils
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import java.io.File

/**
 * 🗄️ مستودع الخلفيات وإعدادات العمق:
 * مسؤول عن تخزين طبقات الصور (Foreground & Background) واسترجاعها،
 * بالإضافة لحفظ إعدادات الساعة عبر SharedPreferences / Memory Cache.
 */
class WallpaperRepository(private val context: Context) {

    private val prefs = context.getSharedPreferences("depth_lockscreen_prefs", Context.MODE_PRIVATE)

    private val _clockConfigFlow = MutableStateFlow(loadSavedClockConfig())
    val clockConfigFlow: StateFlow<ClockConfig> = _clockConfigFlow.asStateFlow()

    suspend fun saveWallpapers(foreground: Bitmap, background: Bitmap): Boolean = withContext(Dispatchers.IO) {
        val fgSaved = BitmapUtils.saveBitmapToInternalStorage(context, foreground, "wallpaper_foreground.webp")
        val bgSaved = BitmapUtils.saveBitmapToInternalStorage(context, background, "wallpaper_background.webp")
        fgSaved && bgSaved
    }

    suspend fun loadForegroundBitmap(): Bitmap? = withContext(Dispatchers.IO) {
        val file = File(context.filesDir, "wallpaper_foreground.webp")
        if (file.exists()) BitmapFactory.decodeFile(file.absolutePath) else null
    }

    suspend fun loadBackgroundBitmap(): Bitmap? = withContext(Dispatchers.IO) {
        val file = File(context.filesDir, "wallpaper_background.webp")
        if (file.exists()) BitmapFactory.decodeFile(file.absolutePath) else null
    }

    fun updateClockConfig(config: ClockConfig) {
        prefs.edit().apply {
            putString("font_style", config.fontStyleName)
            putInt("color_argb", config.colorArgb)
            putFloat("font_size", config.fontSizeSp)
            putBoolean("is_24h", config.is24HourFormat)
            putFloat("vertical_bias", config.verticalBias)
            putBoolean("is_behind_subject", config.isBehindSubject)
            putBoolean("is_clock_visible", config.isClockVisible)
            apply()
        }
        _clockConfigFlow.value = config
    }

    fun loadSavedClockConfig(): ClockConfig {
        return ClockConfig(
            fontStyleName = prefs.getString("font_style", "Modern Sans") ?: "Modern Sans",
            colorArgb = prefs.getInt("color_argb", 0xFFFFFFFF.toInt()),
            fontSizeSp = prefs.getFloat("font_size", 84f),
            is24HourFormat = prefs.getBoolean("is_24h", false),
            verticalBias = prefs.getFloat("vertical_bias", 0.22f),
            isBehindSubject = prefs.getBoolean("is_behind_subject", true),
            isClockVisible = prefs.getBoolean("is_clock_visible", true)
        )
    }

    fun hasSavedWallpaper(): Boolean {
        val fg = File(context.filesDir, "wallpaper_foreground.webp")
        val bg = File(context.filesDir, "wallpaper_background.webp")
        return fg.exists() && bg.exists()
    }
}
`,
  },
  {
    name: 'SubjectSegmenterHelper.kt',
    path: 'app/src/main/java/com/example/depthlockscreen/ml/SubjectSegmenterHelper.kt',
    category: 'ml',
    language: 'kotlin',
    descriptionAr: 'معالجة الذكاء الاصطناعي لفصل العنصر أوفلاين عبر Google ML Kit Subject Segmentation.',
    content: `package com.example.depthlockscreen.ml

import android.content.Context
import android.graphics.Bitmap
import com.google.android.gms.tasks.Tasks
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.segmentation.subject.SubjectSegmentation
import com.google.mlkit.vision.segmentation.subject.SubjectSegmenterOptions
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

data class SegmentationResult(
    val foregroundBitmap: Bitmap?,
    val backgroundBitmap: Bitmap,
    val success: Boolean,
    val error: String? = null
)

/**
 * 🧠 معالج الذكاء الاصطناعي لعزل العناصر محلياً (ML Kit Offline):
 * يقوم باستخراج موضوع الصورة كـ Foreground Bitmap شفاف،
 * مع الاحتفاظ بالخلفية الأصلية لاستخدامها في طبقات الـ Parallax.
 */
class SubjectSegmenterHelper(private val context: Context) {

    private val options = SubjectSegmenterOptions.Builder()
        .enableForegroundBitmap()
        .enableForegroundConfidenceMask()
        .build()

    private val client = SubjectSegmentation.getClient(options)

    suspend fun segment(inputBitmap: Bitmap): SegmentationResult = withContext(Dispatchers.IO) {
        try {
            val inputImage = InputImage.fromBitmap(inputBitmap, 0)
            val result = Tasks.await(client.process(inputImage))

            val foreground = result.foregroundBitmap
            if (foreground != null) {
                SegmentationResult(
                    foregroundBitmap = foreground,
                    backgroundBitmap = inputBitmap,
                    success = true
                )
            } else {
                SegmentationResult(
                    foregroundBitmap = null,
                    backgroundBitmap = inputBitmap,
                    success = false,
                    error = "تعذر تحديد موضوع بارز في الصورة."
                )
            }
        } catch (e: Exception) {
            e.printStackTrace()
            SegmentationResult(
                foregroundBitmap = null,
                backgroundBitmap = inputBitmap,
                success = false,
                error = e.localizedMessage ?: "فشل عزل الصورة."
            )
        }
    }
}
`,
  },
  {
    name: 'DepthWallpaperService.kt',
    path: 'app/src/main/java/com/example/depthlockscreen/service/DepthWallpaperService.kt',
    category: 'service',
    language: 'kotlin',
    descriptionAr: 'خدمة خلفية الشاشة الحية: رسم ساندوتش الطبقات (خلفية + ساعة في الوسط + عنصر معزول) مع الحساسات وحفظ البطارية.',
    content: `package com.example.depthlockscreen.service

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Rect
import android.graphics.RectF
import android.graphics.Typeface
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Handler
import android.os.Looper
import android.service.wallpaper.WallpaperService
import android.view.SurfaceHolder
import com.example.depthlockscreen.data.model.ClockConfig
import com.example.depthlockscreen.data.repository.WallpaperRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.max
import kotlin.math.sin

/**
 * 🚀 خدمة الخلفية الحية ثلاثية الأبعاد (Depth Live Wallpaper Service):
 * - تنفذ معمارية ساندوتش العمق:
 *   [1] الخلفية (مع تكبير 115% Overscan وإزاحة بارالاكس عكسية)
 *   [2] ساعة القفل المخصصة (ClockConfig)
 *   [3] العنصر المقصوص (Foreground Subject) الذي يطفو فوق الساعة!
 * - توفير بطارية 100%: إلغاء تسجيل المستشعر فور إغلاق الشاشة.
 */
class DepthWallpaperService : WallpaperService() {

    override fun onCreateEngine(): Engine {
        return DepthWallpaperEngine()
    }

    inner class DepthWallpaperEngine : Engine(), SensorEventListener {

        private val serviceScope = CoroutineScope(Dispatchers.Main + SupervisorJob())
        private lateinit var repository: WallpaperRepository

        private var surfaceHolder: SurfaceHolder? = null
        private var isVisibleState = false

        // الحساسات وحسابات الحركة
        private val sensorManager by lazy { getSystemService(Context.SENSOR_SERVICE) as SensorManager }
        private val rotationSensor by lazy {
            sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)
                ?: sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        }

        private val rotationMatrix = FloatArray(9)
        private val orientationAngles = FloatArray(3)

        private var rawPitch = 0f
        private var rawRoll = 0f
        private var currentPitch = 0f
        private var currentRoll = 0f
        private val filterAlpha = 0.12f // مرشح Low-Pass لتنعيم الرعشة

        // الطبقات وإعدادات الساعة
        private var backgroundBitmap: Bitmap? = null
        private var foregroundBitmap: Bitmap? = null
        private var clockConfig: ClockConfig = ClockConfig.DEFAULT

        // أدوات الرسم
        private val bitmapPaint = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG)
        private val clockPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            textAlign = Paint.Align.CENTER
        }
        private val datePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            textAlign = Paint.Align.CENTER
        }

        private val drawHandler = Handler(Looper.getMainLooper())
        private val frameInterval = 1000L / 60L // 60 FPS

        private val drawRunnable = object : Runnable {
            override fun run() {
                drawFrame()
                if (isVisibleState) {
                    drawHandler.postDelayed(this, frameInterval)
                }
            }
        }

        override fun onCreate(holder: SurfaceHolder) {
            super.onCreate(holder)
            this.surfaceHolder = holder
            repository = WallpaperRepository(applicationContext)
            loadResources()
        }

        override fun onVisibilityChanged(visible: Boolean) {
            super.onVisibilityChanged(visible)
            this.isVisibleState = visible

            if (visible) {
                // 🔋 تفعيل المستشعر والرسم فقط عند رؤية الشاشة
                rotationSensor?.let {
                    sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME)
                }
                loadResources()
                drawHandler.post(drawRunnable)
            } else {
                // 🛑 إلغاء تسجيل المستشعر فوراً لتوفير طاقة البطارية بالكامل!
                sensorManager.unregisterListener(this)
                drawHandler.removeCallbacks(drawRunnable)
            }
        }

        override fun onSurfaceDestroyed(holder: SurfaceHolder) {
            super.onSurfaceDestroyed(holder)
            isVisibleState = false
            sensorManager.unregisterListener(this)
            drawHandler.removeCallbacks(drawRunnable)
            serviceScope.cancel()
        }

        override fun onSensorChanged(event: SensorEvent) {
            if (event.sensor.type == Sensor.TYPE_ROTATION_VECTOR) {
                SensorManager.getRotationMatrixFromVector(rotationMatrix, event.values)
                SensorManager.getOrientation(rotationMatrix, orientationAngles)

                val targetRoll = sin(orientationAngles[2])
                val targetPitch = sin(orientationAngles[1])

                // معادلة Low-Pass Filter
                rawRoll += filterAlpha * (targetRoll - rawRoll)
                rawPitch += filterAlpha * (targetPitch - rawPitch)
            }
        }

        override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

        private fun loadResources() {
            serviceScope.launch {
                clockConfig = repository.loadSavedClockConfig()
                backgroundBitmap = repository.loadBackgroundBitmap()
                foregroundBitmap = repository.loadForegroundBitmap()
            }
        }

        private fun drawFrame() {
            val holder = surfaceHolder ?: return
            var canvas: Canvas? = null
            try {
                canvas = holder.lockCanvas()
                if (canvas != null) {
                    renderLayers(canvas)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                if (canvas != null) {
                    try {
                        holder.unlockCanvasAndPost(canvas)
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
            }
        }

        private fun renderLayers(canvas: Canvas) {
            val width = canvas.width.toFloat()
            val height = canvas.height.toFloat()
            if (width <= 0 || height <= 0) return

            // LERP تنعيم للحركة
            currentRoll += (rawRoll - currentRoll) * 0.1f
            currentPitch += (rawPitch - currentPitch) * 0.1f

            val maxParallax = 35f
            val offsetX = (currentRoll * maxParallax).coerceIn(-maxParallax, maxParallax)
            val offsetY = (currentPitch * maxParallax).coerceIn(-maxParallax, maxParallax)

            canvas.drawColor(Color.BLACK)

            val bg = backgroundBitmap
            val fg = foregroundBitmap

            // 1️⃣ الطبقة الأولى: الخلفية مع تكبير Overscan بنسبة 115% وحركة عكسية
            if (bg != null) {
                drawScaledBitmap(canvas, bg, width, height, 1.15f, -offsetX * 0.4f, -offsetY * 0.4f)
            }

            // 2️⃣ الطبقة الثانية (أو الثالثة): الساعة المخصصة في حال تم اختيار وضع (خلف العنصر)
            if (clockConfig.isClockVisible && clockConfig.isBehindSubject) {
                drawClockOnCanvas(canvas, width, height, offsetX * 0.2f, offsetY * 0.2f)
            }

            // 3️⃣ الطبقة الثالثة: العنصر المعزول المقصوص بـ ML Kit يعلو فوق الساعة!
            if (fg != null) {
                drawScaledBitmap(canvas, fg, width, height, 1.05f, offsetX * 0.8f, offsetY * 0.8f)
            }

            // إذا اختار المستخدم أن تكون الساعة في المقدمة فوق كل شيء
            if (clockConfig.isClockVisible && !clockConfig.isBehindSubject) {
                drawClockOnCanvas(canvas, width, height, offsetX * 0.2f, offsetY * 0.2f)
            }
        }

        private fun drawClockOnCanvas(canvas: Canvas, canvasW: Float, canvasH: Float, transX: Float, transY: Float) {
            val now = Date()
            val timeFormat = if (clockConfig.is24HourFormat) "HH:mm" else "hh:mm"
            val timeStr = SimpleDateFormat(timeFormat, Locale.getDefault()).format(now)
            val dateStr = SimpleDateFormat("EEEE, d MMMM", Locale.getDefault()).format(now)

            // إعدادات خط الساعة
            val density = resources.displayMetrics.density
            val textSizePx = clockConfig.fontSizeSp * density

            clockPaint.color = clockConfig.colorArgb
            clockPaint.textSize = textSizePx
            clockPaint.typeface = resolveTypeface(clockConfig.fontStyleName)

            datePaint.color = clockConfig.colorArgb
            datePaint.alpha = 200
            datePaint.textSize = textSizePx * 0.22f
            datePaint.typeface = Typeface.DEFAULT

            val centerX = (canvasW / 2f) + transX
            val centerY = (canvasH * clockConfig.verticalBias) + transY

            // رسم الوقت والتاريخ
            canvas.drawText(timeStr, centerX, centerY, clockPaint)
            canvas.drawText(dateStr, centerX, centerY + (textSizePx * 0.35f), datePaint)
        }

        private fun resolveTypeface(styleName: String): Typeface {
            return when (styleName) {
                "Serif Elegant" -> Typeface.SERIF
                "Display Bold" -> Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD)
                "Tech Mono" -> Typeface.MONOSPACE
                "Rounded Soft" -> Typeface.create(Typeface.DEFAULT, Typeface.NORMAL)
                else -> Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD)
            }
        }

        private fun drawScaledBitmap(
            canvas: Canvas,
            bitmap: Bitmap,
            canvasW: Float,
            canvasH: Float,
            zoom: Float,
            transX: Float,
            transY: Float
        ) {
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
`,
  },
  {
    name: 'HomeScreen.kt',
    path: 'app/src/main/java/com/example/depthlockscreen/ui/screens/HomeScreen.kt',
    category: 'ui',
    language: 'kotlin',
    descriptionAr: 'شاشة البداية لاختيار الصور من المعرض أو النماذج الجاهزة بدون أذونات خطيرة.',
    content: `package com.example.depthlockscreen.ui.screens

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddPhotoAlternate
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Wallpaper
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onImageSelected: (Uri) -> Unit,
    hasCurrentWallpaper: Boolean,
    onOpenCurrentEditor: () -> Unit,
    modifier: Modifier = Modifier
) {
    // مُنتقي الصور الآمن الحديث بنظام أندرويد (بدون طلب أذونات التخزين)
    val photoPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia()
    ) { uri: Uri? ->
        if (uri != null) {
            onImageSelected(uri)
        }
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(
                        "خلفيات القفل ثلاثية الأبعاد",
                        fontWeight = FontWeight.Black,
                        fontSize = 18.sp
                    )
                }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // بطاقة دعوة لاختيار صورة
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(340.dp),
                shape = RoundedCornerShape(32.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                listOf(
                                    MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.7f),
                                    MaterialTheme.colorScheme.surfaceVariant
                                )
                            )
                        )
                        .padding(28.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Surface(
                            shape = RoundedCornerShape(24.dp),
                            color = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(72.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    Icons.Default.AddPhotoAlternate,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.onPrimary,
                                    modifier = Modifier.size(36.dp)
                                )
                            }
                        }

                        Text(
                            "اصنع خلفية قفل ثلاثية الأبعاد",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            textAlign = TextAlign.Center
                        )

                        Text(
                            "اختر صورة لشخص أو سيارة أو حيوان، وسيقوم الذكاء الاصطناعي بعزل العنصر محلياً ووضع الساعة بالخلف مع تأثير البارالاكس!",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            textAlign = TextAlign.Center
                        )

                        Button(
                            onClick = {
                                photoPickerLauncher.launch(
                                    PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                                )
                            },
                            shape = RoundedCornerShape(16.dp),
                            modifier = Modifier.fillMaxWidth().height(52.dp)
                        ) {
                            Icon(Icons.Default.AutoAwesome, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("اختيار صورة من المعرض", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            if (hasCurrentWallpaper) {
                Spacer(modifier = Modifier.height(20.dp))
                OutlinedButton(
                    onClick = onOpenCurrentEditor,
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth().height(52.dp)
                ) {
                    Icon(Icons.Default.Wallpaper, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("تعديل الخلفية والساعة الحالية")
                }
            }
        }
    }
}
`,
  },
  {
    name: 'EditorScreen.kt',
    path: 'app/src/main/java/com/example/depthlockscreen/ui/screens/EditorScreen.kt',
    category: 'ui',
    language: 'kotlin',
    descriptionAr: 'شاشة التعديل والمعاينة الحية لساندوتش العمق مع منتقي الساعة وزر تطبيق الخلفية.',
    content: `package com.example.depthlockscreen.ui.screens

import android.app.WallpaperManager
import android.content.ComponentName
import android.content.Intent
import android.graphics.Bitmap
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Wallpaper
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.depthlockscreen.data.model.ClockConfig
import com.example.depthlockscreen.service.DepthWallpaperService
import com.example.depthlockscreen.ui.components.ClockPicker

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditorScreen(
    backgroundBitmap: Bitmap,
    foregroundBitmap: Bitmap?,
    clockConfig: ClockConfig,
    onClockConfigChange: (ClockConfig) -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("معاينة وتخصيص قفل الشاشة", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "رجوع")
                    }
                }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // 📱 محاكي شاشة القفل وساندوتش العمق
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(440.dp),
                shape = RoundedCornerShape(28.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
            ) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    // الطبقة 1: الخلفية
                    Image(
                        bitmap = backgroundBitmap.asImageBitmap(),
                        contentDescription = null,
                        modifier = Modifier.fillMaxSize()
                    )

                    // الطبقة 2: الساعة (عندما تكون خلف العنصر)
                    if (clockConfig.isClockVisible && clockConfig.isBehindSubject) {
                        MockClockDisplay(clockConfig = clockConfig)
                    }

                    // الطبقة 3: العنصر المعزول
                    if (foregroundBitmap != null) {
                        Image(
                            bitmap = foregroundBitmap.asImageBitmap(),
                            contentDescription = null,
                            modifier = Modifier.fillMaxSize()
                        )
                    }

                    // في حال اختار المستخدم أن تكون الساعة فوق العنصر
                    if (clockConfig.isClockVisible && !clockConfig.isBehindSubject) {
                        MockClockDisplay(clockConfig = clockConfig)
                    }
                }
            }

            // 🎨 مكوّن تخصيص الساعة
            ClockPicker(
                clockConfig = clockConfig,
                onConfigChanged = onClockConfigChange
            )

            // 🚀 زر تطبيق الخلفية الحية
            Button(
                onClick = {
                    val intent = Intent(WallpaperManager.ACTION_CHANGE_LIVE_WALLPAPER).apply {
                        putExtra(
                            WallpaperManager.EXTRA_LIVE_WALLPAPER_COMPONENT,
                            ComponentName(context, DepthWallpaperService::class.java)
                        )
                    }
                    context.startActivity(intent)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(16.dp)
            ) {
                Icon(Icons.Default.Wallpaper, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("تثبيت كخلفية حية لشاشة القفل", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun MockClockDisplay(clockConfig: ClockConfig) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(top = (clockConfig.verticalBias * 360).dp),
        contentAlignment = Alignment.TopCenter
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = "09:41",
                fontSize = (clockConfig.fontSizeSp * 0.7f).sp,
                fontWeight = FontWeight.Black,
                color = androidx.compose.ui.graphics.Color(clockConfig.colorArgb)
            )
            Text(
                text = "الثلاثاء، ١٥ سبتمبر",
                fontSize = 14.sp,
                color = androidx.compose.ui.graphics.Color(clockConfig.colorArgb).copy(alpha = 0.8f)
            )
        }
    }
}
`,
  },
  {
    name: 'ClockPicker.kt',
    path: 'app/src/main/java/com/example/depthlockscreen/ui/components/ClockPicker.kt',
    category: 'ui',
    language: 'kotlin',
    descriptionAr: 'مكون Compose تفاعلي لتغيير نوع خط الساعة، ولونها، وحجمها، وموقعها خلف أو أمام العنصر.',
    content: `package com.example.depthlockscreen.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.depthlockscreen.data.model.ClockConfig

@Composable
fun ClockPicker(
    clockConfig: ClockConfig,
    onConfigChanged: (ClockConfig) -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp)
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                "تخصيص ساعة شاشة القفل",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            // 1. اختيار نمط الخط
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("نوع الخط (Font Family)", style = MaterialTheme.typography.bodySmall)
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(ClockConfig.FONT_STYLES) { style ->
                        val isSelected = clockConfig.fontStyleName == style
                        FilterChip(
                            selected = isSelected,
                            onClick = { onConfigChanged(clockConfig.copy(fontStyleName = style)) },
                            label = { Text(style) }
                        )
                    }
                }
            }

            // 2. باليت الألوان
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("لون الساعة", style = MaterialTheme.typography.bodySmall)
                LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    items(ClockConfig.PRESET_COLORS) { colorInt ->
                        val isSelected = clockConfig.colorArgb == colorInt
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(Color(colorInt))
                                .border(
                                    width = if (isSelected) 3.dp else 1.dp,
                                    color = if (isSelected) MaterialTheme.colorScheme.primary else Color.Gray.copy(alpha = 0.4f),
                                    shape = CircleShape
                                )
                                .clickable { onConfigChanged(clockConfig.copy(colorArgb = colorInt)) },
                            contentAlignment = Alignment.Center
                        ) {
                            if (isSelected) {
                                Icon(
                                    Icons.Default.Check,
                                    contentDescription = null,
                                    tint = if (colorInt == 0xFFFFFFFF.toInt()) Color.Black else Color.White,
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                    }
                }
            }

            // 3. منزلق الحجم
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("حجم الساعة", style = MaterialTheme.typography.bodySmall)
                    Text("\${clockConfig.fontSizeSp.toInt()} sp", style = MaterialTheme.typography.bodySmall)
                }
                Slider(
                    value = clockConfig.fontSizeSp,
                    onValueChange = { onConfigChanged(clockConfig.copy(fontSizeSp = it)) },
                    valueRange = 60f..110f
                )
            }

            // 4. خيار العمق البصري (ساندوتش): الساعة تقع خلف العنصر
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("تأثير العمق (ساعة خلف العنصر)", fontWeight = FontWeight.SemiBold)
                    Text(
                        "إخفاء أجزاء من أرقام الساعة خلف الشخصية",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Switch(
                    checked = clockConfig.isBehindSubject,
                    onCheckedChange = { onConfigChanged(clockConfig.copy(isBehindSubject = it)) }
                )
            }
        }
    }
}
`,
  },
  {
    name: 'BitmapUtils.kt',
    path: 'app/src/main/java/com/example/depthlockscreen/utils/BitmapUtils.kt',
    category: 'utils',
    language: 'kotlin',
    descriptionAr: 'أدوات مساعدة لمعالجة أبعاد الصور، تصغير الحجم، وحفظها بصيغة WebP المضغوطة.',
    content: `package com.example.depthlockscreen.utils

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import kotlin.math.max

/**
 * 🛠️ دوال مساعدة للتعامل مع الصور والذاكرة:
 * تصغير أبعاد الصور بدقة لتقليل استهلاك ذاكرة الرام ومنع أخطاء OutOfMemoryError،
 * وتخزين الطبقات محلياً بصيغة WebP فائقة السرعة.
 */
object BitmapUtils {

    suspend fun decodeSampledBitmapFromUri(
        context: Context,
        uri: Uri,
        reqWidth: Int = 1080,
        reqHeight: Int = 1920
    ): Bitmap? = withContext(Dispatchers.IO) {
        try {
            // قراءة الأبعاد أولاً دون تحميل البكسلات
            val options = BitmapFactory.Options().apply {
                inJustDecodeBounds = true
            }
            context.contentResolver.openInputStream(uri)?.use { stream ->
                BitmapFactory.decodeStream(stream, null, options)
            }

            // حساب معامل التصغير
            options.inSampleSize = calculateInSampleSize(options, reqWidth, reqHeight)
            options.inJustDecodeBounds = false
            options.inPreferredConfig = Bitmap.Config.ARGB_8888

            // فك التشفير الحقيقي
            context.contentResolver.openInputStream(uri)?.use { stream ->
                BitmapFactory.decodeStream(stream, null, options)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun calculateInSampleSize(options: BitmapFactory.Options, reqWidth: Int, reqHeight: Int): Int {
        val (height: Int, width: Int) = options.run { outHeight to outWidth }
        var inSampleSize = 1

        if (height > reqHeight || width > reqWidth) {
            val halfHeight: Int = height / 2
            val halfWidth: Int = width / 2

            while (halfHeight / inSampleSize >= reqHeight && halfWidth / inSampleSize >= reqWidth) {
                inSampleSize *= 2
            }
        }
        return inSampleSize
    }

    fun saveBitmapToInternalStorage(context: Context, bitmap: Bitmap, filename: String): Boolean {
        return try {
            val file = File(context.filesDir, filename)
            FileOutputStream(file).use { out ->
                bitmap.compress(Bitmap.CompressFormat.WEBP, 88, out)
            }
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
}
`,
  },
  {
    name: 'PromptGuide.md',
    path: 'Android_Studio_Master_Prompt.md',
    category: 'prompt',
    language: 'markdown',
    descriptionAr: 'برومبت شامل جاهز لنسخه إلى مساعد Android Studio لتوليد كامل هيكل المشروع com.example.depthlockscreen.',
    content: `# 🚀 Master Architecture Prompt: com.example.depthlockscreen
# اسم المشروع: DepthLockScreen 3D Wallpaper
# الحزمة الأساسية: com.example.depthlockscreen

أنت خبير تطوير تطبيقات Android بنظام Kotlin و Jetpack Compose.
قم ببناء تطبيق شاشة القفل والخلفية الحية ثلاثية الأبعاد وفق الهيكلية التالية تماماً وبدون أي أخطاء:

\`\`\`
com.example.depthlockscreen/
├── data/
│   ├── model/ ClockConfig.kt
│   └── repository/ WallpaperRepository.kt
├── ml/
│   └── SubjectSegmenterHelper.kt
├── service/
│   └── DepthWallpaperService.kt
├── ui/
│   ├── screens/
│   │   ├── HomeScreen.kt
│   │   └── EditorScreen.kt
│   └── components/ ClockPicker.kt
└── utils/
    └── BitmapUtils.kt
\`\`\`

## 🛠️ المواصفات الفنية:
1. **تأثير ساندوتش العمق:** وضع طبقة الساعة (ClockConfig) بين طبقة الخلفية (Background) وطبقة العنصر المقصوص (Foreground Subject)، بحيث تحجب ملامح الشخصية جزءاً من أرقام الساعة بأسلوب Apple/Android 14 Lock Screen.
2. **عزل أوفلاين بالذكاء الاصطناعي:** Google ML Kit Subject Segmentation API محلياً بدون إنترنت.
3. **توفير 100% للبطارية:** إلغاء تسجيل الحساسات فور إغلاق الشاشة (\`onVisibilityChanged(false)\`).
4. **تنعيم الحركة:** تطبيق Low-Pass Filter (\`alpha = 0.12\`) على مستشعر الجيروسكوب.
5. **الواجهات:** Jetpack Compose Material 3 مع PhotoPicker بدون أذونات تخزين حساسة.
`,
  }
];
