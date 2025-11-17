-- アクティビティ種別テーブル
CREATE TABLE IF NOT EXISTS activity_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- アクティビティ記録テーブル
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type_id INTEGER NOT NULL REFERENCES activity_types(id),
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 初期データ挿入（食う・寝る・起きる）
INSERT INTO activity_types (id, name) VALUES
  (1, '食う'),
  (2, '寝る'),
  (3, '起きる')
ON CONFLICT (id) DO NOTHING;

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_recorded_at ON activities(recorded_at);
CREATE INDEX IF NOT EXISTS idx_activities_activity_type_id ON activities(activity_type_id);

-- 行レベルセキュリティ（RLS）の有効化
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- RLSポリシー：ユーザーは自分のデータのみアクセス可能
CREATE POLICY "ユーザーは自分のアクティビティのみアクセス可能" ON activities
  FOR ALL USING (auth.uid() = user_id);
