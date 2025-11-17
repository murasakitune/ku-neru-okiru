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

// ログイン/新規登録フォームの切り替え
document.getElementById('showRegister').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.auth-form').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
});

document.getElementById('showLogin').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('registerForm').style.display = 'none';
    document.querySelector('.auth-form').style.display = 'block';
});

// ログインフォームの処理
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Supabaseが初期化されているか確認
    if (!supabase) {
        const initialized = await initializeSupabase();
        if (!initialized) {
            showMessage('システムエラーが発生しました', 'error');
            return;
        }
    }
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        showMessage(error.message, 'error');
    } else {
        showMessage('ログイン成功！', 'success');
        setTimeout(() => {
            window.location.href = 'main.html';
        }, 1000);
    }
});

// 新規登録フォームの処理
document.getElementById('registerFormElement').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Supabaseが初期化されているか確認
    if (!supabase) {
        const initialized = await initializeSupabase();
        if (!initialized) {
            showMessage('システムエラーが発生しました', 'error');
            return;
        }
    }
    
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password
    });

    if (error) {
        showMessage(error.message, 'error');
    } else {
        showMessage('登録完了！確認メールを送信しました。', 'success');
        setTimeout(() => {
            document.getElementById('registerForm').style.display = 'none';
            document.querySelector('.auth-form').style.display = 'block';
        }, 2000);
    }
});

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

// ページ読み込み時にセッションをチェック
async function checkSession() {
    // Supabaseが初期化されているか確認
    if (!supabase) {
        const initialized = await initializeSupabase();
        if (!initialized) {
            console.error('Supabaseの初期化に失敗しました');
            return;
        }
    }
    
    const { data } = await supabase.auth.getSession();
    if (data.session) {
        window.location.href = 'main.html';
    }
}

// ページ読み込み時に初期化とセッションチェックを実行
document.addEventListener('DOMContentLoaded', async () => {
    await initializeSupabase();
    await checkSession();
});
