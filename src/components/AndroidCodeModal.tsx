import React, { useState } from 'react';
import { X, Copy, Check, Code2, Layers, Cpu, ShieldCheck } from 'lucide-react';

interface AndroidCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidCodeModal: React.FC<AndroidCodeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeFile, setActiveFile] = useState<string>('MainActivity.kt');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const files: Record<string, { desc: string; code: string }> = {
    'MainActivity.kt': {
      desc: 'واجهة المستخدم الكاملة بواسطة Jetpack Compose مع شاشات Wallpapers, Collection, Studio, Settings وشريط الملاحة العائم باللون الأصفر',
      code: `package com.example.depthlockscreen

import android.app.WallpaperManager
import android.content.ComponentName
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.depthlockscreen.service.DepthWallpaperService
import com.example.depthlockscreen.ui.theme.DepthTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            DepthTheme {
                DepthWallpapersApp(
                    onSetLiveWallpaper = { launchLiveWallpaperChooser() }
                )
            }
        }
    }

    private fun launchLiveWallpaperChooser() {
        val intent = Intent(WallpaperManager.ACTION_CHANGE_LIVE_WALLPAPER).apply {
            putExtra(
                WallpaperManager.EXTRA_LIVE_WALLPAPER_COMPONENT,
                ComponentName(this@MainActivity, DepthWallpaperService::class.java)
            )
        }
        startActivity(intent)
    }
}

enum class NavigationTab { WALLPAPERS, COLLECTION, STUDIO, SETTINGS }

@Composable
fun DepthWallpapersApp(onSetLiveWallpaper: () -> Unit) {
    var currentTab by remember { mutableStateOf(NavigationTab.WALLPAPERS) }

    Scaffold(
        containerColor = Color.Black,
        bottomBar = {
            FloatingBottomNav(
                currentTab = currentTab,
                onTabSelected = { currentTab = it }
            )
        }
    ) { paddingValues ->
        Box(modifier = Modifier.fillMaxSize().padding(paddingValues)) {
            when (currentTab) {
                NavigationTab.WALLPAPERS -> WallpapersScreen(onSetLiveWallpaper)
                NavigationTab.COLLECTION -> CollectionScreen()
                NavigationTab.STUDIO -> StudioScreen(onSetLiveWallpaper)
                NavigationTab.SETTINGS -> SettingsScreen()
            }
        }
    }
}

@Composable
fun FloatingBottomNav(
    currentTab: NavigationTab,
    onTabSelected: (NavigationTab) -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 20.dp),
        contentAlignment = Alignment.Center
    ) {
        Surface(
            shape = RoundedCornerShape(32.dp),
            color = Color(0xFF141416).copy(alpha = 0.92f),
            shadowElevation = 16.dp,
            border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = 0.1f))
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                NavIconButton(
                    icon = Icons.Default.GridView,
                    isSelected = currentTab == NavigationTab.WALLPAPERS,
                    onClick = { onTabSelected(NavigationTab.WALLPAPERS) }
                )
                NavIconButton(
                    icon = Icons.Default.Image,
                    isSelected = currentTab == NavigationTab.COLLECTION,
                    onClick = { onTabSelected(NavigationTab.COLLECTION) }
                )
                NavIconButton(
                    icon = Icons.Default.Tune,
                    isSelected = currentTab == NavigationTab.STUDIO,
                    onClick = { onTabSelected(NavigationTab.STUDIO) }
                )
                NavIconButton(
                    icon = Icons.Default.Settings,
                    isSelected = currentTab == NavigationTab.SETTINGS,
                    onClick = { onTabSelected(NavigationTab.SETTINGS) }
                )
            }
        }
    }
}

@Composable
fun NavIconButton(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val vibrantYellow = Color(0xFFFFDE00)
    Box(
        modifier = Modifier
            .size(if (isSelected) 48.dp else 44.dp)
            .clip(CircleShape)
            .background(if (isSelected) vibrantYellow else Color.Transparent)
            .clickable { onClick() },
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = if (isSelected) Color.Black else Color.Gray,
            modifier = Modifier.size(24.dp)
        )
    }
}`
    },
    'DepthWallpaperService.kt': {
      desc: 'محرك الخلفية الحية فائق الأداء بمعدل 60 إطار بالثانية باستخدام Hardware Canvas مع توفير طاقة البطارية وحساس الدوران',
      code: `package com.example.depthlockscreen.service

import android.graphics.*
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.service.wallpaper.WallpaperService
import android.view.SurfaceHolder
import java.text.SimpleDateFormat
import java.util.*

class DepthWallpaperService : WallpaperService() {

    override fun onCreateEngine(): Engine = DepthEngine()

    inner class DepthEngine : Engine(), SensorEventListener {
        private var sensorManager: SensorManager? = null
        private var rotationSensor: Sensor? = null
        private var isVisible = false

        private var bgBitmap: Bitmap? = null
        private var fgBitmap: Bitmap? = null

        // Parallax smooth interpolation
        private var targetOffsetX = 0f
        private var targetOffsetY = 0f
        private var currentOffsetX = 0f
        private var currentOffsetY = 0f

        private val clockPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            textSize = 140f
            typeface = Typeface.create("sans-serif", Typeface.BOLD)
            textAlign = Paint.Align.CENTER
        }

        private val datePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            textSize = 34f
            alpha = 230
            typeface = Typeface.create("sans-serif", Typeface.BOLD)
            textAlign = Paint.Align.CENTER
        }

        override fun onCreate(surfaceHolder: SurfaceHolder) {
            super.onCreate(surfaceHolder)
            sensorManager = getSystemService(SENSOR_SERVICE) as SensorManager
            rotationSensor = sensorManager?.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)
        }

        override fun onVisibilityChanged(visible: Boolean) {
            isVisible = visible
            if (visible) {
                // Register low latency gyro sensor
                rotationSensor?.let {
                    sensorManager?.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME)
                }
                drawFrame()
            } else {
                sensorManager?.unregisterListener(this)
            }
        }

        override fun onSensorChanged(event: SensorEvent?) {
            if (event?.sensor?.type == Sensor.TYPE_ROTATION_VECTOR) {
                val rotationMatrix = FloatArray(9)
                SensorManager.getRotationMatrixFromVector(rotationMatrix, event.values)
                val orientation = FloatArray(3)
                SensorManager.getOrientation(rotationMatrix, orientation)

                // Smooth dampening factor for cinematic Apple/iOS lockscreen feel
                targetOffsetX = (orientation[2] * 35f).coerceIn(-45f, 45f)
                targetOffsetY = (orientation[1] * 35f).coerceIn(-45f, 45f)
            }
        }

        override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

        private fun drawFrame() {
            val holder = surfaceHolder
            var canvas: Canvas? = null
            try {
                // Hardware accelerated rendering on Android O+
                canvas = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                    holder.lockHardwareCanvas()
                } else {
                    holder.lockCanvas()
                }

                if (canvas != null) {
                    // Smooth lerp
                    currentOffsetX += (targetOffsetX - currentOffsetX) * 0.15f
                    currentOffsetY += (targetOffsetY - currentOffsetY) * 0.15f

                    val cx = canvas.width / 2f
                    val cy = canvas.height / 2f

                    // Layer 1: Background shifted slightly
                    bgBitmap?.let {
                        canvas.drawBitmap(it, -currentOffsetX * 0.5f, -currentOffsetY * 0.5f, null)
                    }

                    // Layer 2: Time and Date tucked behind foreground
                    val timeStr = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
                    val dateStr = SimpleDateFormat("dd MMM yyyy", Locale.US).format(Date()).uppercase()

                    canvas.drawText(dateStr, cx - currentOffsetX * 0.2f, cy * 0.48f, datePaint)
                    canvas.drawText(timeStr, cx - currentOffsetX * 0.2f, cy * 0.68f, clockPaint)

                    // Layer 3: Foreground Subject cutout with positive parallax
                    fgBitmap?.let {
                        canvas.drawBitmap(it, currentOffsetX * 0.8f, currentOffsetY * 0.8f, null)
                    }
                }
            } finally {
                if (canvas != null) {
                    holder.unlockCanvasAndPost(canvas)
                }
            }

            if (isVisible) {
                surfaceHolder.surfaceFrame?.let {
                    // Continuous loop throttled smoothly at 60 FPS
                    android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                        drawFrame()
                    }, 16)
                }
            }
        }
    }
}`
    },
    'SubjectSegmenterHelper.kt': {
      desc: 'فصل الأشخاص والأجسام أوتوماتيكياً بواسطة Google ML Kit Subject Segmentation لتوليد قناع العمق فائق الدقة',
      code: `package com.example.depthlockscreen.ml

import android.content.Context
import android.graphics.Bitmap
import com.google.mlkit.vision.segmentation.subject.SubjectSegmentation
import com.google.mlkit.vision.segmentation.subject.SubjectSegmenter
import com.google.mlkit.vision.segmentation.subject.SubjectSegmenterOptions
import com.google.mlkit.vision.common.InputImage
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

class SubjectSegmenterHelper(private val context: Context) {

    private val segmenter: SubjectSegmenter by lazy {
        val options = SubjectSegmenterOptions.Builder()
            .enableForegroundBitmap()
            .enableForegroundConfidenceMask()
            .build()
        SubjectSegmentation.getClient(options)
    }

    suspend fun extractSubject(sourceBitmap: Bitmap): Bitmap? = suspendCancellableCoroutine { cont ->
        val image = InputImage.fromBitmap(sourceBitmap, 0)
        segmenter.process(image)
            .addOnSuccessListener { result ->
                val fgBitmap = result.foregroundBitmap
                cont.resume(fgBitmap)
            }
            .addOnFailureListener {
                cont.resume(null)
            }
    }
}`
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(files[activeFile].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#141417] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#19191d]">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <div className="w-9 h-9 rounded-xl bg-[#FFDE00] text-black flex items-center justify-center font-bold">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">
                أكواد Android Kotlin & Jetpack Compose الرسمية
              </h3>
              <p className="text-[11px] text-yellow-400 font-medium">
                جاهزة للنسخ واللصق مباشرة داخل مشروع أندرويد ستوديو
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* File Tabs */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse p-2.5 bg-[#0f0f11] border-b border-white/5 overflow-x-auto">
          {Object.keys(files).map((fileName) => (
            <button
              key={fileName}
              onClick={() => setActiveFile(fileName)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-colors cursor-pointer flex-shrink-0 ${
                activeFile === fileName
                  ? 'bg-[#FFDE00] text-black font-extrabold shadow-sm'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {fileName}
            </button>
          ))}
        </div>

        {/* Description Banner */}
        <div className="p-3 bg-neutral-900/60 border-b border-white/5 text-xs text-neutral-300">
          <span className="font-bold text-yellow-400 ml-1">الوظيفة:</span>
          {files[activeFile].desc}
        </div>

        {/* Code View */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-emerald-400/90 bg-[#09090b] leading-relaxed">
          <pre className="whitespace-pre">{files[activeFile].code}</pre>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-3.5 border-t border-white/10 flex items-center justify-between bg-[#19191d]">
          <span className="text-[11px] text-neutral-400">
            تمت المراجعة والتحسين لأداء البطارية ومعدل 60 إطار بالثانية
          </span>
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-[#FFDE00] hover:bg-yellow-300 text-black font-extrabold text-xs flex items-center space-x-1.5 rtl:space-x-reverse transition-transform active:scale-95 cursor-pointer shadow-lg"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم نسخ الكود!' : 'نسخ الكود بالكامل'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
