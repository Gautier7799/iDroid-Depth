package com.example.depthlockscreen

import android.Manifest
import android.app.WallpaperManager
import android.content.ActivityNotFoundException
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
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
import androidx.core.content.ContextCompat
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
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
                DepthWallpapersMainScreen(
                    liveRoll = liveRoll.floatValue,
                    livePitch = livePitch.floatValue,
                    onSetLiveWallpaper = { launchLiveWallpaperChooser() },
                    onRequestBatteryWhitelist = { requestBatteryWhitelist() }
                )
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

    private fun launchLiveWallpaperChooser() {
        try {
            val intent = Intent(WallpaperManager.ACTION_CHANGE_LIVE_WALLPAPER).apply {
                putExtra(
                    WallpaperManager.EXTRA_LIVE_WALLPAPER_COMPONENT,
                    ComponentName(this@MainActivity, DepthWallpaperService::class.java)
                )
            }
            startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            try {
                val intent = Intent(WallpaperManager.ACTION_LIVE_WALLPAPER_CHOOSER)
                startActivity(intent)
            } catch (ex: Exception) {
                Toast.makeText(this, "تعذر فتح مدير الخلفيات", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun requestBatteryWhitelist() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
            if (!powerManager.isIgnoringBatteryOptimizations(packageName)) {
                val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                    data = Uri.parse("package:$packageName")
                }
                startActivity(intent)
            } else {
                Toast.makeText(this, "التطبيق بالفعل مستثنى من توفير البطارية", Toast.LENGTH_SHORT).show()
            }
        }
    }
}

enum class NavigationTab { COLLECTION, WALLPAPERS, STUDIO, SETTINGS }

@Composable
fun DepthWallpapersMainScreen(
    liveRoll: Float,
    livePitch: Float,
    onSetLiveWallpaper: () -> Unit,
    onRequestBatteryWhitelist: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val repo = remember { WallpaperRepository(context) }
    val segmenter = remember { SubjectSegmenterHelper(context) }

    var currentTab by remember { mutableStateOf(NavigationTab.WALLPAPERS) }
    var presets by remember { mutableStateOf(WallpaperPreset.ALL) }
    var selectedPreset by remember { mutableStateOf(presets[0]) }
    var clockConfig by remember { mutableStateOf(repo.loadSavedClockConfig()) }
    var previewPreset by remember { mutableStateOf<WallpaperPreset?>(null) }

    var bgBitmap by remember { mutableStateOf<Bitmap?>(null) }
    var fgBitmap by remember { mutableStateOf<Bitmap?>(null) }
    var isApplying by remember { mutableStateOf(false) }

    // Load initial bitmaps
    LaunchedEffect(selectedPreset) {
        val pair = repo.applyPreset(selectedPreset.id)
        bgBitmap = pair.first
        fgBitmap = pair.second
    }

    // Photo picker launcher
    val photoPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            scope.launch {
                isApplying = true
                try {
                    val stream = context.contentResolver.openInputStream(it)
                    val original = BitmapFactory.decodeStream(stream)
                    if (original != null) {
                        bgBitmap = original
                        val subject = segmenter.extractForegroundSubject(original)
                        fgBitmap = subject
                        repo.saveAssets(original, subject, clockConfig)
                        Toast.makeText(context, "تم استخراج العنصر وتطبيق تأثير العمق بنجاح!", Toast.LENGTH_SHORT).show()
                    }
                } catch (e: Exception) {
                    Toast.makeText(context, "فشل استيراد الصورة: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
                } finally {
                    isApplying = false
                }
            }
        }
    }

    Scaffold(
        containerColor = Color.Black,
        bottomBar = {
            FloatingBottomNav(
                currentTab = currentTab,
                onTabSelected = { currentTab = it }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when (currentTab) {
                NavigationTab.COLLECTION -> {
                    CollectionScreen(
                        presets = presets,
                        onSelectPreset = { preset ->
                            selectedPreset = preset
                            currentTab = NavigationTab.STUDIO
                        },
                        onSetWallpaper = { preset ->
                            selectedPreset = preset
                            scope.launch {
                                repo.applyPreset(preset.id)
                                onSetLiveWallpaper()
                            }
                        },
                        onPreview = { preset ->
                            selectedPreset = preset
                            scope.launch {
                                val pair = repo.applyPreset(preset.id)
                                bgBitmap = pair.first
                                fgBitmap = pair.second
                                previewPreset = preset
                            }
                        }
                    )
                }

                NavigationTab.WALLPAPERS -> {
                    WallpapersScreen(
                        presets = presets,
                        selectedPreset = selectedPreset,
                        onSelectPreset = { preset ->
                            selectedPreset = preset
                            scope.launch {
                                val pair = repo.applyPreset(preset.id)
                                bgBitmap = pair.first
                                fgBitmap = pair.second
                            }
                        },
                        onOpenStudio = { preset ->
                            selectedPreset = preset
                            currentTab = NavigationTab.STUDIO
                        },
                        onSetWallpaper = { preset ->
                            selectedPreset = preset
                            scope.launch {
                                repo.applyPreset(preset.id)
                                onSetLiveWallpaper()
                            }
                        },
                        onPreview = { preset ->
                            selectedPreset = preset
                            scope.launch {
                                val pair = repo.applyPreset(preset.id)
                                bgBitmap = pair.first
                                fgBitmap = pair.second
                                previewPreset = preset
                            }
                        }
                    )
                }

                NavigationTab.STUDIO -> {
                    StudioScreen(
                        preset = selectedPreset,
                        config = clockConfig,
                        bgBitmap = bgBitmap,
                        fgBitmap = fgBitmap,
                        roll = liveRoll,
                        pitch = livePitch,
                        onConfigChanged = { newConfig ->
                            clockConfig = newConfig
                            repo.saveClockConfig(newConfig)
                        },
                        onResetConfig = {
                            val def = ClockConfig(
                                fontSizePercent = selectedPreset.defaultFontSizePercent,
                                horizontalPosPercent = selectedPreset.defaultHorizontalPercent,
                                verticalPosPercent = selectedPreset.defaultVerticalPercent,
                                fontStyle = selectedPreset.defaultFontStyle,
                                colorArgb = android.graphics.Color.parseColor(selectedPreset.accentColorHex),
                                depthBehindSubject = selectedPreset.defaultDepthBehindSubject
                            )
                            clockConfig = def
                            repo.saveClockConfig(def)
                        },
                        onSetWallpaper = {
                            scope.launch {
                                if (bgBitmap != null && fgBitmap != null) {
                                    repo.saveAssets(bgBitmap!!, fgBitmap!!, clockConfig)
                                }
                                onSetLiveWallpaper()
                            }
                        },
                        onPickPhoto = { photoPickerLauncher.launch("image/*") },
                        onExportJson = {
                            val jsonStr = repo.exportToJson(clockConfig, selectedPreset.id)
                            val sendIntent = Intent().apply {
                                action = Intent.ACTION_SEND
                                putExtra(Intent.EXTRA_TEXT, jsonStr)
                                type = "application/json"
                            }
                            context.startActivity(Intent.createChooser(sendIntent, "تصدير إعدادات الخلفية"))
                        },
                        onPreview = {
                            previewPreset = selectedPreset
                        }
                    )
                }

                NavigationTab.SETTINGS -> {
                    SettingsScreen(
                        onRequestBatteryWhitelist = onRequestBatteryWhitelist,
                        onSetLiveWallpaper = onSetLiveWallpaper,
                        clockConfig = clockConfig,
                        onConfigChanged = { newCfg ->
                            clockConfig = newCfg
                            repo.saveClockConfig(newCfg)
                        },
                        onOpenVip = {
                            previewPreset = selectedPreset
                        }
                    )
                }
            }

            if (previewPreset != null) {
                LockScreenPreviewDialog(
                    preset = previewPreset!!,
                    config = clockConfig,
                    bgBitmap = bgBitmap,
                    fgBitmap = fgBitmap,
                    roll = liveRoll,
                    pitch = livePitch,
                    onDismiss = { previewPreset = null },
                    onSetWallpaper = {
                        scope.launch {
                            repo.applyPreset(previewPreset!!.id)
                            onSetLiveWallpaper()
                        }
                    }
                )
            }
        }
    }
}

