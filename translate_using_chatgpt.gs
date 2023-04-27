const apiKey = "your-google-api-key";
const openaiApiKey = "your-openai-api-key";

function main() {
  const inputFolderId = "your-google-drive-input-folder-id";
  const outputFolderId = "your-google-drive-output-folder-id";

  const inputFolder = DriveApp.getFolderById(inputFolderId);
  const outputFolder = DriveApp.getFolderById(outputFolderId);

  processFolder(inputFolder, outputFolder);
}

function processFolder(inputFolder, outputFolder) {
  const files = inputFolder.getFiles();
  const folders = inputFolder.getFolders();

  // 入力フォルダ内にあるマークダウンファイルを取得
  const markdownFiles = [];
  while (files.hasNext()) {
    const file = files.next();
    if (file.getMimeType() === "text/markdown" || file.getName().endsWith(".md")) {
      markdownFiles.push(file);
    }
  }

  // 入力フォルダ内にあるフォルダが出力フォルダ内に存在している場合、そのフォルダ内のファイルをチェックし、存在しないファイルのみ翻訳する
  while (folders.hasNext()) {
    const subInputFolder = folders.next();
    const subOutputFolderName = subInputFolder.getName();
    const subOutputFolderIterator = outputFolder.getFoldersByName(subOutputFolderName);
    let subOutputFolder;
    if (subOutputFolderIterator.hasNext()) {
      subOutputFolder = subOutputFolderIterator.next();
    } else {
      subOutputFolder = outputFolder.createFolder(subOutputFolderName);
    }
    processFolder(subInputFolder, subOutputFolder);
  }

  // markdownファイルを翻訳して出力フォルダに保存する
  for (const file of markdownFiles) {
    const translatedFileName = file.getName();
    const translatedFileIterator = outputFolder.getFilesByName(translatedFileName);
    if (translatedFileIterator.hasNext()) {
      // 翻訳済みのファイルがすでに存在する場合は、そのファイルを出力フォルダにコピーする
      const translatedFile = translatedFileIterator.next();
      outputFolder.addFile(translatedFile);
    } else {
      // 翻訳済みのファイルが存在しない場合は、新規に翻訳を実行し、出力フォルダに保存する
      const translatedFile = translateFile(file, outputFolder);
      outputFolder.createFile(translatedFile);
    }
  }
}

function translateFile(file, outputFolder) {
  const content = file.getBlob().getDataAsString();
  const translatedFileName = file.getName();

  // 翻訳済みのファイルがすでに存在する場合は、そのファイルを返す
  const translatedFileIterator = outputFolder.searchFiles(`title = '${translatedFileName}' and mimeType = 'text/markdown'`);
  if (translatedFileIterator.hasNext()) {
    const translatedFile = translatedFileIterator.next();
    return translatedFile.getBlob();
  }

  const translatedContent = translateTextWithChatGPT(content);
  const translatedFile = Utilities.newBlob(translatedContent, "text/markdown", translatedFileName);
  return translatedFile;
}



function translateTextWithChatGPT(text) {
  const sections = splitTextIntoSections(text, 600);
  const translatedSections = sections.map(section => {
    let translatedText = "";
    let continueTranslation = true;
    let conversationHistory = [
      {
        'role': 'system',
        'content': 'You are a helpful assistant that translates English to Japanese.'
      },
      {
        'role': 'user',
        //プロンプトは自由に編集可能。ここではマークダウンで書かれた英文を日本語に翻訳と指示しているが逆も可能。
        'content': `以下のマークダウンで記載された英文章を日本語に翻訳してください。翻訳された出力内容は、Markdown形式を維持し、コードブロックや専門用語はそのままの形で残すようにしてください。:\n${section}`
      }
    ];

    while (continueTranslation) {
      const url = "https://api.openai.com/v1/chat/completions";
      const options = {
        "method": "post",
        "headers": {
          "Authorization": `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
          "X-Slack-No-Retry": 1
        },
        "payload": JSON.stringify({
          'model': 'gpt-3.5-turbo',
          'max_tokens': 600,
          'temperature': 0.9,
          'messages': conversationHistory,
        }),
        "muteHttpExceptions": true,
      };

      const response = UrlFetchApp.fetch(url, options);
      const jsonResponse = JSON.parse(response.getContentText());
      const lastMessage = jsonResponse.choices[0].message;
      const finishReason = jsonResponse.choices[0].finish_reason;

      if (jsonResponse.error) {
        Logger.log("Error: " + jsonResponse.error.message);
        return section;
      } else {
        translatedText += lastMessage.content.trim();
        Logger.log("Translated text:\n" + translatedText);
      }

      if (finishReason === "length") {
        // コンテキストを継承して、続きをリクエストする
        conversationHistory.push(lastMessage);
        conversationHistory.push({ 'role': 'user', 'content': 'つづき' });
      } else {
        continueTranslation = false;
      }
    }

    return translatedText;
  });

  return translatedSections.join("\n");
}

function splitTextIntoSections(text, maxTokens) {
  const paragraphs = text.split("\n\n");
  const sections = [];
  let currentSection = "";
  let currentTokens = 0;

  for (const paragraph of paragraphs) {
    const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
    for (const sentence of sentences) {
      const tokensInSentence = getTokenCount(sentence) + 1; // Add 1 for the punctuation or newline character
      if (currentTokens + tokensInSentence <= maxTokens) {
        currentSection += sentence;
        currentTokens += tokensInSentence;
      } else {
        sections.push(currentSection.trim());
        currentSection = sentence;
        currentTokens = tokensInSentence;
      }
    }
    currentSection += "\n\n";
    currentTokens += 2; // Add 2 tokens for the double newline between paragraphs
  }

  if (currentSection.trim() !== "") {
    sections.push(currentSection.trim());
  }

  // Log the token count for each section
  for (const section of sections) {
    console.log(`Section token count: ${getTokenCount(section)}`);
  }

  return sections;
}

function getTokenCount(text) {
  // This is a simple estimation of tokens. For a more accurate count, consider using OpenAI's `tiktoken` Python library.
  return text.split(/\s+/).length;
}
