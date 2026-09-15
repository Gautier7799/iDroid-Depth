package com.example.depthlockscreen.ml

import android.content.Context
import android.graphics.*
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.segmentation.subject.SubjectSegmentation
import com.google.mlkit.vision.segmentation.subject.SubjectSegmenterOptions
import kotlinx.coroutines.tasks.await

class SubjectSegmenterHelper(context: Context) {
    private val options = SubjectSegmenterOptions.Builder()
        .enableForegroundBitmap()
        .build()
    private val segmenter = SubjectSegmentation.getClient(options)

    suspend fun extractForegroundSubject(originalBitmap: Bitmap): Bitmap {
        // 1. محاولة عزل العنصر والشخصية بذكاء Google ML Kit بدون إنترنت
        try {
            val inputImage = InputImage.fromBitmap(originalBitmap, 0)
            val result = segmenter.process(inputImage).await()
            val fg = result.foregroundBitmap
            if (fg != null) {
                return fg
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        // 2. نظام عزل فوري احتياطي ذكي (Smart Focal Cutout):
        // يضمن ظهور عمق الساعة ثلاثية الأبعاد بدون أي شاشة سوداء حتى لو كان موديل Google لا يزال قيد التحميل
        return generateFocalCutout(originalBitmap)
    }

    private fun generateFocalCutout(original: Bitmap): Bitmap {
        val result = Bitmap.createBitmap(original.width, original.height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(result)
        val paint = Paint(Paint.ANTI_ALIAS_FLAG)
        canvas.drawBitmap(original, 0f, 0f, paint)

        val maskPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            xfermode = PorterDuffXfermode(PorterDuff.Mode.DST_IN)
            shader = RadialGradient(
                original.width / 2f,
                original.height * 0.62f,
                original.width * 0.55f,
                intArrayOf(Color.BLACK, Color.BLACK, Color.TRANSPARENT),
                floatArrayOf(0f, 0.65f, 1f),
                Shader.TileMode.CLAMP
            )
        }
        canvas.drawRect(0f, 0f, original.width.toFloat(), original.height.toFloat(), maskPaint)
        return result
    }
}