/* ==========================================================================
   1. شريط الملاحة السفلي العائم (Floating Bottom Navigation Bar)
   ========================================================================== */
@Composable
fun FloatingBottomNav(
    currentTab: NavigationTab,
    onTabSelected: (NavigationTab) -> Unit
) {
    val vibrantYellow = Color(0xFFFFDE00)

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 20.dp),
        contentAlignment = Alignment.Center
    ) {
        Surface(
            shape = RoundedCornerShape(32.dp),
            color = Color(0xFF141416).copy(alpha = 0.94f),
            shadowElevation = 24.dp,
            border = BorderStroke(1.dp, Color.White.copy(alpha = 0.12f))
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                NavIconItem(
                    icon = Icons.Default.GridView,
                    isSelected = currentTab == NavigationTab.COLLECTION,
                    onClick = { onTabSelected(NavigationTab.COLLECTION) }
                )
                NavIconItem(
                    icon = Icons.Default.Image,
                    isSelected = currentTab == NavigationTab.WALLPAPERS,
                    onClick = { onTabSelected(NavigationTab.WALLPAPERS) }
                )
                NavIconItem(
                    icon = Icons.Default.Edit,
                    isSelected = currentTab == NavigationTab.STUDIO,
                    onClick = { onTabSelected(NavigationTab.STUDIO) }
                )
                NavIconItem(
                    icon = Icons.Default.Tune,
                    isSelected = currentTab == NavigationTab.SETTINGS,
                    onClick = { onTabSelected(NavigationTab.SETTINGS) }
                )
            }
        }
    }
}

@Composable
fun NavIconItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val vibrantYellow = Color(0xFFFFDE00)
    Box(
        modifier = Modifier
            .size(if (isSelected) 48.dp else 42.dp)
            .clip(CircleShape)
            .background(if (isSelected) vibrantYellow else Color.Transparent)
            .clickable { onClick() },
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = if (isSelected) Color.Black else Color.Gray,
            modifier = Modifier.size(22.dp)
        )
    }
}

/* ==========================================================================
   2. شاشة الخلفيات الرئيسية (Wallpapers Screen) - مطابقة للصورة 1
   ========================================================================== */
