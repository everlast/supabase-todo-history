# Supabase TODOアプリ 履歴機能付き

![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)

SupabaseとReactを使用したTODOアプリケーションです。タスク管理と操作履歴の追跡機能を備えています。ユーザー認証機能を実装しており、ユーザーごとのタスク管理が可能です。

## 機能

- **認証機能**
  - メール/パスワードでのサインアップ、ログイン
  - Google認証によるソーシャルログイン
  - パスワードのリセットと更新
  - ユーザーごとのデータ分離

- **タスク管理**
  - TODOタスクの作成、編集、削除
  - タスクの完了/未完了の切り替え
  - タスク操作の履歴追跡
  - 履歴の閲覧（全体または特定のタスク）
  - レスポンシブデザイン

## スクリーンショット

※アプリケーションの実行時に追加予定

## 技術スタック

- **フロントエンド**: React、React Router
- **バックエンド**: Supabase（PostgreSQL、認証API）
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);
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

### 3. Row Level Security (RLS) ポリシー

```sql
-- ユーザーは自分のTODOのみ選択可能
CREATE POLICY "ユーザーは自分のTODOのみ選択可能" 
ON todos FOR SELECT 
USING (auth.uid() = user_id);

-- ユーザーは自分のTODOのみ挿入可能
CREATE POLICY "ユーザーは自分のTODOのみ挿入可能" 
ON todos FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のTODOのみ更新可能
CREATE POLICY "ユーザーは自分のTODOのみ更新可能" 
ON todos FOR UPDATE 
USING (auth.uid() = user_id);

-- ユーザーは自分のTODOのみ削除可能
CREATE POLICY "ユーザーは自分のTODOのみ削除可能" 
ON todos FOR DELETE 
USING (auth.uid() = user_id);

-- ユーザーは自分のTODOの履歴のみ選択可能
CREATE POLICY "ユーザーは自分のTODOの履歴のみ選択可能" 
ON todo_history FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM todos 
    WHERE todos.id = todo_history.todo_id 
    AND todos.user_id = auth.uid()
  )
);
```

## 認証機能の設定

Supabaseの認証機能を使用するためには、以下の設定を行う必要があります：

1. Supabaseダッシュボードで「Authentication」を選択
2. メール認証を有効にする（デフォルトで有効）
3. 必要に応じてGoogle認証を設定
   - OAuth認証情報をGoogleデベロッパーコンソールで作成
   - Client IDとClient Secretをダッシュボードに入力
   - リダイレクトURLを設定

## 本番環境へのデプロイ

1. ビルドの作成
```bash
npm run build
```

2. 任意のホスティングサービスにデプロイ
   - Netlify, Vercel, GitHub Pagesなど

## 拡張アイデア

- **認証機能の拡張**
  - 追加のソーシャルログインプロバイダー (Facebook, Twitter, Githubなど)
  - ユーザープロファイル管理

- **チーム機能**
  - タスクの共有とコラボレーション
  - チームメンバー間の権限設定

- **機能の拡張**
  - タスクのカテゴリ分類やタグ付け
  - 期限日設定と通知機能
  - 優先度の設定
  - ファイル添付機能

- **UI/UX改善**
  - ドラッグ&ドロップによる並べ替え
  - タスクフィルタリング機能
  - ダークモード対応

- **リアルタイム更新**
  - Supabase Realtimeを使用したリアルタイムデータ同期
  - 複数デバイス間での即時反映

## 開発者

- [everlast](https://github.com/everlast)

## ライセンス

MIT
