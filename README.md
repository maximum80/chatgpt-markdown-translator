# chatgpt-markdown-translator

このスクリプトは、Google Apps Scriptを使って、Googleドライブ上のMarkdownファイルを日本語に翻訳します。翻訳には、OpenAIのGPT-3.5を使用しています。

## 必要なもの
このスクリプトを使用するためには、以下が必要です。

- Googleアカウント
- Googleドライブ内に翻訳したいMarkdownファイルがあるフォルダのID
- Googleドライブ内に翻訳したファイルを保存するためのフォルダのID
- OpenAI APIキー

## 使い方
### 1. Googleドライブにフォルダを作成する
翻訳したいMarkdownファイルがあるフォルダと、翻訳されたファイルを保存するためのフォルダをそれぞれ作成します。これらのフォルダのIDを取得しておきます。

### 2. Google APIとOpenAI APIのキーを取得する
このスクリプトを使用するには、Google APIとOpenAI APIのキーが必要です。

#### Google APIのキーを取得する方法
1. [Google Cloud Console](https://console.cloud.google.com/)にアクセスします。
2. 左上のメニューから、「APIとサービス」 → 「ダッシュボード」を選択します。
3. 「＋APIとサービス」を選択し、「Google Drive API」を検索して有効化します。
4. 左上のメニューから、「APIとサービス」 → 「認証情報」を選択します。
5. 「＋認証情報を作成」をクリックして、「サービスアカウント」を選択します。
6. 必要事項を記入し、キーの作成を行います。
7. 作成したキーをダウンロードし、キーファイルのパスを控えておきます。

#### OpenAI APIのキーを取得する方法
1. [OpenAIのダッシュボード](https://beta.openai.com/dashboard/)にアクセスし、ログインします。
2. 「Settings」からAPIキーを取得します。

### 3. スクリプトを設定する
1. Googleドライブにアクセスし、新しいGoogle Apps Scriptプロジェクトを作成します。
2. `translate_using_chatgpt.gs`の内容をコピーして、新しいスクリプトファイルに貼り付けます。
3. `inputFolderId`と`outputFolderId`を、それぞれ翻訳元のフォルダIDと翻訳先のフォルダIDに置き換えます。IDは、Googleドライブでフォルダを開いたときのURLの末尾にあるものです。例えば、`https://drive.google.com/drive/folders/xxxxxxxxxxxxxxxxxxxxxxxxx`の`xxxxxxxxxxxxxxxxxxxxxxxxx`がIDになります。
4. Google APIとOpenAI APIのキーを、それぞれ取得したキーに置き換えます。
5. スクリプトファイルを保存し、ファイル名を適切に設定します。

### 4. スクリプトを実行する
1. スクリプトファイルを開きます。
2. 編集可能なプロンプト領域が表示されるため、`RUN`ボタンをクリックして、スクリプトを実行します。
3. Googleドライブ内の指定したフォルダ内にあるMarkdownファイルが自動的に翻訳され、翻訳されたファイルが指定したフォルダに保存されます。