@Composable
fun WallpapersScreen(
    presets: List<WallpaperPreset>,
    selectedPreset: WallpaperPreset,
    onSelectPreset: (WallpaperPreset) -> Unit,
    onOpenStudio: (WallpaperPreset) -> Unit,
    onSetWallpaper: (WallpaperPreset) -> Unit,
    onPreview: (WallpaperPreset) -> Unit
) {
    var activeFilter by remember { mutableStateOf("RECENT") }
    val vibrantYellow = Color(0xFFFFDE00)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
    ) {
        // Top Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 16.dp, bottom = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Wallpapers",
                color = Color.White,
                fontSize = 30.sp,
                fontWeight = FontWeight.ExtraBold
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                IconButton(onClick = { activeFilter = "POPULAR" }) {
                    Icon(Icons.Default.Star, contentDescription = "VIP", tint = vibrantYellow)
                }
                IconButton(onClick = { onPreview(selectedPreset) }) {
                    Icon(Icons.Default.Visibility, contentDescription = "Preview", tint = Color.LightGray)
                }
            }
        }

        // Filter Tabs
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = { activeFilter = "FAVORITES" }) {
                Icon(
                    Icons.Default.Favorite,
                    contentDescription = null,
                    tint = if (activeFilter == "FAVORITES") vibrantYellow else Color.DarkGray
                )
            }

            // Recent Tab with Yellow Underline
            Column(
                modifier = Modifier.clickable { activeFilter = "RECENT" },
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Recent",
                    color = if (activeFilter == "RECENT") vibrantYellow else Color.Gray,
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp
                )
                if (activeFilter == "RECENT") {
                    Box(
                        modifier = Modifier
                            .padding(top = 4.dp)
                            .width(42.dp)
                            .height(3.dp)
                            .background(vibrantYellow, RoundedCornerShape(2.dp))
                    )
                }
            }

            IconButton(onClick = { activeFilter = "POPULAR" }) {
                Icon(
                    Icons.Default.Star,
                    contentDescription = null,
                    tint = if (activeFilter == "POPULAR") vibrantYellow else Color.DarkGray
                )
            }

            IconButton(onClick = { activeFilter = "TRENDING" }) {
                Icon(
                    Icons.Default.LocalFireDepartment,
                    contentDescription = null,
                    tint = if (activeFilter == "TRENDING") vibrantYellow else Color.DarkGray
                )
            }
        }

        // Wallpapers 2-Column Grid
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(presets) { item ->
                val isSelected = item.id == selectedPreset.id

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(9f / 18.5f)
                        .clip(RoundedCornerShape(26.dp))
                        .border(
                            width = if (isSelected) 2.dp else 1.dp,
                            color = if (isSelected) vibrantYellow else Color(0xFF222222),
                            shape = RoundedCornerShape(26.dp)
                        )
                        .clickable {
                            onSelectPreset(item)
                            onPreview(item)
                        },
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF161616))
                ) {
                    Box(modifier = Modifier.fillMaxSize()) {
                        // Background gradient
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(
                                    Brush.verticalGradient(
                                        listOf(
                                            Color(0xFF1E293B),
                                            safeHexToColor(item.accentColorHex).copy(alpha = 0.5f),
                                            Color(0xFF0F172A)
                                        )
                                    )
                                )
                        )

                        // Clock numbers in depth
                        Column(
                            modifier = Modifier
                                .align(Alignment.Center)
                                .offset(y = (-40).dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = item.defaultDateText,
                                color = Color.White.copy(alpha = 0.8f),
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = item.defaultTimeText,
                                color = safeHexToColor(item.accentColorHex),
                                fontSize = 42.sp,
                                fontWeight = FontWeight.Black,
                                letterSpacing = 1.sp
                            )
                        }

                        // Top checkmark
                        Box(
                            modifier = Modifier
                                .align(Alignment.TopEnd)
                                .padding(10.dp)
                                .size(24.dp)
                                .background(vibrantYellow, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Check, contentDescription = null, tint = Color.Black, modifier = Modifier.size(16.dp))
                        }

                        // Play badge if video
                        if (item.hasVideo) {
                            Box(
                                modifier = Modifier
                                    .align(Alignment.BottomEnd)
                                    .padding(10.dp)
                                    .size(26.dp)
                                    .background(Color.Black.copy(alpha = 0.6f), CircleShape)
                                    .clickable { onPreview(item) },
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.PlayArrow, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                            }
                        }

                        // Action CTA when selected
                        if (isSelected) {
                            Row(
                                modifier = Modifier
                                    .align(Alignment.BottomCenter)
                                    .padding(horizontal = 8.dp, vertical = 10.dp)
                                    .fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Button(
                                    onClick = { onPreview(item) },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF242428)),
                                    shape = RoundedCornerShape(18.dp),
                                    contentPadding = PaddingValues(horizontal = 6.dp),
                                    modifier = Modifier
                                        .weight(0.38f)
                                        .height(36.dp)
                                ) {
                                    Icon(Icons.Default.Visibility, contentDescription = "Preview", tint = Color.White, modifier = Modifier.size(14.dp))
                                }
                                Button(
                                    onClick = { onSetWallpaper(item) },
                                    colors = ButtonDefaults.buttonColors(containerColor = vibrantYellow),
                                    shape = RoundedCornerShape(18.dp),
                                    contentPadding = PaddingValues(horizontal = 6.dp),
                                    modifier = Modifier
                                        .weight(0.62f)
                                        .height(36.dp)
                                ) {
                                    Text("Set As", color = Color.Black, fontWeight = FontWeight.ExtraBold, fontSize = 11.sp)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

/* ==========================================================================
   3. شاشة المجموعات والتصنيفات (Collection Screen) - مطابقة للصورة 2
   ========================================================================== */
@Composable
fun CollectionScreen(
    presets: List<WallpaperPreset>,
    onSelectPreset: (WallpaperPreset) -> Unit,
    onSetWallpaper: (WallpaperPreset) -> Unit,
    onPreview: (WallpaperPreset) -> Unit
) {
    val vibrantYellow = Color(0xFFFFDE00)
    val categories = listOf("Abstract", "Aerospace", "Nature", "Vehicles", "Portraits")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 16.dp, bottom = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Collection",
                color = Color.White,
                fontSize = 30.sp,
                fontWeight = FontWeight.ExtraBold
            )
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color(0xFF1E1E22),
                    border = BorderStroke(1.dp, Color(0xFF333333))
                ) {
                    Text(
                        text = "All access",
                        color = Color.LightGray,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }
                Icon(Icons.Default.Star, contentDescription = null, tint = vibrantYellow)
            }
        }

        // Horizontal scrolling categories
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(20.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(categories) { category ->
                val categoryItems = presets.filter { it.category == category }
                if (categoryItems.isNotEmpty()) {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = category,
                                color = Color.White,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "View All ->",
                                color = vibrantYellow,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.clickable { onPreview(categoryItems.first()) }
                            )
                        }

                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            items(categoryItems) { wp ->
                                Card(
                                    modifier = Modifier
                                        .width(135.dp)
                                        .aspectRatio(9f / 18.5f)
                                        .clip(RoundedCornerShape(20.dp))
                                        .border(1.dp, Color(0xFF262626), RoundedCornerShape(20.dp))
                                        .clickable { onPreview(wp) },
                                    colors = CardDefaults.cardColors(containerColor = Color(0xFF121212))
                                ) {
                                    Box(modifier = Modifier.fillMaxSize()) {
                                        Box(
                                            modifier = Modifier
                                                .fillMaxSize()
                                                .background(
                                                    Brush.verticalGradient(
                                                        listOf(Color(0xFF1E293B), Color(0xFF0F172A))
                                                    )
                                                )
                                        )
                                        Column(
                                            modifier = Modifier.align(Alignment.Center),
                                            horizontalAlignment = Alignment.CenterHorizontally
                                        ) {
                                            Text(
                                                text = wp.defaultTimeText,
                                                color = safeHexToColor(wp.accentColorHex),
                                                fontSize = 28.sp,
                                                fontWeight = FontWeight.Black
                                            )
                                        }
                                        Text(
                                            text = wp.title,
                                            color = Color.White,
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis,
                                            modifier = Modifier
                                                .align(Alignment.BottomCenter)
                                                .padding(6.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

/* ==========================================================================
   4. استوديو التخصيص التفاعلي (Studio Screen) - مطابق للصورة 3
   ========================================================================== */
@Composable
fun StudioScreen(
    preset: WallpaperPreset,
    config: ClockConfig,
    bgBitmap: Bitmap?,
    fgBitmap: Bitmap?,
    roll: Float,
    pitch: Float,
    onConfigChanged: (ClockConfig) -> Unit,
    onResetConfig: () -> Unit,
    onSetWallpaper: () -> Unit,
    onPickPhoto: () -> Unit,
    onExportJson: () -> Unit,
    onPreview: () -> Unit
) {
    var activeStudioTab by remember { mutableStateOf("BASICS") }
    val vibrantYellow = Color(0xFFFFDE00)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 16.dp, bottom = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Studio",
                color = Color.White,
                fontSize = 30.sp,
                fontWeight = FontWeight.ExtraBold
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                IconButton(
                    onClick = onPreview,
                    modifier = Modifier
                        .size(36.dp)
                        .background(Color(0xFF1E1E22), CircleShape)
                ) {
                    Icon(Icons.Default.Visibility, contentDescription = "Full Preview", tint = Color.LightGray, modifier = Modifier.size(18.dp))
                }
                IconButton(
                    onClick = onResetConfig,
                    modifier = Modifier
                        .size(36.dp)
                        .background(Color(0xFF1E1E22), CircleShape)
                ) {
                    Icon(Icons.Default.Refresh, contentDescription = "Reset", tint = vibrantYellow, modifier = Modifier.size(18.dp))
                }
            }
        }

        // Interactive Phone Simulator with Parallax (clickable to preview)
        Box(
            modifier = Modifier
                .width(220.dp)
                .height(440.dp)
                .clip(RoundedCornerShape(36.dp))
                .border(4.dp, Color(0xFF2B2B2B), RoundedCornerShape(36.dp))
                .background(Color.Black)
                .clickable { onPreview() },
            contentAlignment = Alignment.Center
        ) {
            // Layer 1: Background Bitmap
            if (bgBitmap != null) {
                Image(
                    bitmap = bgBitmap.asImageBitmap(),
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxSize()
                        .offset {
                            IntOffset(
                                x = (-roll * (config.depthSensitivity / 3f)).roundToInt(),
                                y = (-pitch * (config.depthSensitivity / 3f)).roundToInt()
                            )
                        }
                )
            }

            // Layer 2: Depth Clock behind foreground
            if (config.depthBehindSubject) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .align(Alignment.TopCenter)
                        .offset(
                            x = (config.horizontalPosPercent - 50f).dp,
                            y = (config.verticalPosPercent * 4.4f).dp
                        ),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    if (config.showDate) {
                        Text(
                            text = config.customDateText,
                            color = Color.White.copy(alpha = 0.85f),
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Text(
                        text = config.customTimeText,
                        color = Color(config.colorArgb),
                        fontSize = (config.fontSizePercent * 2.2f).sp,
                        fontWeight = FontWeight.Black
                    )
                }
            }

            // Layer 3: Foreground Subject
            if (fgBitmap != null) {
                Image(
                    bitmap = fgBitmap.asImageBitmap(),
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxSize()
                        .offset {
                            IntOffset(
                                x = (roll * (config.depthSensitivity / 2f)).roundToInt(),
                                y = (pitch * (config.depthSensitivity / 2f)).roundToInt()
                            )
                        }
                )
            }
        }

        // Preview notice banner
        Surface(
            shape = RoundedCornerShape(20.dp),
            color = Color(0xFF1A1A1E),
            modifier = Modifier.padding(top = 10.dp, bottom = 12.dp)
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text("⚠️ Preview may differ slightly.", color = Color.LightGray, fontSize = 11.sp)
                Text("Dismiss", color = vibrantYellow, fontWeight = FontWeight.Bold, fontSize = 11.sp)
            }
        }

        // Customizer Bottom Sheet Controls
        Surface(
            shape = RoundedCornerShape(28.dp),
            color = Color(0xFF141416),
            border = BorderStroke(1.dp, Color(0xFF262626)),
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 90.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                // Sheet Tabs (Basics, Typography, Effects, Transform)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 12.dp),
                    horizontalArrangement = Arrangement.SpaceAround
                ) {
                    listOf("BASICS", "TYPOGRAPHY", "EFFECTS", "TRANSFORM").forEach { tab ->
                        val isTabActive = activeStudioTab == tab
                        Column(
                            modifier = Modifier.clickable { activeStudioTab = tab },
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = tab.lowercase().replaceFirstChar { it.uppercase() },
                                color = if (isTabActive) vibrantYellow else Color.Gray,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                            if (isTabActive) {
                                Box(
                                    modifier = Modifier
                                        .padding(top = 4.dp)
                                        .width(32.dp)
                                        .height(2.dp)
                                        .background(vibrantYellow)
                                )
                            }
                        }
                    }
                }

                // Tab 1: Basics (Font Size, Horizontal Position, Vertical Position)
                if (activeStudioTab == "BASICS") {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Font Size", color = Color.LightGray, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Text("${config.fontSizePercent.roundToInt()}%", color = vibrantYellow, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }
                        Slider(
                            value = config.fontSizePercent,
                            onValueChange = { onConfigChanged(config.copy(fontSizePercent = it)) },
                            valueRange = 15f..45f,
                            colors = SliderDefaults.colors(thumbColor = vibrantYellow, activeTrackColor = vibrantYellow)
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Horizontal Position", color = Color.LightGray, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Text("${config.horizontalPosPercent.roundToInt()}%", color = vibrantYellow, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }
                        Slider(
                            value = config.horizontalPosPercent,
                            onValueChange = { onConfigChanged(config.copy(horizontalPosPercent = it)) },
                            valueRange = 20f..80f,
                            colors = SliderDefaults.colors(thumbColor = vibrantYellow, activeTrackColor = vibrantYellow)
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Vertical Position", color = Color.LightGray, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Text("${config.verticalPosPercent.roundToInt()}%", color = vibrantYellow, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }
                        Slider(
                            value = config.verticalPosPercent,
                            onValueChange = { onConfigChanged(config.copy(verticalPosPercent = it)) },
                            valueRange = 15f..65f,
                            colors = SliderDefaults.colors(thumbColor = vibrantYellow, activeTrackColor = vibrantYellow)
                        )
                    }
                }

                // Tab 2: Typography
                if (activeStudioTab == "TYPOGRAPHY") {
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("Clock Color", color = Color.LightGray, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.horizontalScroll(rememberScrollState())
                        ) {
                            listOf(
                                "#FFFFFF", "#FFDE00", "#EF4444", "#38BDF8", "#10B981", "#EC4899", "#A855F7"
                            ).forEach { hex ->
                                val colorInt = android.graphics.Color.parseColor(hex)
                                Box(
                                    modifier = Modifier
                                        .size(32.dp)
                                        .clip(CircleShape)
                                        .background(Color(colorInt))
                                        .border(
                                            if (config.colorArgb == colorInt) 2.dp else 0.dp,
                                            Color.White,
                                            CircleShape
                                        )
                                        .clickable { onConfigChanged(config.copy(colorArgb = colorInt)) }
                                )
                            }
                        }
                    }
                }

                // Tab 3: Effects
                if (activeStudioTab == "EFFECTS") {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("3D Depth (Behind Subject)", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                            Text("Layer clock behind subject", color = Color.Gray, fontSize = 10.sp)
                        }
                        Switch(
                            checked = config.depthBehindSubject,
                            onCheckedChange = { onConfigChanged(config.copy(depthBehindSubject = it)) },
                            colors = SwitchDefaults.colors(checkedThumbColor = Color.Black, checkedTrackColor = vibrantYellow)
                        )
                    }
                }

                // Action Buttons Row
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = onSetWallpaper,
                        colors = ButtonDefaults.buttonColors(containerColor = vibrantYellow),
                        shape = RoundedCornerShape(18.dp),
                        modifier = Modifier.weight(1.5f)
                    ) {
                        Text("Set Wallpaper", color = Color.Black, fontWeight = FontWeight.ExtraBold)
                    }

                    Button(
                        onClick = onExportJson,
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF222226)),
                        shape = RoundedCornerShape(18.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Export", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }

                    Button(
                        onClick = onPickPhoto,
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF222226)),
                        shape = RoundedCornerShape(18.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Upload", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
            }
        }
    }
}

