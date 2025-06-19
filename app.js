import React, { useState, useEffect } from 'react';
import { MessageCircle, Share, Plus, RefreshCw, Download, Upload, Send, ArrowLeft, Cloud, CloudOff } from 'lucide-react';

const TweetService = () => {
  const [tweets, setTweets] = useState([]);
  const [newTweet, setNewTweet] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(new Set());
  const [isOnline, setIsOnline] = useState(true);

  // JSONBin.io設定
  const JSONBIN_BIN_ID = '68539e0d8561e97a5026f8bd';
  const JSONBIN_API_KEY = '$2a$10$hnfwSa2yXMZEd7v5.w.BY.yyHh7hkaPSDqZKq1MfgGgmqvTYvBTRS';
  const JSONBIN_BASE_URL = 'https://api.jsonbin.io/v3';

  // 初回読み込み
  useEffect(() => {
    loadTweets();
    // オンライン/オフライン状態の監視
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // JSONBin.ioからデータを読み込み
  const loadTweetsFromCloud = async () => {
    try {
      const response = await fetch(${JSONBIN_BASE_URL}/b/${JSONBIN_BIN_ID}/latest, {
        method: 'GET',
        headers: {
          'X-Master-Key': JSONBIN_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(HTTP error! status: ${response.status});
      }

      const data = await response.json();
      return data.record.tweets || [];
    } catch (error) {
      console.error('Cloud load error:', error);
      throw error;
    }
  };

  // JSONBin.ioにデータを保存
  const saveTweetsToCloud = async (tweetsToSave) => {
    try {
      const response = await fetch(${JSONBIN_BASE_URL}/b/${JSONBIN_BIN_ID}, {
        method: 'PUT',
        headers: {
          'X-Master-Key': JSONBIN_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tweets: tweetsToSave,
          lastUpdated: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(HTTP error! status: ${response.status});
      }

      return await response.json();
    } catch (error) {
      console.error('Cloud save error:', error);
      throw error;
    }
  };

  // ローカルストレージからの読み込み（オフライン時のフォールバック）
  const loadTweetsFromLocal = () => {
    try {
      const savedTweets = localStorage.getItem('tweets-service-t-local');
      return savedTweets ? JSON.parse(savedTweets) : [];
    } catch (error) {
      console.error('Local load error:', error);
      return [];
    }
  };

  // ローカルストレージへの保存（オフライン時のバックアップ）
  const saveTweetsToLocal = (tweetsToSave) => {
    try {
      localStorage.setItem('tweets-service-t-local', JSON.stringify(tweetsToSave));
    } catch (error) {
      console.error('Local save error:', error);
    }
  };

  // 初期サンプルデータ
  const getSampleTweets = () => [
    {
      id: 1,
      username: 'さくら',
      handle: '@sakura_chan',
      time: '2分前',
      content: '今日はお天気がとても良くて、お散歩が楽しかったです🌸✨',
      replies: [],
      avatar: '🌸',
      timestamp: Date.now() - 120000
    },
    {
      id: 2,
      username: 'みかん',
      handle: '@mikan_love',
      time: '5分前',
      content: 'カフェで新しいスイーツを発見！めちゃくちゃ美味しそう〜🍰💕',
      replies: [
        {
          id: 21,
          username: 'ひまわり',
          handle: '@himawari_sun',
          time: '3分前',
          content: 'どこのカフェですか？私も行ってみたいです！',
          avatar: '🌻',
          timestamp: Date.now() - 180000
        }
      ],
      avatar: '🍊',
      timestamp: Date.now() - 300000
    },
    {
      id: 3,
      username: 'ひまわり',
      handle: '@himawari_sun',
      time: '10分前',
      content: 'プログラミング勉強中！今日はReactを触ってみました👩‍💻',
      replies: [],
      avatar: '🌻',
      timestamp: Date.now() - 600000
    }
  ];

  // データ読み込み（クラウド→ローカル→サンプルの順で試行）
  const loadTweets = async () => {
    setIsLoading(true);
    try {
      let loadedTweets = [];
      
      if (isOnline) {
        try {
          // まずクラウドから読み込み
          loadedTweets = await loadTweetsFromCloud();
          setMessage('☁️ クラウドからデータを読み込みました');
        } catch (error) {
          // クラウドに失敗した場合はローカルから読み込み
          loadedTweets = loadTweetsFromLocal();
          setMessage('💾 ローカルからデータを読み込みました');
        }
      } else {
        // オフラインの場合はローカルから読み込み
        loadedTweets = loadTweetsFromLocal();
        setMessage('📱 オフライン: ローカルデータを読み込みました');
      }

      // データがない場合はサンプルデータを使用
      if (loadedTweets.length === 0) {
        loadedTweets = getSampleTweets();
        setMessage('✨ サンプルデータを読み込みました');
        // サンプルデータもローカルに保存
        saveTweetsToLocal(loadedTweets);
        // オンラインならクラウドにも保存
        if (isOnline) {
          try {
            await saveTweetsToCloud(loadedTweets);
          } catch (error) {
            console.error('Failed to save sample data to cloud:', error);
          }
        }
      }

      setTweets(loadedTweets);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Load error:', error);
      setMessage('❌ データの読み込みに失敗しました');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // データ保存（クラウドとローカル両方）
  const saveTweets = async (tweetsToSave) => {
    // まずローカルに保存（即座に反映）
    saveTweetsToLocal(tweetsToSave);
    
    // オンラインならクラウドにも保存
    if (isOnline) {
      try {
        await saveTweetsToCloud(tweetsToSave);
      } catch (error) {
        console.error('Failed to save to cloud:', error);
        setMessage('⚠️ クラウドへの保存に失敗しました（ローカルには保存済み）');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  // つぶやきを投稿
  const handleTweet = async () => {
    if (newTweet.trim()) {
      const tweet = {
        id: Date.now(),
        username: 'あなた',
        handle: '@you',
        time: 'たった今',
        content: newTweet,
        replies: [],
        avatar: '💎',
        timestamp: Date.now()
      };
      const updatedTweets = [tweet, ...tweets];
      setTweets(updatedTweets);
      setNewTweet('');
      
      await saveTweets(updatedTweets);
      setMessage('✅ つぶやきを投稿しました');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  // リプライを投稿
  const handleReply = async (tweetId) => {
    if (replyText.trim()) {
      const reply = {
        id: Date.now(),
        username: 'あなた',
        handle: '@you',
        time: 'たった今',
        content: replyText,
        avatar: '💎',
        timestamp: Date.now()
      };
      
      const updatedTweets = tweets.map(tweet => {
        if (tweet.id === tweetId) {
          return {
            ...tweet,
            replies: [...tweet.replies, reply]
          };
        }
        return tweet;
      });
      
      setTweets(updatedTweets);
      setReplyText('');
      setReplyingTo(null);
      await saveTweets(updatedTweets);
      
      // リプライ投稿後、そのツイートのリプライを表示
      const newShowReplies = new Set(showReplies);
      newShowReplies.add(tweetId);
      setShowReplies(newShowReplies);
      
      setMessage('✅ リプライを投稿しました');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  // リプライ表示の切り替え
  const toggleReplies = (tweetId) => {
    const newShowReplies = new Set(showReplies);
    if (newShowReplies.has(tweetId)) {
      newShowReplies.delete(tweetId);
    } else {
      newShowReplies.add(tweetId);
    }
    setShowReplies(newShowReplies);
  };

  // データをJSONファイルとしてダウンロード
  const exportData = () => {
    const data = {
      tweets,
      exportDate: new Date().toISOString(),
      source: 'JSONBin Tweet Service'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = tweets-backup-${new Date().toISOString().split('T')[0]}.json;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setMessage('✅ データをダウンロードしました');
    setTimeout(() => setMessage(''), 2000);
  };

  // JSONファイルからデータをインポート
  const importData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.tweets && Array.isArray(data.tweets)) {
          setTweets(data.tweets);
          await saveTweets(data.tweets);
          setMessage('✅ データをインポートしました');
          setTimeout(() => setMessage(''), 2000);
        } else {
          throw new Error('無効なデータ形式です');
        }
      } catch (err) {
        console.error('Import error:', err);
        setMessage('❌ データのインポートに失敗しました');
        setTimeout(() => setMessage(''), 3000);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // データをクリア
  const clearData = async () => {
    if (window.confirm('すべてのデータを削除しますか？この操作は元に戻せません。')) {
      const emptyTweets = [];
      setTweets(emptyTweets);
      await saveTweets(emptyTweets);
      localStorage.removeItem('tweets-service-t-local');
      setMessage('✅ データをクリアしました');
      setTimeout(() => setMessage(''), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-sky-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-cyan-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
              <span className="text-3xl">💎</span>
              つぶやきサービス「T」
            </h1>
            <div className="flex gap-2 items-center">
              {/* オンライン状態表示 */}
              <div className={flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                isOnline 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }}>
                {isOnline ? <Cloud size={14} /> : <CloudOff size={14} />}
                {isOnline ? 'オンライン' : 'オフライン'}
              </div>
              
              <button
                onClick={loadTweets}
                disabled={isLoading}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                title="更新"
              >
                <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={exportData}
                className="p-2 text-green-500 hover:bg-green-50 rounded-full transition-colors"
                title="データをダウンロード"
              >
                <Download size={20} />
              </button>
              <label className="p-2 text-cyan-500 hover:bg-cyan-50 rounded-full transition-colors cursor-pointer" title="データをインポート">
                <Upload size={20} />
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
              <button
                onClick={clearData}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="データをクリア"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Status Message */}
        {message && (
          <div className="bg-white/90 backdrop-blur-sm border-2 border-blue-200 rounded-2xl p-3 mb-4 text-center font-medium">
            {message}
          </div>
        )}

        {/* Tweet Compose */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 mb-6 shadow-lg border border-cyan-100">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-300 to-blue-300 rounded-full flex items-center justify-center text-xl">
              💎
            </div>
            <div className="flex-1">
              <textarea
                value={newTweet}
                onChange={(e) => setNewTweet(e.target.value)}
                placeholder="今、何してる？✨"
                className="w-full p-4 border-2 border-cyan-200 rounded-2xl resize-none focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-cyan-50/50"
                rows="3"
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-gray-500">
                  {280 - newTweet.length} 文字
                </span>
                <button
                  onClick={handleTweet}
                  disabled={!newTweet.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-400 text-white rounded-full font-medium hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <Plus size={16} />
                  つぶやく
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-8">
            <RefreshCw className="animate-spin mx-auto mb-2 text-blue-500" size={32} />
            <p className="text-gray-600">読み込み中...</p>
          </div>
        )}

        {/* Tweet List */}
        <div className="space-y-4">
          {tweets.map((tweet) => (
            <div key={tweet.id} className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-cyan-100 hover:shadow-xl transition-all duration-200">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-300 to-blue-300 rounded-full flex items-center justify-center text-xl shrink-0">
                  {tweet.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-gray-800">{tweet.username}</span>
                    <span className="text-gray-500 text-sm">{tweet.handle}</span>
                    <span className="text-gray-400 text-sm">·</span>
                    <span className="text-gray-400 text-sm">{tweet.time}</span>
                  </div>
                  <p className="text-gray-800 mb-4 leading-relaxed">
                    {tweet.content}
                  </p>
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => toggleReplies(tweet.id)}
                      className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors group"
                    >
                      <div className="p-2 rounded-full group-hover:bg-blue-50">
                        <MessageCircle size={16} />
                      </div>
                      <span className="text-sm">{tweet.replies.length}</span>
                    </button>
                    <button 
                      onClick={() => setReplyingTo(tweet.id)}
                      className="px-3 py-1 text-sm text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      返信する
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-cyan-500 transition-colors group">
                      <div className="p-2 rounded-full group-hover:bg-cyan-50">
                        <Share size={16} />
                      </div>
                    </button>
                  </div>

                  {/* Reply Input */}
                  {replyingTo === tweet.id && (
                    <div className="mt-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-200">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-cyan-300 to-blue-300 rounded-full flex items-center justify-center text-sm">
                          💎
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={${tweet.handle} に返信...}
                            className="w-full p-3 border border-blue-200 rounded-xl resize-none focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-white/80"
                            rows="2"
                          />
                          <div className="flex justify-between items-center mt-2">
                            <button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                              className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-1"
                            >
                              <ArrowLeft size={14} />
                              キャンセル
                            </button>
                            <button
                              onClick={() => handleReply(tweet.id)}
                              disabled={!replyText.trim()}
                              className="px-4 py-1 bg-gradient-to-r from-cyan-400 to-blue-400 text-white rounded-full text-sm font-medium hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1"
                            >
                              <Send size={14} />
                              返信
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {showReplies.has(tweet.id) && tweet.replies.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {tweet.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-3 p-4 bg-sky-50/50 rounded-2xl border border-sky-200">
                          <div className="w-8 h-8 bg-gradient-to-r from-cyan-300 to-blue-300 rounded-full flex items-center justify-center text-sm shrink-0">
                            {reply.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-800 text-sm">{reply.username}</span>
                              <span className="text-gray-500 text-xs">{reply.handle}</span>
                              <span className="text-gray-400 text-xs">·</span>
                              <span className="text-gray-400 text-xs">{reply.time}</span>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!isLoading && tweets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💎</div>
            <p className="text-gray-600 mb-4">まだつぶやきがありません</p>
            <p className="text-sm text-gray-500">最初のつぶやきを投稿してみましょう！</p>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 text-center text-sm text-gray-500 bg-white/50 rounded-2xl p-4">
          <p className="mb-2">☁️ <strong>クラウド保存</strong>: JSONBin.ioにデータを自動同期</p>
          <p className="mb-2">💾 <strong>オフライン対応</strong>: ローカルストレージでオフライン時もサポート</p>
          <p className="mb-2">💬 <strong>リプライ機能</strong>: つぶやきに返信してコミュニケーションを楽しもう</p>
          <p>💡 <strong>バックアップ</strong>: 右上のダウンロードボタンでデータをJSONファイルとして保存可能</p>
        </div>
      </div>
    </div>
  );
};

export default TweetService;
