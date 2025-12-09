        // ==========================================
        // SPA 核心導航功能
        // ==========================================
        window.navigateTo = function(viewId) {
            console.log("Navigating to:", viewId);
            
            // 隱藏所有視圖
            document.querySelectorAll('.spa-view').forEach(view => {
                view.classList.remove('active');
            });
            
            // 顯示目標視圖
            const target = document.getElementById(viewId);
            if (target) {
                target.classList.add('active');
            } else {
                console.error('找不到視圖 ID:', viewId);
            }
        }

        window.resetAndStartGame = function() {
            // 重新載入頁面 (確保所有變數乾淨，回到遊戲初始狀態)
            window.location.reload();
        }

        // ==========================================
        // 宣導頁面影片控制邏輯
        // ==========================================
        const modal = document.getElementById('videoModal');
        const video = document.getElementById('fullscreenVideo');

        // 單獨播放影片 (給宣導頁面的按鈕使用)
        window.playVideo = function(src) {
            // 移除可能殘留的自動播放序列監聽器
            video.onended = null;
            
            video.src = src;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            
            video.play().catch(error => {
                console.log("自動播放被瀏覽器阻擋，需使用者互動", error);
            });

            if (video.requestFullscreen) {
                video.requestFullscreen();
            } else if (video.webkitEnterFullscreen) { 
                video.webkitEnterFullscreen();
            } else if (video.msRequestFullscreen) {
                video.msRequestFullscreen();
            }
        }

        window.closeVideo = function() {
            video.pause();
            video.src = "";
            video.onended = null; // 清除播放結束事件，避免影響下次播放
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        }

        video.addEventListener('webkitendfullscreen', function() {
            closeVideo();
        }, false);

        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeVideo();
            }
        });

        // ==========================================
        // 遊戲結束後的自動播放序列邏輯 (新增部分)
        // ==========================================
        
        // 定義各類型的影片播放清單 [科普影片, 預防影片]
        const educationVideoMap = {
            "假網購": ["All_assets/結尾動畫/假網購科普.mp4", "All_assets/結尾動畫/假網購預防.mp4"],
            "假投資": ["All_assets/結尾動畫/假投資科普.mp4", "All_assets/結尾動畫/假投資預防.mp4"],
            "假中獎": ["All_assets/結尾動畫/假中獎科普.mp4", "All_assets/結尾動畫/假中獎預防.mp4"]
        };

        let currentVideoQueue = [];

        window.startEducationSequence = function() {
            // 取得目前的詐騙類型名稱
            let type = gameState.activeMethodName;
            
            // 處理別名，確保能對應到 Map 的 Key
            if(type.includes("買") || type.includes("網購")) type = "假網購";
            else if(type.includes("投資")) type = "假投資";
            else if(type.includes("中獎")) type = "假中獎";
            else type = "假投資"; // 預設值
            
            console.log("啟動影片宣導序列，類型：", type);

            // 取得播放清單，若無對應則使用預設
            currentVideoQueue = educationVideoMap[type] || educationVideoMap["假投資"];
            
            // 開始播放序列中的第一部
            playSequenceVideo(0);
        }

        function playSequenceVideo(index) {
            // 如果已經播完所有影片，則關閉播放器並跳轉至宣導頁面
            if (index >= currentVideoQueue.length) {
                closeVideo();
                navigateTo('view-education');
                return;
            }

            const src = currentVideoQueue[index];
            
            // 設定影片來源並顯示 Modal
            video.src = src;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            
            // 播放
            video.play().catch(error => {
                console.log("序列自動播放被阻擋，請手動點擊播放", error);
            });

            // 關鍵：設定當前影片播放結束後，自動播放下一部
            video.onended = function() {
                playSequenceVideo(index + 1);
            };
        }

        // ==========================================
        // 遊戲邏輯 (移植自 test2.js)
        // ==========================================

        let gameState = {
            score: 0,
            round: 1,
            maxRounds: 10,
            history: [], 
            activeChar: null, 
            activeMethod: null, 
            activeMethodName: "", 
            isProcessing: false 
        };

        document.addEventListener('DOMContentLoaded', () => {
            initGame();
        });

        function initGame() {
            // --- 1. 取得參數 (若無參數則使用預設值) ---
            const urlParams = new URLSearchParams(window.location.search);
            const charName = urlParams.get('character') || "阿明"; 
            const fraudType = urlParams.get('fraudType') || urlParams.get('caseType') || "假投資";

            // 對照表 key 處理 (例如 兔集 -> 土集)
            let dataKey = charName;
            if(charName === "兔集") dataKey = "土集"; 
            
            // --- 2. 載入角色資料 ---
            // 檢查 GAME_DATA 是否已在 ai.core.js 載入
            if (typeof GAME_DATA !== 'undefined' && GAME_DATA.characters[dataKey]) {
                gameState.activeChar = { ...GAME_DATA.characters[dataKey] };
                gameState.score = gameState.activeChar.initScore; 
            } else {
                // Fallback: 如果讀不到 ai.core.js 的資料
                console.error("Critical: GAME_DATA not found.");
                gameState.activeChar = { 
                    name: charName, 
                    age: "??", 
                    desc: "...", 
                    img: "All_assets/8阿明.PNG",
                    initScore: 40
                };
                gameState.score = 40;
            }
            
            // --- 3. 載入詐騙劇本 ---
            let methodKey = fraudType;
            if (methodKey.includes("買") || methodKey.includes("網購")) methodKey = "假網購";
            else if (methodKey.includes("投資")) methodKey = "假投資";
            else if (methodKey.includes("中獎")) methodKey = "假中獎";

            if (typeof GAME_DATA !== 'undefined' && GAME_DATA.fraudMethods[methodKey]) {
                gameState.activeMethod = GAME_DATA.fraudMethods[methodKey];
                gameState.activeMethodName = methodKey; 
            } else {
                gameState.activeMethod = { roleDesc: `${fraudType}情境`, link: "http://fake-link.com" };
                gameState.activeMethodName = fraudType;
            }

            // --- 4. 更新 UI ---
            updateGlobalUI(charName, gameState.activeMethodName);

            // --- 5. 初始化 AI ---
            initAIChat();

            // --- 6. 綁定事件 ---
            bindEvents();

            // --- 7. 拖放功能 ---
            initDragAndDrop();

            // --- 8. 教學導覽 ---
            initTutorial();
        }

        function updateGlobalUI(charName, fraudType) {
            const sidebarAvatar = document.querySelector('.contact-item .avatar');
            const sidebarName = document.querySelector('.contact-item .contact-name');
            const headerName = document.getElementById('target-name');

            if (sidebarAvatar && gameState.activeChar) {
                sidebarAvatar.style.backgroundImage = `url('${gameState.activeChar.img}')`;
                sidebarAvatar.style.backgroundColor = '#fff'; 
                sidebarAvatar.innerHTML = '';
            }
            
            if (sidebarName) sidebarName.innerText = gameState.activeChar.name;
            if (headerName) headerName.innerText = gameState.activeChar.name;

            updateScoreUI();

            const missionTexts = {
                "假網購": `一、引導賣家加入你的LINE官方帳號。<br>二、假冒客服，要求賣家操作網銀。<br>三、要求賣家轉帳至指定帳戶。`,
                "假投資": `一、讓對方相信你是投資專家，加入你的投資群組。<br>二、說明投資前景好，說服對方投入更多資金。<br>三、製造理由阻撓對方提領獲利，並要求支付額外費用。`,
                "假中獎": `一、發送附釣魚網站連結的中獎通知。<br>二、假冒客服，騙取對方個資。<br>三、要求對方需先支付一筆費用才能領取獎品。`
            };

            const text = missionTexts[fraudType] || missionTexts["假投資"];
            const missionP = document.querySelector('.mission-text p');
            if (missionP) {
                missionP.innerHTML = text;
                missionP.style.textAlign = 'left'; 
                missionP.style.lineHeight = '1.8'; 
                missionP.style.fontSize = '1.1rem'; 
            }
        }

        function initAIChat() {
            // 改為使用 ai.core.js 提供的生成函式，動態載入規則表
            const systemPrompt = generateCharacterSystemPrompt(
                gameState.activeChar.name, 
                gameState.activeMethodName,
                gameState.round
            );
            
            gameState.history.push({ role: "system", content: systemPrompt });
            
            let openingMsg = "你好"; 
            
            // 嘗試使用 external OPENING_LINES
            if (typeof OPENING_LINES !== 'undefined' && OPENING_LINES[gameState.activeChar.name] && 
                OPENING_LINES[gameState.activeChar.name][gameState.activeMethodName]) {
                openingMsg = OPENING_LINES[gameState.activeChar.name][gameState.activeMethodName];
            } else {
                 if(gameState.activeMethodName.includes("網購")) openingMsg = "你好，請問商品還有需要嗎？";
                 if(gameState.activeMethodName.includes("投資")) openingMsg = "請問那個兼職是真的嗎？";
                 if(gameState.activeMethodName.includes("中獎")) openingMsg = "我收到中獎通知，這是真的嗎？";
            }

            setTimeout(() => {
                addMessage('received', openingMsg);
                // 注意：這裡只存入內容供顯示，不一定需要將開場白放入 history 讓 AI 知道
                // 但為了上下文連貫，放入 history 較佳
                gameState.history.push({ role: "assistant", content: openingMsg });
            }, 500);
        }

        function initDragAndDrop() {
            const square = document.querySelector('.material-square');
            const items = document.querySelectorAll('.material-item');
            
            if (square) {
                square.innerText = "連結";
                square.style.cssText += "display:flex; justify-content:center; align-items:center; font-weight:bold; cursor:grab; color:#333;";
                square.setAttribute('draggable', true);
                square.dataset.type = 'link'; 
                square.addEventListener('dragstart', handleDragStart);
                square.addEventListener('dragend', handleDragEnd);
            }

            // 修改：刪除一個 AI 回覆，加入 提早結束
            const itemTypes = ['ai-reply', 'ai-suggest', 'early-end'];
            const itemTexts = ['AI回覆', 'AI建議', '提早結束'];

            items.forEach((item, index) => {
                if (index < 3) {
                    item.innerText = itemTexts[index];
                    item.style.cssText += "display:flex; justify-content:center; align-items:center; font-weight:bold; color:#333;";
                    item.dataset.type = itemTypes[index];

                    // 特殊處理：提早結束按鈕
                    if (itemTypes[index] === 'early-end') {
                        item.style.cursor = 'pointer';
                        item.style.backgroundColor = '#e57373'; // 紅色系，表示危險/結束
                        item.style.color = 'white';
                        item.setAttribute('draggable', false); // 不可拖曳
                        
                        // 綁定點擊事件
                        item.onclick = function() {
                            if (confirm("確定要提早結束詐騙嗎？\n(提早結束視同任務失敗)")) {
                                navigateTo('view-failure');
                            }
                        };
                    } else {
                        // 其他按鈕 (AI回覆, AI建議) 維持可拖曳
                        item.style.cursor = 'grab';
                        item.setAttribute('draggable', true);
                        item.addEventListener('dragstart', handleDragStart);
                        item.addEventListener('dragend', handleDragEnd);
                    }
                }
            });

            const dropZone = document.querySelector('.input-box');
            if (dropZone) {
                // 複製節點以移除舊監聽器
                const newDropZone = dropZone.cloneNode(true);
                dropZone.parentNode.replaceChild(newDropZone, dropZone);
                
                newDropZone.addEventListener('dragover', (e) => {
                    e.preventDefault(); 
                    newDropZone.style.border = "2px dashed #5D4037"; 
                });

                newDropZone.addEventListener('dragleave', () => {
                    newDropZone.style.border = "2px solid rgba(255,255,255,0.3)"; 
                });

                newDropZone.addEventListener('drop', handleDrop);
                bindInputEvents(newDropZone); // 重新綁定輸入框事件
            }
        }

        let draggedElement = null;
        function handleDragStart(e) {
            draggedElement = this;
            e.dataTransfer.setData('text/plain', this.dataset.type);
            e.dataTransfer.effectAllowed = 'move';
            this.style.opacity = '0.5';
        }
        function handleDragEnd(e) {
            this.style.opacity = '1';
            draggedElement = null;
        }
        async function handleDrop(e) {
            e.preventDefault();
            const dropZone = e.currentTarget;
            dropZone.style.border = "2px solid rgba(255,255,255,0.3)"; 

            const type = e.dataTransfer.getData('text/plain');
            const input = dropZone.querySelector('input');
            
            if (type === 'link') {
                if (input) {
                    const link = gameState.activeMethod.link || "http://unknown-link.com";
                    input.value = `請點擊這個連結加入：${link}`;
                }
            } 
            else if (type === 'ai-reply') {
                if (input) {
                    input.value = "正在生成最佳回覆...";
                    input.disabled = true;
                    try {
                        const suggestion = await getAISuggestion("reply", gameState);
                        input.value = suggestion;
                    } catch (err) {
                        input.value = "AI 連線失敗，請手動輸入";
                    } finally {
                        input.disabled = false;
                    }
                }
            } 
            else if (type === 'ai-suggest') {
                const tooltip = document.getElementById('tooltip');
                tooltip.innerText = "分析中...";
                tooltip.classList.add('show');
                try {
                    const suggestion = await getAISuggestion("suggest", gameState);
                    alert(`【AI 建議】\n${suggestion}`);
                } catch (err) {
                    alert("無法取得建議");
                } finally {
                    tooltip.classList.remove('show');
                }
            }
            if (draggedElement) draggedElement.style.visibility = 'hidden';
        }

        function bindEvents() {
            const missionBtn = document.getElementById('target-bulb');
            const missionModal = document.getElementById('mission-modal');
            if (missionBtn && missionModal) {
                const newBtn = missionBtn.cloneNode(true);
                missionBtn.parentNode.replaceChild(newBtn, missionBtn);
                
                newBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    missionModal.classList.add('active');
                });
                missionModal.addEventListener('click', () => {
                    missionModal.classList.remove('active');
                });
            }
        }

        function bindInputEvents(inputBox) {
            inputBox.innerHTML = ''; 
            
            const realInput = document.createElement('input');
            realInput.type = 'text';
            realInput.placeholder = '請輸入訊息...';
            realInput.style.cssText = "flex: 1; background: transparent; border: none; font-size: 1.1rem; outline: none; color: black; font-weight: bold;";
            
            const sendBtn = document.createElement('i');
            sendBtn.className = "fas fa-paper-plane";
            sendBtn.style.cssText = "margin-right: 15px; color: #5D4037; font-size: 1.5rem; cursor: pointer;";
            
            inputBox.appendChild(sendBtn);
            inputBox.appendChild(realInput);

            const handleSend = async () => {
                const text = realInput.value.trim();
                if (!text || gameState.isProcessing) return;
                
                addMessage('sent', text);
                gameState.history.push({ role: "user", content: text });
                realInput.value = '';

         // ===============================================
        // --- [新增] 提報模式金手指攔截 (Wizard of Oz) ---
        // ===============================================
        if (window.checkDemoScript) {
            const scriptedResponse = window.checkDemoScript(text);
            if (scriptedResponse) {
                console.log("⚡ 觸發提報劇本模式，攔截 API 請求");
                gameState.isProcessing = true;
                const loadingId = addLoading();

                // 模擬 AI 思考延遲 (2000毫秒)
                setTimeout(() => {
                    removeLoading(loadingId);
                    addMessage('received', scriptedResponse);
                    
                    // 將劇本回應加入歷史紀錄，確保上下文連貫
                    gameState.history.push({ role: "assistant", content: scriptedResponse });
                    
                    // 演示模式加分邏輯：每次成功對話 +10 分，確保結局是好的
                    const demoScoreDelta = 10;
                    gameState.score += demoScoreDelta;
                    if (gameState.score > 100) gameState.score = 100;

                    // 更新 UI 與檢查回合
                    gameState.round++;
                    updateScoreUI();
                    checkEnd();
                    
                    // 釋放鎖定
                    gameState.isProcessing = false;
                }, 2000);

                return; // ⚠️ 重要：直接結束函式，不呼叫真的 AI API
            }
        }
        // ===============================================
        // --- [結束] 提報模式攔截 ---
        // ===============================================

                gameState.isProcessing = true;

                const loadingId = addLoading();

                try {
                    let data = await callOpenAI(gameState.history);
                    removeLoading(loadingId);

                    let delta = data.score_delta || 0;
                    gameState.score += delta;
                    if (gameState.score > 100) gameState.score = 100;
                    if (gameState.score < 0) gameState.score = 0;
                    
                    addMessage('received', data.reply);
                    
                    // 這裡我們可以把 AI 的評分理由偷偷印在 console 方便除錯
                    console.log(`Round ${gameState.round} Score Delta: ${delta}, Reason: ${data.reason}`);
                    
                    // 注意：history 不要存入 JSON 格式，以免汙染後續對話 context
                    // 我們只存入 reply 內容
                    gameState.history.push({ role: "assistant", content: data.reply });

                    gameState.round++;
                    updateScoreUI();
                    checkEnd();

                } catch (err) {
                    console.error(err);
                    removeLoading(loadingId);
                    addMessage('received', "(系統) 連線發生錯誤，請檢查網路或 Key");
                } finally {
                    gameState.isProcessing = false;
                }
            };

            sendBtn.addEventListener('click', handleSend);
            realInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') handleSend();
            });
        }

        function updateScoreUI() {
            const roundDiv = document.getElementById('target-rounds');
            const scoreDiv = document.getElementById('target-score');
            if(roundDiv) roundDiv.innerText = `回合數：${Math.min(gameState.round, gameState.maxRounds)}/10`;
            if(scoreDiv) scoreDiv.innerText = `信任值：${gameState.score}`;
        }

        function addMessage(type, text) {
            const list = document.querySelector('.messages-list');
            const msg = document.createElement('div');
            msg.className = `message ${type}`;
            
            const avatar = document.createElement('div');
            avatar.className = 'msg-avatar';
            
            if (type === 'received') {
                const imgUrl = gameState.activeChar ? gameState.activeChar.img : "";
                avatar.style.backgroundImage = `url('${imgUrl}')`;
            } else {
                // 使用頭貼
                avatar.style.backgroundImage = "url('All_assets/8頭貼.png')";
                avatar.style.backgroundColor = '#fff';
            }

            const content = document.createElement('div');
            content.className = 'msg-content';
            content.innerText = text;

            msg.appendChild(avatar);
            msg.appendChild(content);
            list.appendChild(msg);
            list.scrollTop = list.scrollHeight;
        }

        function addLoading() {
            const list = document.querySelector('.messages-list');
            const msg = document.createElement('div');
            const id = 'loading-' + Date.now();
            msg.id = id;
            msg.className = 'message received';
            const imgUrl = gameState.activeChar ? gameState.activeChar.img : "";
            msg.innerHTML = `
                <div class="msg-avatar" style="background-image: url('${imgUrl}')"></div>
                <div class="msg-content">...</div>
            `;
            list.appendChild(msg);
            list.scrollTop = list.scrollHeight;
            return id;
        }

        function removeLoading(id) {
            const el = document.getElementById(id);
            if(el) el.remove();
        }

        // 核心邏輯修改：將跳轉頁面改為 SPA 切換
        function checkEnd() {
            if (gameState.round > gameState.maxRounds) {
                console.log("遊戲結束，準備切換視圖...");
                
                let targetView = "";
                let title = "";
                let desc = "";

                // 根據規則判斷結局
                if (gameState.score >= 80) {
                    targetView = "view-success";
                    title = "【成功】";
                    desc = "你已完全信任對方，並按照指示進行了操作。";
                } else {
                    targetView = "view-failure";
                    if (gameState.score <= 20) {
                        title = "【失敗 - 被封鎖】";
                        desc = "你察覺到對方的可疑之處，決定不再回應並封鎖了對方。";
                    } else {
                        // 21 ~ 79
                        title = "【失敗 - 觀望中】";
                        desc = "你對他仍抱持觀望態度，決定暫時保持距離，沒有進一步的動作。";
                    }
                }
                
                // 嘗試顯示遊戲內的結算 Modal
                const endModal = document.getElementById('end-modal');
                const failTitle = document.getElementById('fail-title');
                const failReason = document.getElementById('fail-reason');

                // 預先填充失敗頁面的文字 (成功頁面文字固定較單純)
                if (targetView === 'view-failure') {
                    if (failTitle) failTitle.innerText = title;
                    if (failReason) failReason.innerText = desc + `\n(最終信任值: ${gameState.score})`;
                }

                if (endModal) {
                    const h2 = endModal.querySelector('h2');
                    const p = endModal.querySelectorAll('p');
                    
                    if(h2) h2.innerText = title;
                    if(p && p[0]) p[0].innerText = desc;
                    if(p && p[1]) p[1].innerText = `最終信任值: ${gameState.score} (即將跳轉...)`;
                    
                    endModal.classList.add('show');
                    
                    // 點擊 Modal 或 3秒後執行跳轉
                    const doJump = () => {
                        endModal.classList.remove('show');
                        navigateTo(targetView);
                    };
                    
                    endModal.onclick = doJump;
                    setTimeout(doJump, 3000);
                } else {
                    navigateTo(targetView);
                }
            }
        }

        function initTutorial() {
            const tooltip = document.getElementById('tooltip');
            const overlay = document.getElementById('tutorial-overlay');
            const spotlight = document.getElementById('spotlight-effect');
            
            if (!tooltip || !overlay || !spotlight) return;

            let currentStepIndex = 0;
            const steps = [
                { targetId: 'target-bulb', text: '可參考任務目標。', shape: 'round', offsetY: 20 },
                { targetId: 'target-rounds', text: '可得知目前回合數，\n你有十回合的機會詐騙對方。', shape: 'round', offsetY: 80 },
                { targetId: 'target-score', text: '可得知目前的分數，\n80分以上算成功。', shape: 'round', offsetY: 80 },
                { targetId: 'target-materials', text: '不知如何對話時\n可將素材拖曳至輸入框。\n提早結束:點選後會立刻結束聊天。', customStyle: 'top: 500px; right: 350px; transform: none;' },
                { targetId: 'target-input', text: '在此輸入訊息，按Enter將訊息傳送給對方。', position: 'top', offsetY: -30 },
                { end: true }
            ];

            // 啟動教學：顯示遮罩
            setTimeout(() => { if(overlay) overlay.classList.add('active'); }, 100);

            function showStep(index) {
                tooltip.classList.remove('show');
                if (index >= steps.length) return;
                const step = steps[index];

                // 結束教學
                if (step.end) {
                    spotlight.style.width = '0px'; spotlight.style.height = '0px'; 
                    spotlight.classList.add('active'); // 收縮效果
                    
                    setTimeout(() => {
                        overlay.classList.remove('active');
                        spotlight.classList.remove('active');
                    }, 500);
                    return;
                }

                const target = document.getElementById(step.targetId);
                if (target && spotlight) {
                    const rect = target.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;

                    if (step.shape === 'round') {
                        const maxDim = Math.max(rect.width, rect.height) + 50; 
                        spotlight.style.width = maxDim + 'px';
                        spotlight.style.height = maxDim + 'px';
                        spotlight.style.borderRadius = '50%';
                    } else {
                        spotlight.style.width = (rect.width + 30) + 'px';
                        spotlight.style.height = (rect.height + 30) + 'px';
                        spotlight.style.borderRadius = '30px'; 
                    }
                    spotlight.style.left = centerX + 'px';
                    spotlight.style.top = centerY + 'px';
                    spotlight.classList.add('active');

                    // 顯示 Tooltip
                    tooltip.innerText = step.text;
                    tooltip.style = ''; // 重置 style
                    if (step.customStyle) {
                        tooltip.style.cssText = step.customStyle;
                    } else {
                        let topPos = step.position === 'top' ? rect.top - 60 : rect.bottom + 25;
                        let leftPos = centerX - (tooltip.offsetWidth || 200) / 2;
                        if (step.offsetX) leftPos += step.offsetX;
                        if (step.offsetY) topPos += step.offsetY;
                        tooltip.style.left = leftPos + 'px';
                        tooltip.style.top = topPos + 'px';
                    }
                    tooltip.classList.add('show');
                }
            }

            function nextStep() {
                // 只有在遮罩啟用時才動作
                if (!document.getElementById('tutorial-overlay').classList.contains('active')) return;
                currentStepIndex++;
                showStep(currentStepIndex);
            }

            // 初始第一步
            setTimeout(() => showStep(0), 100);
            
            // 綁定點擊與按鍵
            document.addEventListener('click', nextStep);
            document.addEventListener('keydown', (e) => {
                if (['Space', 'Enter', 'ArrowRight'].includes(e.code)) {
                    if (document.activeElement.tagName === 'INPUT') return;
                    e.preventDefault(); 
                    nextStep();
                }
            });
        }
    