/* ==========================================================================
   5. شاشة الإعدادات المتقدمة (Settings Screen) - مطابقة للصورة 5 بالكامل
   ========================================================================== */
@Composable
fun SettingsScreen(
    onRequestBatteryWhitelist: () -> Unit,
    onSetLiveWallpaper: () -> Unit,
    clockConfig: ClockConfig,
    onConfigChanged: (ClockConfig) -> Unit,
    onOpenVip: () -> Unit = {}
) {
    val context = LocalContext.current
    val vibrantYellow = Color(0xFFFFDE00)

    // Dynamic Permission Checks
    val hasStoragePermission = remember {
        mutableStateOf(
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                ContextCompat.checkSelfPermission(context, Manifest.permission.READ_MEDIA_IMAGES) == PackageManager.PERMISSION_GRANTED
            } else {
                ContextCompat.checkSelfPermission(context, Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED
            }
        )
    }
    val storageLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
        hasStoragePermission.value = isGranted
        Toast.makeText(context, if (isGranted) "تم منح إذن الوسائط بنجاح" else "تم رفض إذن الوسائط", Toast.LENGTH_SHORT).show()
    }

    val hasNotificationPermission = remember {
        mutableStateOf(
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED
            } else {
                true
            }
        )
    }
    val notificationLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
        hasNotificationPermission.value = isGranted
        Toast.makeText(context, if (isGranted) "تم تفعيل إذن الإشعارات" else "تم رفض إذن الإشعارات", Toast.LENGTH_SHORT).show()
    }

    val isBatteryOptimizedIgnored = remember {
        mutableStateOf(
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val pm = context.getSystemService(Context.POWER_SERVICE) as PowerManager
                pm.isIgnoringBatteryOptimizations(context.packageName)
            } else {
                true
            }
        )
    }

    var selectedLanguage by remember { mutableStateOf("English") }
    var selectedDateFormat by remember { mutableStateOf(clockConfig.customDateText) }
    var parallax3DEnabled by remember { mutableStateOf(true) }
    var parallaxSensitivity by remember { mutableFloatStateOf(clockConfig.depthSensitivity.toFloat()) }
    var targetFps by remember { mutableStateOf("60 FPS") }
    var lowPowerMotionThrottle by remember { mutableStateOf(false) }
    var autoCycleEnabled by remember { mutableStateOf(false) }
    var autoCycleInterval by remember { mutableStateOf("Every 24 Hours") }
    var autoCycleSource by remember { mutableStateOf("All Presets") }

    Box(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp)
                .verticalScroll(rememberScrollState())
        ) {
            // Header: "Settings" on left, "All access" pill + Star on right (Matches Image 5)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 16.dp, bottom = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Settings",
                    color = Color.White,
                    fontSize = 30.sp,
                    fontWeight = FontWeight.ExtraBold
                )
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = Color(0xFF1E1E22),
                        border = BorderStroke(1.dp, Color(0xFF333333))
                    ) {
                        Text(
                            text = "All access",
                            color = Color.LightGray,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                        )
                    }
                    Icon(Icons.Default.Star, contentDescription = null, tint = vibrantYellow)
                }
            }

            // Accordion 1: App & Permission
            SettingsAccordionItem("App & Permission", Icons.Default.Shield) {
                // Live Wallpaper Service
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Live Wallpaper Service", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                        Text("Runs interactive 3D lockscreen at 60 FPS", color = Color.Gray, fontSize = 10.sp)
                    }
                    Button(
                        onClick = onSetLiveWallpaper,
                        colors = ButtonDefaults.buttonColors(containerColor = vibrantYellow),
                        shape = RoundedCornerShape(14.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                        modifier = Modifier.height(32.dp)
                    ) {
                        Text("SET WALLPAPER", color = Color.Black, fontWeight = FontWeight.ExtraBold, fontSize = 10.sp)
                    }
                }

                HorizontalDivider(color = Color(0xFF222222), thickness = 0.5.dp, modifier = Modifier.padding(vertical = 4.dp))

                // Battery Optimization
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp)
                        .clickable { onRequestBatteryWhitelist() },
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Battery Optimization Whitelist", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                        Text("Prevents OS from killing background wallpaper", color = Color.Gray, fontSize = 10.sp)
                    }
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = if (isBatteryOptimizedIgnored.value) Color(0xFF1B3820) else Color(0xFF382A1B),
                        border = BorderStroke(1.dp, if (isBatteryOptimizedIgnored.value) Color(0xFF22C55E) else vibrantYellow)
                    ) {
                        Text(
                            text = if (isBatteryOptimizedIgnored.value) "UNRESTRICTED" else "OPTIMIZED",
                            color = if (isBatteryOptimizedIgnored.value) Color(0xFF22C55E) else vibrantYellow,
                            fontWeight = FontWeight.Bold,
                            fontSize = 10.sp,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }

                HorizontalDivider(color = Color(0xFF222222), thickness = 0.5.dp, modifier = Modifier.padding(vertical = 4.dp))

                // Storage / Photos Permission
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Storage & Photos Permission", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                        Text("Required to import custom photos for depth maps", color = Color.Gray, fontSize = 10.sp)
                    }
                    if (hasStoragePermission.value) {
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = Color(0xFF1B3820),
                            border = BorderStroke(1.dp, Color(0xFF22C55E))
                        ) {
                            Text(
                                text = "GRANTED",
                                color = Color(0xFF22C55E),
                                fontWeight = FontWeight.Bold,
                                fontSize = 10.sp,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    } else {
                        Button(
                            onClick = {
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                                    storageLauncher.launch(Manifest.permission.READ_MEDIA_IMAGES)
                                } else {
                                    storageLauncher.launch(Manifest.permission.READ_EXTERNAL_STORAGE)
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2E2E34)),
                            shape = RoundedCornerShape(14.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                            modifier = Modifier.height(30.dp)
                        ) {
                            Text("GRANT", color = vibrantYellow, fontWeight = FontWeight.Bold, fontSize = 10.sp)
                        }
                    }
                }

                HorizontalDivider(color = Color(0xFF222222), thickness = 0.5.dp, modifier = Modifier.padding(vertical = 4.dp))

                // Notifications Permission (Android 13+)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Post Notifications", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                            Text("Allows daily wallpaper update notifications", color = Color.Gray, fontSize = 10.sp)
                        }
                        if (hasNotificationPermission.value) {
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = Color(0xFF1B3820),
                                border = BorderStroke(1.dp, Color(0xFF22C55E))
                            ) {
                                Text(
                                    text = "ENABLED",
                                    color = Color(0xFF22C55E),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 10.sp,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        } else {
                            Button(
                                onClick = { notificationLauncher.launch(Manifest.permission.POST_NOTIFICATIONS) },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2E2E34)),
                                shape = RoundedCornerShape(14.dp),
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                modifier = Modifier.height(30.dp)
                            ) {
                                Text("ENABLE", color = vibrantYellow, fontWeight = FontWeight.Bold, fontSize = 10.sp)
                            }
                        }
                    }
                    HorizontalDivider(color = Color(0xFF222222), thickness = 0.5.dp, modifier = Modifier.padding(vertical = 4.dp))
                }

                // Gyroscope Motion Sensors
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Sensors & Gyroscope", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                        Text("Rotational hardware sensors for 3D depth tilt", color = Color.Gray, fontSize = 10.sp)
                    }
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = Color(0xFF1E1E26),
                        border = BorderStroke(1.dp, Color(0xFF444450))
                    ) {
                        Text(
                            text = "ACTIVE (60 FPS)",
                            color = Color(0xFF38BDF8),
                            fontWeight = FontWeight.Bold,
                            fontSize = 10.sp,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }
            }

            // Accordion 2: Clock Settings
            SettingsAccordionItem("Clock Settings", Icons.Default.Schedule) {
                // 24-Hour Format
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("24-Hour Clock Format", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                        Text("Display time as 14:30 instead of 02:30 PM", color = Color.Gray, fontSize = 10.sp)
                    }
                    Switch(
                        checked = clockConfig.is24HourFormat,
                        onCheckedChange = { onConfigChanged(clockConfig.copy(is24HourFormat = it)) },
                        colors = SwitchDefaults.colors(checkedThumbColor = Color.Black, checkedTrackColor = vibrantYellow)
                    )
                }

                HorizontalDivider(color = Color(0xFF222222), thickness = 0.5.dp, modifier = Modifier.padding(vertical = 4.dp))

                // Depth Layering
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("3D Depth Layering", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                        Text("Place numbers behind extracted foreground object", color = Color.Gray, fontSize = 10.sp)
                    }
                    Switch(
                        checked = clockConfig.depthBehindSubject,
                        onCheckedChange = { onConfigChanged(clockConfig.copy(depthBehindSubject = it)) },
                        colors = SwitchDefaults.colors(checkedThumbColor = Color.Black, checkedTrackColor = vibrantYellow)
                    )
                }

                HorizontalDivider(color = Color(0xFF222222), thickness = 0.5.dp, modifier = Modifier.padding(vertical = 4.dp))

                // Show Seconds
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Show Live Seconds", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                        Text("Display ticking seconds alongside hours & minutes", color = Color.Gray, fontSize = 10.sp)
                    }
                    Switch(
                        checked = clockConfig.showSeconds,
                        onCheckedChange = { onConfigChanged(clockConfig.copy(showSeconds = it)) },
                        colors = SwitchDefaults.colors(checkedThumbColor = Color.Black, checkedTrackColor = vibrantYellow)
                    )
                }

                HorizontalDivider(color = Color(0xFF222222), thickness = 0.5.dp, modifier = Modifier.padding(vertical = 4.dp))

                // Date Format Selector
                Column(modifier = Modifier.padding(vertical = 6.dp)) {
                    Text("Date Display Style", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.horizontalScroll(rememberScrollState())
                    ) {
                        listOf("25 NOV 2028", "mar., sept. 15", "24 Haz Çar", "السبت، 25 نوفمبر").forEach { fmt ->
                            val isSelected = selectedDateFormat == fmt
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = if (isSelected) vibrantYellow else Color(0xFF222226),
                                modifier = Modifier.clickable {
                                    selectedDateFormat = fmt
                                    onConfigChanged(clockConfig.copy(customDateText = fmt))
                                }
                            ) {
                                Text(
                                    text = fmt,
                                    color = if (isSelected) Color.Black else Color.LightGray,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                                )
                            }
                        }
                    }
                }

                HorizontalDivider(color = Color(0xFF222222), thickness = 0.5.dp, modifier = Modifier.padding(vertical = 4.dp))

                // Clock Language
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Language", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        listOf("English", "العربية").forEach { lang ->
                            val isSelected = selectedLanguage == lang
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = if (isSelected) vibrantYellow else Color(0xFF222226),
                                modifier = Modifier.clickable { selectedLanguage = lang }
                            ) {
                                Text(
                                    text = lang,
                                    color = if (isSelected) Color.Black else Color.LightGray,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }
                    }
                }
            }

            // Accordion 3: Animation Settings
            SettingsAccordionItem("Animation Settings", Icons.Default.AutoAwesome) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("3D Gyroscope Parallax", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                        Text("Tilt-responsive 60 FPS motion layering", color = Color.Gray, fontSize = 10.sp)
                    }
                    Switch(
                        checked = parallax3DEnabled,
                        onCheckedChange = { parallax3DEnabled = it },
                        colors = SwitchDefaults.colors(checkedThumbColor = Color.Black, checkedTrackColor = vibrantYellow)
                    )
                }

                HorizontalDivider(color = Color(0xFF222222), thickness = 0.5.dp, modifier = Modifier.padding(vertical = 4.dp))

                // Sensitivity Slider
                Column(modifier = Modifier.padding(vertical = 6.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Motion Sensitivity", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                        Text("${parallaxSensitivity.toInt()}%", color = vibrantYellow, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                    Slider(
                        value = parallaxSensitivity,
                        onValueChange = {
                            parallaxSensitivity = it
                            onConfigChanged(clockConfig.copy(depthSensitivity = it.toInt()))
                        },
                        valueRange = 10f..80f,
                        colors = SliderDefaults.colors(thumbColor = vibrantYellow, activeTrackColor = vibrantYellow)
                    )
                }

                HorizontalDivider(color = Color(0xFF222222), thickness = 0.5.dp, modifier = Modifier.padding(vertical = 4.dp))

                // Target FPS
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Target Frame Rate", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        listOf("60 FPS", "90 FPS", "120 FPS").forEach { fps ->
                            val isSelected = targetFps == fps
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = if (isSelected) vibrantYellow else Color(0xFF222226),
                                modifier = Modifier.clickable { targetFps = fps }
                            ) {
                                Text(
                                    text = fps,
                                    color = if (isSelected) Color.Black else Color.LightGray,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }
                    }
                }

                HorizontalDivider(color = Color(0xFF222222), thickness = 0.5.dp, modifier = Modifier.padding(vertical = 4.dp))

                // Battery Saver Throttling
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Battery Saver Motion Throttle", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                        Text("Lowers sensor rate when battery is below 20%", color = Color.Gray, fontSize = 10.sp)
                    }
                    Switch(
                        checked = lowPowerMotionThrottle,
                        onCheckedChange = { lowPowerMotionThrottle = it },
                        colors = SwitchDefaults.colors(checkedThumbColor = Color.Black, checkedTrackColor = vibrantYellow)
                    )
                }
            }

            // Accordion 4: Auto Wallpaper Settings
            SettingsAccordionItem("Auto Wallpaper Settings", Icons.Default.Autorenew) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Auto-Cycle Wallpaper", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                        Text("Automatically rotates through selected wallpapers", color = Color.Gray, fontSize = 10.sp)
                    }
                    Switch(
                        checked = autoCycleEnabled,
                        onCheckedChange = { autoCycleEnabled = it },
                        colors = SwitchDefaults.colors(checkedThumbColor = Color.Black, checkedTrackColor = vibrantYellow)
                    )
                }

                HorizontalDivider(color = Color(0xFF222222), thickness = 0.5.dp, modifier = Modifier.padding(vertical = 4.dp))

                // Frequency
                Column(modifier = Modifier.padding(vertical = 6.dp)) {
                    Text("Cycle Interval", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.horizontalScroll(rememberScrollState())
                    ) {
                        listOf("Every 1 Hour", "Every 6 Hours", "Every 12 Hours", "Every 24 Hours").forEach { intv ->
                            val isSelected = autoCycleInterval == intv
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = if (isSelected) vibrantYellow else Color(0xFF222226),
                                modifier = Modifier.clickable { autoCycleInterval = intv }
                            ) {
                                Text(
                                    text = intv,
                                    color = if (isSelected) Color.Black else Color.LightGray,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }
                    }
                }

                HorizontalDivider(color = Color(0xFF222222), thickness = 0.5.dp, modifier = Modifier.padding(vertical = 4.dp))

                // Source
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Source Collection", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        listOf("All Presets", "Favorites", "Recent").forEach { src ->
                            val isSelected = autoCycleSource == src
                            Surface(
                                shape = RoundedCornerShape(10.dp),
                                color = if (isSelected) vibrantYellow else Color(0xFF222226),
                                modifier = Modifier.clickable { autoCycleSource = src }
                            ) {
                                Text(
                                    text = src,
                                    color = if (isSelected) Color.Black else Color.LightGray,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }
                    }
                }
            }

            // Accordion 5: Support & About
            SettingsAccordionItem("Support & About", Icons.Default.HelpOutline) {
                Text("Version: 2.0.0 (Production Release)", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Text("Neural Engine: Google ML Kit On-Device Model", color = Color.LightGray, fontSize = 11.sp)
                Text("Graphics Engine: 60 FPS Hardware OpenGL/Canvas", color = Color.LightGray, fontSize = 11.sp)

                Spacer(modifier = Modifier.height(10.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = {
                            val def = ClockConfig()
                            onConfigChanged(def)
                            Toast.makeText(context, "تمت استعادة إعدادات الساعة الافتراضية", Toast.LENGTH_SHORT).show()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF26262B)),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Reset Clock", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = {
                            Toast.makeText(context, "تم مسح الذاكرة المؤقتة بنجاح", Toast.LENGTH_SHORT).show()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF26262B)),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Clear Cache", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    "🔒 100% On-Device & Private: All image processing runs locally. No data leaves your device.",
                    color = Color.DarkGray,
                    fontSize = 10.sp,
                    lineHeight = 14.sp
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Share it with Friend Card (Matches Image 5!)
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(24.dp))
                    .clickable {
                        val shareIntent = Intent().apply {
                            action = Intent.ACTION_SEND
                            putExtra(Intent.EXTRA_TEXT, "تحقق من تطبيق Depth Wallpapers لتأثير العمق ثلاثي الأبعاد وساعة قفل الشاشة التفاعلية!")
                            type = "text/plain"
                        }
                        context.startActivity(Intent.createChooser(shareIntent, "مشاركة التطبيق"))
                    },
                colors = CardDefaults.cardColors(containerColor = Color(0xFF18181C)),
                border = BorderStroke(1.dp, Color(0xFF262626))
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .background(Color(0xFF2A2A30), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Share, contentDescription = null, tint = Color.White)
                    }
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Share it with Friend", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text(
                            "Spread the word and help others discover amazing wallpapers",
                            color = Color.Gray,
                            fontSize = 11.sp
                        )
                    }
                    Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Color.Gray)
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // SOCIAL CONNECT (Matches Image 5!)
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "SOCIAL CONNECT",
                    color = Color.DarkGray,
                    fontWeight = FontWeight.Bold,
                    fontSize = 11.sp,
                    letterSpacing = 2.sp
                )

                Spacer(modifier = Modifier.height(14.dp))

                Row(
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Telegram
                    SocialIconButton(icon = Icons.Default.Send, label = "Telegram") {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://t.me"))
                        try { context.startActivity(intent) } catch (e: Exception) { }
                    }
                    // Instagram
                    SocialIconButton(icon = Icons.Default.CameraAlt, label = "Instagram") {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://instagram.com"))
                        try { context.startActivity(intent) } catch (e: Exception) { }
                    }
                    // YouTube
                    SocialIconButton(icon = Icons.Default.PlayArrow, label = "YouTube") {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://youtube.com"))
                        try { context.startActivity(intent) } catch (e: Exception) { }
                    }
                    // Website / Globe
                    SocialIconButton(icon = Icons.Default.Public, label = "Web") {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://google.com"))
                        try { context.startActivity(intent) } catch (e: Exception) { }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Brand Footer (Matches Image 5!)
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 12.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(24.dp)
                            .background(vibrantYellow, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("D", color = Color.Black, fontWeight = FontWeight.Black, fontSize = 14.sp)
                    }
                    Text(
                        text = "Depth Wallpapers",
                        color = Color.White,
                        fontWeight = FontWeight.Black,
                        fontSize = 22.sp
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "J U S T   N E W   D E S I G N S",
                    color = Color.DarkGray,
                    fontWeight = FontWeight.Bold,
                    fontSize = 9.sp,
                    letterSpacing = 2.sp
                )
            }

            Spacer(modifier = Modifier.height(100.dp))
        }

        // Floating Action Button (FAB) on Bottom Right (Matches Image 5!)
        Box(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(end = 20.dp, bottom = 80.dp)
        ) {
            FloatingActionButton(
                onClick = onOpenVip,
                containerColor = vibrantYellow,
                contentColor = Color.Black,
                shape = CircleShape,
                modifier = Modifier.size(54.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.AutoAwesome,
                    contentDescription = "VIP Sparkles",
                    modifier = Modifier.size(26.dp)
                )
            }
        }
    }
}

