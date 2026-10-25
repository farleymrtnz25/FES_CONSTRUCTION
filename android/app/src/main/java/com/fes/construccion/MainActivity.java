package com.fes.construccion;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.core.content.FileProvider;

import com.getcapacitor.BridgeActivity;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                WebView webView = getBridge().getWebView();
                webView.getSettings().setJavaScriptEnabled(true);
                webView.getSettings().setDomStorageEnabled(true);
                webView.addJavascriptInterface(new AndroidDownloader(this), "AndroidDownloader");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public class AndroidDownloader {
        private final Context context;

        public AndroidDownloader(Context context) {
            this.context = context;
        }

        @JavascriptInterface
        public void saveBase64File(String base64Data, String fileName, String mimeType) {
            try {
                byte[] fileBytes = Base64.decode(base64Data, Base64.DEFAULT);
                Uri contentUriToOpen = null;

                // 1. Guardar en la carpeta pública de Descargas (Downloads) en Android 10+ (API 29+)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.Downloads.DISPLAY_NAME, fileName);
                    values.put(MediaStore.Downloads.MIME_TYPE, mimeType != null ? mimeType : "application/pdf");
                    values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);

                    ContentResolver resolver = context.getContentResolver();
                    Uri uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                    if (uri != null) {
                        try (OutputStream out = resolver.openOutputStream(uri)) {
                            if (out != null) {
                                out.write(fileBytes);
                                out.flush();
                            }
                        }
                        contentUriToOpen = uri;
                    }
                } else {
                    File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                    if (!downloadsDir.exists()) {
                        downloadsDir.mkdirs();
                    }
                    File outFile = new File(downloadsDir, fileName);
                    try (FileOutputStream fos = new FileOutputStream(outFile)) {
                        fos.write(fileBytes);
                        fos.flush();
                    }
                    contentUriToOpen = FileProvider.getUriForFile(
                            context,
                            context.getPackageName() + ".fileprovider",
                            outFile
                    );
                }

                // 2. Respaldo en cache para abrir con visor PDF/Excel si MediaStore no devolvió URI directo
                if (contentUriToOpen == null) {
                    File cacheFile = new File(context.getCacheDir(), fileName);
                    try (FileOutputStream fos = new FileOutputStream(cacheFile)) {
                        fos.write(fileBytes);
                        fos.flush();
                    }
                    contentUriToOpen = FileProvider.getUriForFile(
                            context,
                            context.getPackageName() + ".fileprovider",
                            cacheFile
                    );
                }

                final Uri finalUri = contentUriToOpen;
                final String finalMime = mimeType != null ? mimeType : "application/pdf";

                runOnUiThread(() -> {
                    Toast.makeText(context, "Descargado en Descargas: " + fileName, Toast.LENGTH_LONG).show();
                    try {
                        Intent viewIntent = new Intent(Intent.ACTION_VIEW);
                        viewIntent.setDataAndType(finalUri, finalMime);
                        viewIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
                        context.startActivity(Intent.createChooser(viewIntent, "Abrir documento FES"));
                    } catch (Exception openErr) {
                        // Si no hay visor externo instalado, el archivo igual queda guardado en Descargas
                    }
                });
            } catch (Exception e) {
                runOnUiThread(() ->
                        Toast.makeText(context, "Error al guardar archivo: " + e.getMessage(), Toast.LENGTH_LONG).show()
                );
            }
        }
    }
}
