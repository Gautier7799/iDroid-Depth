package com.example.depthlockscreen

import android.content.ActivityNotFoundException
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.provider.Settings
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.depthlockscreen.data.model.ClockConfig
import com.example.depthlockscreen.data.model.WallpaperPreset
import com.example.depthlockscreen.data.repository.WallpaperRepository
import com.example.depthlockscreen.ml.SubjectSegmenterHelper
import com.example.depthlockscreen.service.DepthWallpaperService
import com.example.depthlockscreen.ui.theme.DepthLockScreenTheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.*
import kotlin.math.roundToInt

class MainActivity : ComponentActivity(), SensorEventListener {

    private val sensorManager by lazy { getSystemService(Context.SENSOR_SERVICE) as SensorManager }
    private val rotationSensor by lazy {
        sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)
            ?: sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
    }

    private var liveRoll = mutableFloatStateOf(0f)
    private var livePitch = mutableFloatStateOf(0f)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            DepthLockScreenTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF030712)
                ) {
                    Ios27DepthStudio(
                        roll = liveRoll.floatValue,
                        pitch = livePitch.floatValue
                    )
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        rotationSensor?.let {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME)
        }
    }

    override fun onPause() {
        super.onPause()
        sensorManager.unregisterListener(this)
    }

    override fun onSensorChanged(event: SensorEvent) {
        if (event.sensor.type == Sensor.TYPE_ROTATION_VECTOR) {
            val rotationMatrix = FloatArray(9)
            val orientationAngles = FloatArray(3)
            SensorManager.getRotationMatrixFromVector(rotationMatrix, event.values)
            SensorManager.getOrientation(rotationMatrix, orientationAngles)
            liveRoll.floatValue = kotlin.math.sin(orientationAngles[2])
            livePitch.floatValue = kotlin.math.sin(orientationAngles[1])
        } else if (event.sensor.type == Sensor.TYPE_ACCELEROMETER) {
            liveRoll.floatValue = (event.values[0] / 9.81f).coerceIn(-1f, 1f)
            livePitch.floatValue = (event.values[1] / 9.81f).coerceIn(-1f, 1f)
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun Ios27DepthStudio(
    roll: Float,
    pitch: Float
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val repo = remember { WallpaperRepository(context) }
    val segmenter = remember { SubjectSegmenterHelper(context) }

    var clockConfig by remember { mutableStateOf(repo.loadSavedClockConfig()) }
    var bgBitmap by remember { mutableStateOf<Bitmap?>(null) }
    var fgBitmap by remember { mutableStateOf<Bitmap?>(null) }
    var isProcessing by remember { mutableStateOf(false) }
    var selectedPresetId by remember { mutableStateOf("CYBERPUNK") }
    var isExploded3D by remember { mutableStateOf(false) }

    // محاكاة الإمالة عبر السحب باللمس في حال كان الجهاز ثابتاً
    var dragTiltX by remember { mutableFloatStateOf(0f) }
    var dragTiltY by remember { mutableFloatStateOf(0f) }

    // التحقق من حالة استثناء البطارية
    val powerManager = remember { context.getSystemService(Context.POWER_SERVICE) as PowerManager }
    var isBatteryOptimizedIgnored by remember {
        mutableStateOf(
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                powerManager.isIgnoringBatteryOptimizations(context.packageName)
            } else true
        )
    }

    // تحميل الخلفيات الأولية
    LaunchedEffect(Unit) {
        bgBitmap = repo.loadBackgroundBitmap()
        fgBitmap = repo.loadForegroundBitmap()
    }

    // منتقي الصور الحديث بدون أذونات خطيرة
    val photoPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia()
    ) { uri: Uri? ->
        if (uri != null) {
            scope.launch {
                isProcessing = true
                try {
                    val stream = context.contentResolver.openInputStream(uri)
                    val original = BitmapFactory.decodeStream(stream)
                    if (original != null) {
                        val optimizedBg = repo.downscaleBitmap(original, 1280)
                        val extractedFg = segmenter.extractForegroundSubject(optimizedBg)
                        bgBitmap = optimizedBg
                        fgBitmap = extractedFg
                        repo.saveAssets(optimizedBg, extractedFg, clockConfig)
                        Toast.makeText(context, "✨ تم عزل موضوع الصورة بنجاح!", Toast.LENGTH_SHORT).show()
                    }
                } catch (e: Exception) {
                    Toast.makeText(context, "حدث خطأ أثناء معالجة الصورة", Toast.LENGTH_SHORT).show()
                } finally {
                    isProcessing = false
                }
            }
        }
    }

    // دمج حركة المستشعر مع السحب باللمس
    val effectiveRoll = (roll + dragTiltX).coerceIn(-1f, 1f)
    val effectivePitch = (pitch + dragTiltY).coerceIn(-1f, 1f)

    Scaffold(
        containerColor = Color(0xFF030712),
        bottomBar = {
            // شريط العمليات السفلي الفاخر بنمط iOS 27 Glassmorphism
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(28.dp),
                color = Color(0xFF0F172A).copy(alpha = 0.85f),
                border = BorderStroke(1.dp, Color(0xFF38BDF8).copy(alpha = 0.35f)),
                shadowElevation = 16.dp
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Button(
                        onClick = { launchWallpaperIntent(context) },
                        modifier = Modifier
                            .weight(1f)
                            .height(54.dp),
                        shape = RoundedCornerShape(20.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF0284C7)
                        ),
                        elevation = ButtonDefaults.buttonElevation(defaultElevation = 8.dp)
                    ) {
                        Icon(Icons.Default.Wallpaper, contentDescription = null, tint = Color.White)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            "تعيين كخلفية قفل 3D",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = Color.White
                        )
                    }

                    // زر عزل صورة المستخدم
                    FilledTonalIconButton(
                        onClick = {
                            photoPicker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
                        },
                        modifier = Modifier.size(54.dp),
                        shape = RoundedCornerShape(20.dp),
                        colors = IconButtonDefaults.filledTonalIconButtonColors(
                            containerColor = Color(0xFF1E293B)
                        )
                    ) {
                        Icon(
                            Icons.Default.AddPhotoAlternate,
                            contentDescription = "جلب صورة",
                            tint = Color(0xFF38BDF8)
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(12.dp))

            // 1. Dynamic Island الجزيرة التفاعلية بنمط iOS 27
            Surface(
                shape = RoundedCornerShape(32.dp),
                color = Color(0xFF0B0F19),
                border = BorderStroke(1.dp, Color(0xFF1E293B)),
                modifier = Modifier
                    .fillMaxWidth(0.92f)
                    .height(48.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(10.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF10B981))
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            "iOS 27 Depth Engine",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = Color(0xFF38BDF8).copy(alpha = 0.15f)
                        ) {
                            Text(
                                "60 FPS GPU",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF38BDF8),
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }

                        IconButton(
                            onClick = { isExploded3D = !isExploded3D },
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(
                                Icons.Default.Layers,
                                contentDescription = "طبقات 3D",
                                tint = if (isExploded3D) Color(0xFF38BDF8) else Color(0xFF94A3B8),
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 2. محاكي الهاتف ثلاثي الأبعاد المباشر (The Live 3D Phone Stage)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp)
                    .pointerInput(Unit) {
                        detectDragGestures(
                            onDragEnd = {
                                dragTiltX = 0f
                                dragTiltY = 0f
                            },
                            onDrag = { change, dragAmount ->
                                change.consume()
                                dragTiltX = (dragTiltX + dragAmount.x / 400f).coerceIn(-1f, 1f)
                                dragTiltY = (dragTiltY + dragAmount.y / 400f).coerceIn(-1f, 1f)
                            }
                        )
                    },
                contentAlignment = Alignment.Center
            ) {
                PhoneStageView(
                    bgBitmap = bgBitmap,
                    fgBitmap = fgBitmap,
                    clockConfig = clockConfig,
                    roll = effectiveRoll,
                    pitch = effectivePitch,
                    isExploded = isExploded3D
                )

                if (isProcessing) {
                    Box(
                        modifier = Modifier
                            .size(280.dp, 560.dp)
                            .clip(RoundedCornerShape(44.dp))
                            .background(Color.Black.copy(alpha = 0.75f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            CircularProgressIndicator(color = Color(0xFF38BDF8))
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                "جاري عزل الشخصية بالذكاء الاصطناعي...",
                                color = Color.White,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // 3. معرض الثيمات الفاخرة (iOS 27 Luxury Preset Carousel)
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
            ) {
                Text(
                    "ثيمات iOS 27 الجاهزة للعمق",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Spacer(modifier = Modifier.height(10.dp))

                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(WallpaperPreset.ALL) { preset ->
                        val isSelected = selectedPresetId == preset.id
                        Surface(
                            shape = RoundedCornerShape(20.dp),
                            color = if (isSelected) Color(0xFF0F172A) else Color(0xFF0B0F19),
                            border = BorderStroke(
                                if (isSelected) 2.dp else 1.dp,
                                if (isSelected) Color(android.graphics.Color.parseColor(preset.accentColorHex)) else Color(0xFF1E293B)
                            ),
                            onClick = {
                                selectedPresetId = preset.id
                                scope.launch {
                                    val pair = repo.applyPreset(preset.id)
                                    bgBitmap = pair.first
                                    fgBitmap = pair.second
                                    clockConfig = repo.loadSavedClockConfig()
                                }
                            },
                            modifier = Modifier
                                .width(150.dp)
                                .height(85.dp)
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(12.dp),
                                verticalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(12.dp)
                                            .clip(CircleShape)
                                            .background(Color(android.graphics.Color.parseColor(preset.accentColorHex)))
                                    )
                                    if (isSelected) {
                                        Icon(
                                            Icons.Default.CheckCircle,
                                            contentDescription = null,
                                            tint = Color(android.graphics.Color.parseColor(preset.accentColorHex)),
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                }
                                Column {
                                    Text(
                                        preset.title,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                    Text(
                                        preset.subtitle,
                                        fontSize = 10.sp,
                                        color = Color(0xFF94A3B8)
                                    )
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // 4. استوديو تخصيص الساعة والعمق (Clock Depth Studio)
            Surface(
                modifier = Modifier
                    .fillMaxWidth(0.92f)
                    .clip(RoundedCornerShape(24.dp)),
                color = Color(0xFF0B0F19),
                border = BorderStroke(1.dp, Color(0xFF1E293B))
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            "استوديو ساندوتش العمق",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = if (clockConfig.isBehindSubject) Color(0xFF0284C7).copy(alpha = 0.2f) else Color(0xFF334155)
                        ) {
                            Text(
                                if (clockConfig.isBehindSubject) "خلف العنصر (Depth)" else "أمام العنصر",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (clockConfig.isBehindSubject) Color(0xFF38BDF8) else Color(0xFF94A3B8),
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // مفتاح العمق
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = Color(0xFF131B2E),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text("تأثير ساندوتش العمق", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = Color.White)
                                Text("إخفاء أجزاء من أرقام الساعة خلف الشخصية بأسلوب أبل", fontSize = 11.sp, color = Color(0xFF94A3B8))
                            }
                            Switch(
                                checked = clockConfig.isBehindSubject,
                                onCheckedChange = {
                                    clockConfig = clockConfig.copy(isBehindSubject = it)
                                    repo.saveClockConfig(clockConfig)
                                },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Color.White,
                                    checkedTrackColor = Color(0xFF0284C7)
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // اختيار الخط
                    Text("نوع خط الساعة:", fontSize = 12.sp, color = Color(0xFF94A3B8))
                    Spacer(modifier = Modifier.height(8.dp))
                    val fonts = listOf(
                        "SF Pro Bold" to "SF_BOLD",
                        "Serif Elegant" to "SERIF",
                        "Future Mono" to "MONOSPACE",
                        "Soft Rounded" to "ROUNDED"
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        fonts.take(2).forEach { (label, key) ->
                            val isSel = clockConfig.fontFamily == key
                            Surface(
                                onClick = {
                                    clockConfig = clockConfig.copy(fontFamily = key)
                                    repo.saveClockConfig(clockConfig)
                                },
                                color = if (isSel) Color(0xFF0284C7) else Color(0xFF1E293B),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.weight(1f).height(40.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Text(label, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                }
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        fonts.drop(2).forEach { (label, key) ->
                            val isSel = clockConfig.fontFamily == key
                            Surface(
                                onClick = {
                                    clockConfig = clockConfig.copy(fontFamily = key)
                                    repo.saveClockConfig(clockConfig)
                                },
                                color = if (isSel) Color(0xFF0284C7) else Color(0xFF1E293B),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.weight(1f).height(40.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Text(label, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // اختيار اللون
                    Text("ألوان الساعة والأرقام:", fontSize = 12.sp, color = Color(0xFF94A3B8))
                    Spacer(modifier = Modifier.height(8.dp))
                    val colors = listOf(
                        Color(0xFFFFFFFF),
                        Color(0xFF38BDF8),
                        Color(0xFFF59E0B),
                        Color(0xFFEC4899),
                        Color(0xFF10B981),
                        Color(0xFFA855F7),
                        Color(0xFFF43F5E)
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        colors.forEach { col ->
                            val isSel = clockConfig.colorArgb == col.toArgb()
                            Box(
                                modifier = Modifier
                                    .size(34.dp)
                                    .clip(CircleShape)
                                    .background(col)
                                    .clickable {
                                        clockConfig = clockConfig.copy(colorArgb = col.toArgb())
                                        repo.saveClockConfig(clockConfig)
                                    }
                                    .border(
                                        width = if (isSel) 3.dp else 1.dp,
                                        color = if (isSel) Color(0xFF38BDF8) else Color(0xFF334155),
                                        shape = CircleShape
                                    )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // موضع الساعة الرأسي
                    Text("موضع الساعة الرأسي (${(clockConfig.verticalBias * 100).toInt()}%):", fontSize = 12.sp, color = Color(0xFF94A3B8))
                    Slider(
                        value = clockConfig.verticalBias,
                        onValueChange = {
                            clockConfig = clockConfig.copy(verticalBias = it)
                            repo.saveClockConfig(clockConfig)
                        },
                        valueRange = 0.12f..0.45f,
                        colors = SliderDefaults.colors(
                            thumbColor = Color(0xFF38BDF8),
                            activeTrackColor = Color(0xFF0284C7)
                        )
                    )

                    // حجم خط الساعة
                    Text("حجم خط الساعة (${clockConfig.fontSizeSp.toInt()} sp):", fontSize = 12.sp, color = Color(0xFF94A3B8))
                    Slider(
                        value = clockConfig.fontSizeSp,
                        onValueChange = {
                            clockConfig = clockConfig.copy(fontSizeSp = it)
                            repo.saveClockConfig(clockConfig)
                        },
                        valueRange = 60f..120f,
                        colors = SliderDefaults.colors(
                            thumbColor = Color(0xFF38BDF8),
                            activeTrackColor = Color(0xFF0284C7)
                        )
                    )

                    // حساسية وقوة حركة 3D
                    Text("قوة تأثير الحركة ثلاثية الأبعاد (3D Parallax):", fontSize = 12.sp, color = Color(0xFF94A3B8))
                    Slider(
                        value = clockConfig.parallaxStrength,
                        onValueChange = {
                            clockConfig = clockConfig.copy(parallaxStrength = it)
                            repo.saveClockConfig(clockConfig)
                        },
                        valueRange = 0.0f..2.5f,
                        colors = SliderDefaults.colors(
                            thumbColor = Color(0xFF38BDF8),
                            activeTrackColor = Color(0xFF0284C7)
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // 5. بطاقة الأذونات وصلوحيات استقرار النظام (Stability & Permissions Card)
            Surface(
                modifier = Modifier
                    .fillMaxWidth(0.92f)
                    .clip(RoundedCornerShape(24.dp)),
                color = Color(0xFF0B0F19),
                border = BorderStroke(1.dp, Color(0xFF1E293B))
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Default.Shield,
                            contentDescription = null,
                            tint = Color(0xFF10B981),
                            modifier = Modifier.size(22.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            "صلوحيات واستقرار التطبيق في الهاتف",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = Color.White
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        "لضمان استمرار عمل الخلفية ثلاثية الأبعاد بدون أن يقوم نظام أندرويد (شاومي/سامسونغ) بإغلاقها لتوفير الطاقة:",
                        fontSize = 11.sp,
                        color = Color(0xFF94A3B8),
                        lineHeight = 16.sp
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedButton(
                        onClick = {
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                try {
                                    val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                                        data = Uri.parse("package:${context.packageName}")
                                    }
                                    context.startActivity(intent)
                                } catch (e: Exception) {
                                    try {
                                        val intent = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
                                        context.startActivity(intent)
                                    } catch (e2: Exception) {}
                                }
                            }
                        },
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = Color(0xFF38BDF8)
                        ),
                        border = BorderStroke(1.dp, Color(0xFF0284C7))
                    ) {
                        Icon(
                            if (isBatteryOptimizedIgnored) Icons.Default.CheckCircle else Icons.Default.BatteryChargingFull,
                            contentDescription = null,
                            tint = if (isBatteryOptimizedIgnored) Color(0xFF10B981) else Color(0xFF38BDF8),
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            if (isBatteryOptimizedIgnored) "محمي من الإغلاق في الخلفية ✓" else "تفعيل حماية استقرار البطارية",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(100.dp))
        }
    }
}

/**
 * 📱 محاكي هاتف iOS 27 مع عرض ساندوتش الطبقات والعمق الحقيقي
 */
@Composable
fun PhoneStageView(
    bgBitmap: Bitmap?,
    fgBitmap: Bitmap?,
    clockConfig: ClockConfig,
    roll: Float,
    pitch: Float,
    isExploded: Boolean
) {
    val maxShift = 24f * clockConfig.parallaxStrength
    val shiftX = (roll * maxShift).dp
    val shiftY = (pitch * maxShift).dp

    val phoneWidth = 270.dp
    val phoneHeight = 540.dp

    // إطار الهاتف
    Surface(
        modifier = Modifier
            .width(phoneWidth)
            .height(phoneHeight)
            .shadow(28.dp, RoundedCornerShape(44.dp)),
        shape = RoundedCornerShape(44.dp),
        color = Color.Black,
        border = BorderStroke(3.dp, Color(0xFF1E293B))
    ) {
        Box(
            modifier = Modifier.fillMaxSize()
        ) {
            // 1. طبقة الخلفية (مع إزاحة معاكسة)
            if (bgBitmap != null) {
                Image(
                    bitmap = bgBitmap.asImageBitmap(),
                    contentDescription = null,
                    modifier = Modifier
                        .fillMaxSize()
                        .scale(if (isExploded) 1.25f else 1.15f)
                        .offset {
                            IntOffset(
                                x = (-shiftX.value * 0.4f).roundToInt(),
                                y = (-shiftY.value * 0.4f).roundToInt()
                            )
                        },
                    contentScale = ContentScale.Crop
                )
            } else {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                listOf(Color(0xFF0F172A), Color(0xFF020617))
                            )
                        )
                )
            }

            // 2. طبقة الساعة عندما تكون خلف العنصر (ساندوتش العمق)
            if (clockConfig.isClockVisible && clockConfig.isBehindSubject) {
                ClockRenderLayer(
                    config = clockConfig,
                    offsetX = shiftX * 0.2f,
                    offsetY = shiftY * 0.2f
                )
            }

            // 3. طبقة العنصر المعزول (في المنتصف أمام الساعة)
            if (fgBitmap != null) {
                Image(
                    bitmap = fgBitmap.asImageBitmap(),
                    contentDescription = null,
                    modifier = Modifier
                        .fillMaxSize()
                        .scale(if (isExploded) 1.10f else 1.05f)
                        .offset {
                            IntOffset(
                                x = (shiftX.value * 0.8f).roundToInt(),
                                y = (shiftY.value * 0.8f).roundToInt()
                            )
                        },
                    contentScale = ContentScale.Fit
                )
            }

            // 4. طبقة الساعة إذا اختار المستخدم وضعها أمام العنصر
            if (clockConfig.isClockVisible && !clockConfig.isBehindSubject) {
                ClockRenderLayer(
                    config = clockConfig,
                    offsetX = shiftX * 0.2f,
                    offsetY = shiftY * 0.2f
                )
            }

            // الجزيرة العلوية Dynamic Island في شاشة القفل
            Box(
                modifier = Modifier
                    .padding(top = 10.dp)
                    .size(width = 85.dp, height = 22.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color.Black)
                    .align(Alignment.TopCenter)
            )

            // أزرار قفل الشاشة السفلية (المصباح والكاميرا) بنمط iOS 27
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .align(Alignment.BottomCenter)
                    .padding(horizontal = 24.dp, vertical = 20.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(42.dp)
                        .clip(CircleShape)
                        .background(Color.Black.copy(alpha = 0.45f))
                        .border(1.dp, Color.White.copy(alpha = 0.2f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.FlashlightOn,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(18.dp)
                    )
                }

                Text(
                    "المس لفتح القفل",
                    fontSize = 11.sp,
                    color = Color.White.copy(alpha = 0.7f),
                    fontWeight = FontWeight.Medium
                )

                Box(
                    modifier = Modifier
                        .size(42.dp)
                        .clip(CircleShape)
                        .background(Color.Black.copy(alpha = 0.45f))
                        .border(1.dp, Color.White.copy(alpha = 0.2f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Default.CameraAlt,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            // علامات الطبقات التوضيحية عند تفعيل وضع Exploded
            if (isExploded) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color.Black.copy(alpha = 0.35f))
                ) {
                    Text(
                        "طبقة 3: العنصر المعزول (+95px)",
                        color = Color(0xFF38BDF8),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier
                            .align(Alignment.CenterStart)
                            .padding(start = 12.dp)
                            .background(Color.Black.copy(alpha = 0.8f), RoundedCornerShape(4.dp))
                            .padding(4.dp)
                    )
                    Text(
                        "طبقة 2: ساعة العمق (0px)",
                        color = Color(0xFFF59E0B),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier
                            .align(Alignment.TopStart)
                            .padding(start = 12.dp, top = 70.dp)
                            .background(Color.Black.copy(alpha = 0.8f), RoundedCornerShape(4.dp))
                            .padding(4.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun ClockRenderLayer(
    config: ClockConfig,
    offsetX: androidx.compose.ui.unit.Dp,
    offsetY: androidx.compose.ui.unit.Dp
) {
    val timeFormat = if (config.is24HourFormat) "HH:mm" else "hh:mm"
    val timeStr = remember { SimpleDateFormat(timeFormat, Locale.getDefault()).format(Date()) }
    val dateStr = remember { SimpleDateFormat("EEEE، d MMMM", Locale("ar")).format(Date()) }

    val chosenFont = when (config.fontFamily) {
        "SERIF" -> FontFamily.Serif
        "MONOSPACE" -> FontFamily.Monospace
        else -> FontFamily.Default
    }

    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.TopCenter
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier
                .padding(top = (540 * config.verticalBias).dp)
                .offset(offsetX, offsetY)
        ) {
            Text(
                text = timeStr,
                color = Color(config.colorArgb),
                fontSize = (config.fontSizeSp * 0.65f).sp,
                fontWeight = FontWeight.Bold,
                fontFamily = chosenFont,
                letterSpacing = (-1.5).sp
            )
            Text(
                text = dateStr,
                color = Color(config.colorArgb).copy(alpha = 0.85f),
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

fun launchWallpaperIntent(context: Context) {
    try {
        val intent = Intent(WallpaperManager.ACTION_CHANGE_LIVE_WALLPAPER).apply {
            putExtra(
                WallpaperManager.EXTRA_LIVE_WALLPAPER_COMPONENT,
                ComponentName(context, DepthWallpaperService::class.java)
            )
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    } catch (e: ActivityNotFoundException) {
        try {
            val intent = Intent(WallpaperManager.ACTION_LIVE_WALLPAPER_CHOOSER).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        } catch (e2: Exception) {
            Toast.makeText(context, "يرجى تفعيل الخلفية من إعدادات شاشة القفل في هاتفك", Toast.LENGTH_LONG).show()
        }
    }
}