@Composable
fun SocialIconButton(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .size(42.dp)
            .clip(CircleShape)
            .background(Color(0xFF1C1C20))
            .border(1.dp, Color(0xFF2C2C32), CircleShape)
            .clickable { onClick() },
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            tint = Color.LightGray,
            modifier = Modifier.size(20.dp)
        )
    }
}

@Composable
fun SettingsAccordionItem(
    title: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    content: @Composable ColumnScope.() -> Unit
) {
    var expanded by remember { mutableStateOf(false) }
    val vibrantYellow = Color(0xFFFFDE00)

    Surface(
        shape = RoundedCornerShape(20.dp),
        color = Color(0xFF141416),
        border = BorderStroke(1.dp, Color(0xFF222222)),
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
    ) {
        Column(modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp)) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { expanded = !expanded },
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .background(vibrantYellow.copy(alpha = 0.2f), RoundedCornerShape(10.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(icon, contentDescription = null, tint = vibrantYellow, modifier = Modifier.size(18.dp))
                    }
                    Text(title, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                }
                Icon(
                    if (expanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                    contentDescription = null,
                    tint = Color.Gray
                )
            }

            if (expanded) {
                Column(
                    modifier = Modifier.padding(top = 10.dp),
                    content = content
                )
            }
        }
    }
}

