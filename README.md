# Supabase TODOアプリ 履歴機能付き

![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)

SupabaseとReactを使用したTODOアプリケーションです。タスク管理と操作履歴の追跡機能を備えています。

## 機能

- TODOタスクの作成、編集、削除
- タスクの完了/未完了の切り替え
- タスク操作の履歴追跡
- 履歴の閲覧（全体または特定のタスク）
- レスポンシブデザイン

## スクリーンショット

※アプリケーションの実行時に追加予定

## 技術スタック

- **フロントエンド**: React
- **バックエンド**: Supabase（PostgreSQL）
- **ホスティング**: ※自由に選択可能

## インストール方法

1. リポジトリをクローン
```bash
git clone https://github.com/everlast/supabase-todo-history.git
cd supabase-todo-history
```

2. 依存パッケージをインストール
```bash
npm install
```

3. 環境変数を設定（`.env.local`ファイルを作成）
```
REACT_APP_SUPABASE_URL=YOUR_SUPABASE_URL
REACT_APP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

4. アプリケーションを起動
```bash
npm start
```

## Supabaseのセットアップ

### 1. テーブル構造

#### todos テーブル
```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now())
);

-- RLSポリシー
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "全ユーザーがtodosにアクセス可能" ON todos FOR ALL USING (true);
```

#### todo_history テーブル
```sql
CREATE TABLE todo_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  todo_id UUID NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'created', 'updated', 'completed', 'reopened'
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now())
);

-- RLSポリシー
ALTER TABLE todo_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "全ユーザーがtodo_history" ON todo_history FOR ALL USING (true);
```

### 2. トリガー関数

```sql
-- updated_atを自動更新する関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = TIMEZONE('utc'::text, now()); 
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- todosのupdated_atを自動更新するトリガー
CREATE TRIGGER update_todos_updated_at
BEFORE UPDATE ON todos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- TODOの履歴を自動的に記録する関数
CREATE OR REPLACE FUNCTION record_todo_history()
RETURNS TRIGGER AS $$
DECLARE
  action_type TEXT;
  details_json JSONB;
BEGIN
  details_json = jsonb_build_object('title', NEW.title, 'description', NEW.description);
  
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
        'is_completed', OLD.is_completed
      ),
      'current', jsonb_build_object(
        'title', NEW.title, 
        'description', NEW.description,
        'is_completed', NEW.is_completed
      )
    );
  END IF;

  -- 履歴レコードを挿入
  INSERT INTO todo_history (todo_id, action, details)
  VALUES (NEW.id, action_type, details_json);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TODOの作成と更新時に履歴を記録するトリガー
CREATE TRIGGER record_todos_history
AFTER INSERT OR UPDATE ON todos
FOR EACH ROW
EXECUTE FUNCTION record_todo_history();
```

## 本番環境へのデプロイ

1. ビルドの作成
```bash
npm run build
```

2. 任意のホスティングサービスにデプロイ
   - Netlify, Vercel, GitHub Pagesなど

## 拡張アイデア

- ユーザー認証
- タスクのカテゴリ分類
- タスクの期限日設定
- チーム共有機能
- プロジェクト管理機能
- Supabase Realtimeを使用したリアルタイム更新

## 開発者

- [everlast](https://github.com/everlast)

## ライセンス

MIT
