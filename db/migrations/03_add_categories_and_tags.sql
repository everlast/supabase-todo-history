-- カテゴリテーブルの作成
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3498db',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now())
);

-- todosテーブルにカテゴリ参照とタグ列を追加
ALTER TABLE todos ADD COLUMN category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE todos ADD COLUMN tags JSONB DEFAULT '[]'::jsonb;

-- カテゴリテーブルのRLS (Row Level Security) ポリシー
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ユーザーは自分のカテゴリのみ選択可能" 
ON categories FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のカテゴリのみ挿入可能" 
ON categories FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のカテゴリのみ更新可能" 
ON categories FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "ユーザーは自分のカテゴリのみ削除可能" 
ON categories FOR DELETE 
USING (auth.uid() = user_id);

-- トリガー関数を更新して、カテゴリとタグの変更も記録するように
CREATE OR REPLACE FUNCTION record_todo_history()
RETURNS TRIGGER AS $$
DECLARE
  action_type TEXT;
  details_json JSONB;
BEGIN
  details_json = jsonb_build_object('title', NEW.title, 'description', NEW.description, 'category_id', NEW.category_id, 'tags', NEW.tags);
  
  IF TG_OP = 'INSERT' THEN
    action_type := 'created';
  ELSIF TG_OP = 'UPDATE' THEN
    -- 完了ステータスが変更された場合
    IF OLD.is_completed IS DISTINCT FROM NEW.is_completed THEN
      IF NEW.is_completed THEN
        action_type := 'completed';
      ELSE
        action_type := 'reopened';
      END IF;
    ELSE
      action_type := 'updated';
    END IF;
    
    -- 変更前後の値を詳細に記録
    details_json = details_json || jsonb_build_object(
      'previous', jsonb_build_object(
        'title', OLD.title, 
        'description', OLD.description,
        'is_completed', OLD.is_completed,
        'category_id', OLD.category_id,
        'tags', OLD.tags
      ),
      'current', jsonb_build_object(
        'title', NEW.title, 
        'description', NEW.description,
        'is_completed', NEW.is_completed,
        'category_id', NEW.category_id,
        'tags', NEW.tags
      )
    );
  END IF;

  -- 履歴レコードを挿入
  INSERT INTO todo_history (todo_id, action, details)
  VALUES (NEW.id, action_type, details_json);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