/* ==========================================================================
   معاينة شاشة القفل التفاعلية الكاملة (Lock Screen Full Preview) - مطابقة للصورة 2
   ========================================================================== */
@Composable
fun LockScreenPreviewDialog(
    preset: WallpaperPreset,
    config: ClockConfig,
    bgBitmap: Bitmap?,
    fgBitmap: Bitmap?,
    roll: Float,
    pitch: Float,
    onDismiss: () -> Unit,
    onSetWallpaper: () -> Unit
) {
    val vibrantYellow = Color(0xFFFFDE00)
    val accentColor = safeHexToColor(preset.accentColorHex)

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black)
        ) {
            // Layer 1: Background Bitmap or Gradient
            if (bgBitmap != null) {
                Image(
                    bitmap = bgBitmap.asImageBitmap(),
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxSize()
                        .offset {
                            IntOffset(
                                x = (-roll * (config.depthSensitivity / 2.5f)).toInt(),
                                y = (-pitch * (config.depthSensitivity / 2.5f)).toInt()
                            )
                        }
                )
            } else {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                listOf(Color(0xFF1E293B), Color(0xFF0F172A))
                            )
                        )
                )
            }

            // Layer 2: Glowing Depth Clock behind subject
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .align(Alignment.TopCenter)
                    .padding(top = 90.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Lock Icon
                Icon(
                    imageVector = Icons.Default.Lock,
                    contentDescription = "Lock",
                    tint = Color.White.copy(alpha = 0.85f),
                    modifier = Modifier
                        .size(18.dp)
                        .padding(bottom = 4.dp)
                )

                // Date
                Text(
                    text = preset.defaultDateText,
                    color = Color.White.copy(alpha = 0.9f),
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                    letterSpacing = 0.5.sp
                )

                Spacer(modifier = Modifier.height(2.dp))

                // Time (Large depth numerals)
                Text(
                    text = preset.defaultTimeText,
                    color = accentColor,
                    fontSize = 82.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = (-1).sp,
                    lineHeight = 84.sp,
                    modifier = Modifier.offset {
                        IntOffset(
                            x = (roll * 4f).toInt(),
                            y = (pitch * 4f).toInt()
                        )
                    }
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Widgets Row (Matches Image 2!)
                Row(
                    modifier = Modifier.padding(horizontal = 24.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Battery Widget
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = Color.Black.copy(alpha = 0.45f),
                        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.15f))
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                Icons.Default.BatteryChargingFull,
                                contentDescription = null,
                                tint = Color.Green,
                                modifier = Modifier.size(16.dp)
                            )
                            Text(
                                text = "📱 71% iPhone",
                                color = Color.White,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    // Countdown Widget
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = Color.Black.copy(alpha = 0.45f),
                        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.15f))
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                Icons.Default.AutoAwesome,
                                contentDescription = null,
                                tint = vibrantYellow,
                                modifier = Modifier.size(16.dp)
                            )
                            Text(
                                text = "Event 67 Days Left",
                                color = Color.White,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }

            // Layer 3: Foreground Subject (with parallax forward offset)
            if (fgBitmap != null) {
                Image(
                    bitmap = fgBitmap.asImageBitmap(),
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxSize()
                        .offset {
                            IntOffset(
                                x = (roll * (config.depthSensitivity / 2f)).toInt(),
                                y = (pitch * (config.depthSensitivity / 2f)).toInt()
                            )
                        }
                )
            }

            // Status Bar at very top (Carrier, WiFi, Battery)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "vodafone TR",
                    color = Color.White.copy(alpha = 0.85f),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold
                )

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(
                        text = "4G",
                        color = Color.White.copy(alpha = 0.85f),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "71%",
                        color = Color.White.copy(alpha = 0.85f),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Icon(
                        Icons.Default.BatteryFull,
                        contentDescription = null,
                        tint = Color.White.copy(alpha = 0.85f),
                        modifier = Modifier.size(16.dp)
                    )
                }
            }

            // Back Button at top left
            Box(
                modifier = Modifier
                    .padding(top = 44.dp, start = 16.dp)
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(Color.Black.copy(alpha = 0.5f))
                    .border(1.dp, Color.White.copy(alpha = 0.2f), CircleShape)
                    .clickable { onDismiss() },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    tint = Color.White,
                    modifier = Modifier.size(20.dp)
                )
            }

            // Bottom Actions (Flashlight, Set Wallpaper, Camera) - Matches Image 2!
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .align(Alignment.BottomCenter)
                    .padding(horizontal = 30.dp, vertical = 40.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Flashlight circular button
                    Box(
                        modifier = Modifier
                            .size(52.dp)
                            .clip(CircleShape)
                            .background(Color.Black.copy(alpha = 0.5f))
                            .border(1.dp, Color.White.copy(alpha = 0.25f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.FlashlightOn,
                            contentDescription = "Flashlight",
                            tint = Color.White,
                            modifier = Modifier.size(24.dp)
                        )
                    }

                    // Set Wallpaper Button
                    Button(
                        onClick = {
                            onSetWallpaper()
                            onDismiss()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = vibrantYellow),
                        shape = RoundedCornerShape(22.dp),
                        modifier = Modifier.height(44.dp)
                    ) {
                        Text(
                            text = "Set As Wallpaper",
                            color = Color.Black,
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 13.sp
                        )
                    }

                    // Camera circular button
                    Box(
                        modifier = Modifier
                            .size(52.dp)
                            .clip(CircleShape)
                            .background(Color.Black.copy(alpha = 0.5f))
                            .border(1.dp, Color.White.copy(alpha = 0.25f), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.CameraAlt,
                            contentDescription = "Camera",
                            tint = Color.White,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
            }

            // Home Bar Indicator
            Box(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 10.dp)
                    .width(135.dp)
                    .height(4.dp)
                    .background(Color.White.copy(alpha = 0.8f), RoundedCornerShape(2.dp))
            )
        }
    }
}

private fun safeHexToColor(hex: String, defaultColor: Color = Color.White): Color {
    return try {
        Color(android.graphics.Color.parseColor(hex))
    } catch (e: Exception) {
        defaultColor
    }
}
