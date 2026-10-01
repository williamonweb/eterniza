package br.com.eternizas.cms;

import android.app.Activity;
import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.view.Gravity;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity {
    private static final String HOME = "https://eternizas.com.br/admin";
    private static final int FILE_REQUEST = 42;
    private WebView webView;
    private ValueCallback<Uri[]> fileCallback;
    private TextView offlineMessage;

    private boolean isEterniza(Uri uri) {
        if (uri == null || !"https".equalsIgnoreCase(uri.getScheme())) return false;
        String host = uri.getHost();
        return "eternizas.com.br".equalsIgnoreCase(host) || "www.eternizas.com.br".equalsIgnoreCase(host);
    }

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(12, 17, 16));
        getWindow().setNavigationBarColor(Color.rgb(12, 17, 16));
        FrameLayout screen = new FrameLayout(this);
        screen.setBackgroundColor(Color.rgb(12, 17, 16));
        webView = new WebView(this);
        screen.addView(webView, new FrameLayout.LayoutParams(-1, -1));
        offlineMessage = new TextView(this);
        offlineMessage.setText("Sem conexão. Toque para tentar novamente.");
        offlineMessage.setTextColor(Color.WHITE);
        offlineMessage.setBackgroundColor(Color.rgb(12, 17, 16));
        offlineMessage.setTextSize(18);
        offlineMessage.setGravity(Gravity.CENTER);
        offlineMessage.setVisibility(View.GONE);
        offlineMessage.setOnClickListener(view -> { offlineMessage.setVisibility(View.GONE); webView.reload(); });
        screen.addView(offlineMessage, new FrameLayout.LayoutParams(-1, -1));
        setContentView(screen);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setSafeBrowsingEnabled(true);
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);

        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (isEterniza(uri)) return false;
                String scheme = uri.getScheme();
                if (!"https".equalsIgnoreCase(scheme) && !"http".equalsIgnoreCase(scheme)
                    && !"mailto".equalsIgnoreCase(scheme) && !"tel".equalsIgnoreCase(scheme)) return true;
                try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
                catch (Exception e) { Toast.makeText(MainActivity.this, "Não foi possível abrir o link.", Toast.LENGTH_SHORT).show(); }
                return true;
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) offlineMessage.setVisibility(View.VISIBLE);
            }
            @Override public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                offlineMessage.setVisibility(View.GONE);
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                try { startActivityForResult(params.createIntent(), FILE_REQUEST); }
                catch (Exception e) {
                    fileCallback = null;
                    callback.onReceiveValue(null);
                    Toast.makeText(MainActivity.this, "Não foi possível abrir as fotos.", Toast.LENGTH_SHORT).show();
                    return false;
                }
                return true;
            }
        });
        webView.setDownloadListener((url, userAgent, contentDisposition, mimeType, contentLength) -> {
            Uri uri = Uri.parse(url);
            if (!isEterniza(uri)) {
                try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
                catch (Exception e) { Toast.makeText(this, "Download indisponível.", Toast.LENGTH_SHORT).show(); }
                return;
            }
            try {
                String fileName = URLUtil.guessFileName(url, contentDisposition, mimeType).replaceAll("[^a-zA-Z0-9._-]", "_");
                DownloadManager.Request download = new DownloadManager.Request(uri);
                download.setMimeType(mimeType);
                String cookies = CookieManager.getInstance().getCookie(url);
                if (cookies != null) download.addRequestHeader("Cookie", cookies);
                download.addRequestHeader("User-Agent", userAgent);
                download.setTitle(fileName);
                download.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                download.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);
                ((DownloadManager)getSystemService(Context.DOWNLOAD_SERVICE)).enqueue(download);
                Toast.makeText(this, "Salvando em Downloads", Toast.LENGTH_SHORT).show();
            } catch (Exception e) { Toast.makeText(this, "Não foi possível baixar o arquivo.", Toast.LENGTH_SHORT).show(); }
        });
        if (savedInstanceState != null) webView.restoreState(savedInstanceState);
        else webView.loadUrl(HOME);
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_REQUEST && fileCallback != null) {
            fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data));
            fileCallback = null;
        }
    }
    @Override protected void onSaveInstanceState(Bundle state) {
        webView.saveState(state);
        super.onSaveInstanceState(state);
    }
    @Override protected void onPause() {
        CookieManager.getInstance().flush();
        super.onPause();
    }
    @Override public void onBackPressed() {
        if (offlineMessage.getVisibility() == View.VISIBLE) { offlineMessage.setVisibility(View.GONE); webView.loadUrl(HOME); }
        else if (webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
    @Override protected void onDestroy() {
        if (fileCallback != null) { fileCallback.onReceiveValue(null); fileCallback = null; }
        webView.destroy();
        super.onDestroy();
    }
}
