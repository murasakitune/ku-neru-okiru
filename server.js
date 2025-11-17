const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(express.json());
app.use(express.static('public'));

// 環境変数の確認
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.warn('警告: Supabaseの環境変数が設定されていません。');
    console.warn('本番環境では必ず設定してください。');
}

// ルート設定
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// app.get('/main.html', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'main.html'));
// });

// app.get('/history.html', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'history.html'));
// });

// ヘルスチェックエンドポイント
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Supabase設定エンドポイント
app.get('/api/config', (req, res) => {
    res.json({
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY
    });
});

// 404ハンドリング
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// エラーハンドリング
app.use((err, req, res, next) => {
    console.error('サーバーエラー:', err);
    res.status(500).json({ 
        error: '内部サーバーエラーが発生しました',
        message: process.env.NODE_ENV === 'production' ? 'エラーが発生しました' : err.message
    });
});

// サーバー起動
// app.listen(PORT, () => {
//     console.log(`サーバーがポート ${PORT} で起動しました`);
//     console.log(`環境: ${process.env.NODE_ENV || 'development'}`);
//     console.log(`URL: http://localhost:${PORT}`);
// });

module.exports = app;
