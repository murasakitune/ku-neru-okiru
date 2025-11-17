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

// グローバル変数
let currentUser = null;

// ページ読み込み時の処理
document.addEventListener('DOMContentLoaded', async () => {
    const initialized = await initializeSupabase();
    if (!initialized) {
        showMessage('システムエラーが発生しました', 'error');
        return;
    }
    await checkAuth();
    await loadActivities();
    setupEventListeners();
});

// 認証チェック
async function checkAuth() {
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
        window.location.href = 'index.html';
        return;
    }
    
    currentUser = data.session.user;
}

// イベントリスナーの設定
function setupEventListeners() {
    // ログアウトボタン
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // 新規登録フォーム
    document.querySelectorAll('.add-activity-form').forEach(form => {
        form.addEventListener('submit', handleAddActivity);
    });
    
    // 編集モーダル
    document.getElementById('cancelEdit').addEventListener('click', closeEditModal);
    document.getElementById('editForm').addEventListener('submit', handleEditActivity);
    
    // モーダル外クリックで閉じる
    document.getElementById('editModal').addEventListener('click', (e) => {
        if (e.target.id === 'editModal') {
            closeEditModal();
        }
    });
}

// アクティビティデータの読み込み
async function loadActivities() {
    if (!currentUser) return;
    
    try {
        // 各アクティビティ種別ごとにデータを取得
        for (let typeId = 1; typeId <= 3; typeId++) {
            const { data, error } = await supabase
                .from('activities')
                .select('*')
                .eq('user_id', currentUser.id)
                .eq('activity_type_id', typeId)
                .order('recorded_at', { ascending: false });
            
            if (error) {
                console.error(`アクティビティ ${typeId} の読み込みエラー:`, error);
                continue;
            }
            
            renderActivityTable(typeId, data || []);
        }
    } catch (error) {
        console.error('データ読み込みエラー:', error);
        showMessage('データの読み込みに失敗しました', 'error');
    }
}

// アクティビティテーブルのレンダリング
function renderActivityTable(typeId, activities) {
    const tbody = document.getElementById(`activity-${typeId}`);
    tbody.innerHTML = '';
    
    if (activities.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" class="no-data">データがありません</td></tr>';
        return;
    }
    
    activities.forEach(activity => {
        const row = document.createElement('tr');
        const recordedAt = new Date(activity.recorded_at);
        const formattedDate = recordedAt.toLocaleString('ja-JP');
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td class="actions">
                <button class="btn btn-small btn-edit" data-id="${activity.id}" data-datetime="${activity.recorded_at}">編集</button>
                <button class="btn btn-small btn-delete" data-id="${activity.id}">削除</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // 編集・削除ボタンのイベントリスナーを設定
    tbody.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', openEditModal);
    });
    
    tbody.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', handleDeleteActivity);
    });
}

// 新規アクティビティ登録
async function handleAddActivity(e) {
    e.preventDefault();
    
    const form = e.target;
    const typeId = parseInt(form.getAttribute('data-type'));
    const datetimeInput = form.querySelector('.datetime-input');
    const recordedAt = datetimeInput.value;
    
    if (!recordedAt) {
        showMessage('日時を入力してください', 'error');
        return;
    }
    
    try {
        const { data, error } = await supabase
            .from('activities')
            .insert([
                {
                    user_id: currentUser.id,
                    activity_type_id: typeId,
                    recorded_at: new Date(recordedAt).toISOString()
                }
            ])
            .select();
        
        if (error) {
            throw error;
        }
        
        showMessage('登録しました！', 'success');
        datetimeInput.value = '';
        await loadActivities(); // テーブルを再読み込み
        
    } catch (error) {
        console.error('登録エラー:', error);
        showMessage('登録に失敗しました: ' + error.message, 'error');
    }
}

// 編集モーダルを開く
function openEditModal(e) {
    const button = e.target;
    const activityId = button.getAttribute('data-id');
    const recordedAt = button.getAttribute('data-datetime');
    
    // datetime-local形式に変換
    const date = new Date(recordedAt);
    const formattedDate = date.toISOString().slice(0, 16);
    
    document.getElementById('editActivityId').value = activityId;
    document.getElementById('editDateTime').value = formattedDate;
    document.getElementById('editModal').style.display = 'block';
}

// 編集モーダルを閉じる
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// アクティビティ編集
async function handleEditActivity(e) {
    e.preventDefault();
    
    const activityId = document.getElementById('editActivityId').value;
    const recordedAt = document.getElementById('editDateTime').value;
    
    try {
        const { data, error } = await supabase
            .from('activities')
            .update({ recorded_at: new Date(recordedAt).toISOString() })
            .eq('id', activityId)
            .select();
        
        if (error) {
            throw error;
        }
        
        showMessage('更新しました！', 'success');
        closeEditModal();
        await loadActivities(); // テーブルを再読み込み
        
    } catch (error) {
        console.error('更新エラー:', error);
        showMessage('更新に失敗しました: ' + error.message, 'error');
    }
}

// アクティビティ削除
async function handleDeleteActivity(e) {
    const button = e.target;
    const activityId = button.getAttribute('data-id');
    
    if (!confirm('本当に削除しますか？')) {
        return;
    }
    
    try {
        const { error } = await supabase
            .from('activities')
            .delete()
            .eq('id', activityId);
        
        if (error) {
            throw error;
        }
        
        showMessage('削除しました', 'success');
        await loadActivities(); // テーブルを再読み込み
        
    } catch (error) {
        console.error('削除エラー:', error);
        showMessage('削除に失敗しました: ' + error.message, 'error');
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
