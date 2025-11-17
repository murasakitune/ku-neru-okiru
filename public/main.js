// Supabaseクライアントの初期化
let supabase = null;

// 設定を取得してSupabaseクライアントを初期化
async function initializeSupabase() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        
        if (config.supabaseUrl && config.supabaseAnonKey) {
            supabase = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
            return true;
        } else {
            console.error('Supabase設定の取得に失敗しました');
            return false;
        }
    } catch (error) {
        console.error('設定取得エラー:', error);
        return false;
    }
}

// ページ読み込み時の処理
document.addEventListener('DOMContentLoaded', async () => {
    const initialized = await initializeSupabase();
    if (!initialized) {
        showMessage('システムエラーが発生しました', 'error');
        return;
    }
    await checkAuth();
    setupEventListeners();
});

// 認証チェック
async function checkAuth() {
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
        window.location.href = 'index.html';
        return;
    }
    
    // ユーザー情報を表示
    const userEmail = document.getElementById('userEmail');
    userEmail.textContent = data.session.user.email;
}

// イベントリスナーの設定
function setupEventListeners() {
    // アクティビティボタン
    document.querySelectorAll('.activity-btn').forEach(button => {
        button.addEventListener('click', handleActivityClick);
    });
    
    // ログアウトボタン
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

// アクティビティ記録処理
async function handleActivityClick(e) {
    const button = e.currentTarget;
    const activityTypeId = button.getAttribute('data-type');
    
    // ボタンを無効化してフィードバック表示
    button.disabled = true;
    button.classList.add('loading');
    
    try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
            throw new Error('セッションが無効です');
        }
        
        const recordedAt = new Date().toISOString();
        
        // アクティビティを記録
        const { data, error } = await supabase
            .from('activities')
            .insert([
                {
                    user_id: sessionData.session.user.id,
                    activity_type_id: parseInt(activityTypeId),
                    recorded_at: recordedAt
                }
            ])
            .select();
        
        if (error) {
            throw error;
        }
        
        showMessage('記録しました！', 'success');
        
        // 成功時のアニメーション
        button.classList.add('success');
        setTimeout(() => {
            button.classList.remove('success', 'loading');
            button.disabled = false;
        }, 1000);
        
    } catch (error) {
        console.error('記録エラー:', error);
        showMessage('記録に失敗しました: ' + error.message, 'error');
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// ログアウト処理
async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        showMessage('ログアウトに失敗しました', 'error');
    } else {
        window.location.href = 'index.html';
    }
}

// メッセージ表示関数
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}
