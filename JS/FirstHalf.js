// 遊戲狀態
let gameState = {
    name: '',
    scamType: '',
    charIndex: 0
};

// 用來追蹤是否已經互動過角色選擇
let hasInteractedWithChar = false;

// 角色資料
const characters = [
    { name: "阿明", image: "All_assets/6阿明.PNG", trait: "23歲剛畢業打工族", bio: "個性機靈、活潑。\n難易度:簡單。" },
    { name: "獅頭", image: "All_assets/6獅頭.PNG", trait: "34歲上班族父親", bio: "沉穩理性，有警覺心。\n難易度:難。" },
    { name: "企頁佳", image: "All_assets/6企頁佳.PNG", trait: "30歲單身人士", bio: "利己主義，懷疑他人。\n難易度:難。" },
    { name: "土集", image: "All_assets/6土集.PNG", trait: "19歲大學生", bio: "衝動沒耐心，情緒化。\n難易度:普通。" },
];

// 任務說明文字庫
const missionTexts = {
    "假網購": "一、你扮演的是一名詐騙者。<br>二、請根據任務目標達成詐騙目的。<br>三、努力提升信任值至80以上。",
    "假投資": "一、你扮演的是一名詐騙者。<br>二、請根據任務目標達成詐騙目的。<br>三、努力提升信任值至80以上。",
    "假中獎": "一、你扮演的是一名詐騙者。<br>二、請根據任務目標達成詐騙目的。<br>三、努力提升信任值至80以上。"
};

// === 場景切換功能 ===
function goToScene(sceneId) {
    // 1. 隱藏所有場景
    document.querySelectorAll('.scene').forEach(el => el.classList.remove('active'));
    
    // 2. 停止並重設影片 (若從影片頁離開)
    const video = document.getElementById('intro-video-player');
    if (video) {
        video.pause();
        video.currentTime = 0;
    }

    // 3. 顯示目標場景
    const target = document.getElementById(sceneId);
    if (target) {
        target.classList.add('active');
    }

    // === 特殊場景邏輯與按鈕狀態檢查 ===
    
    // 進入名字輸入頁時，檢查是否已有名字 (若使用者按上一頁回來)
    if (sceneId === 'scene-name-input') {
        checkNameInput();
    }

    // 進入詐騙選擇頁時，檢查是否已選過
    else if (sceneId === 'scene-scam-choice') {
        const nextBtn = document.getElementById('btn-next-scam');
        if (gameState.scamType !== "") {
            nextBtn.classList.remove('hidden-btn');
            // 如果回來這一頁，也要標記已選的項目
            document.querySelectorAll('.scam-btn').forEach(btn => {
                if(btn.querySelector('span').innerText === gameState.scamType) {
                    btn.classList.add('selected');
                }
            });
        } else {
            nextBtn.classList.add('hidden-btn');
        }
    }

    // 進入角色選擇頁時，檢查是否已互動過
    else if (sceneId === 'scene-char-select') {
         const nextBtn = document.getElementById('nextPageBtn');
         if (hasInteractedWithChar) {
             nextBtn.classList.remove('hidden-btn');
         } else {
             nextBtn.classList.add('hidden-btn');
         }
    }

    // 如果進入任務說明頁
    else if (sceneId === 'scene-mission') {
        const textElement = document.getElementById('mission-text');
        if (textElement) {
            const text = missionTexts[gameState.scamType] || missionTexts["假投資"];
            textElement.innerHTML = text;
        }
    }

    else if (sceneId === 'scene-intro-video') {
        if (video) {
            video.play().catch(e => console.log("影片自動播放被阻擋", e));
            video.onended = function() {
                goToScene('scene-name-input');
            };
        }
    } 
    else if (sceneId === 'scene-outro-anim') {
        setTimeout(() => {
            const charName = characters[gameState.charIndex].name;
            const fraudType = gameState.scamType;
            window.location.href = `SecondHalf.html?character=${encodeURIComponent(charName)}&fraudType=${encodeURIComponent(fraudType)}`;
        }, 3000);
    }
}

// === 1. 名字輸入監聽邏輯 ===
function checkNameInput() {
    const input = document.getElementById('player-name');
    const nextBtn = document.getElementById('btn-next-name');
    
    if (input.value.trim() !== "") {
        // 有輸入內容，顯示按鈕
        nextBtn.classList.remove('hidden-btn');
    } else {
        // 無內容，隱藏按鈕
        nextBtn.classList.add('hidden-btn');
    }
}

// 為了保險起見，保留這個驗證，防止有人透過開發者工具硬開按鈕
function validateName() {
    const input = document.getElementById('player-name');
    if (input.value.trim() === "") {
        alert("請輸入名字！");
    } else {
        gameState.name = input.value;
        goToScene('scene-scam-choice');
    }
}

// === 2. 詐騙方式選擇邏輯 ===
function selectScam(btnElement, type) {
    document.querySelectorAll('.scam-btn').forEach(btn => btn.classList.remove('selected'));
    btnElement.classList.add('selected');
    gameState.scamType = type;
    
    // 選好之後，顯示下一頁按鈕
    document.getElementById('btn-next-scam').classList.remove('hidden-btn');
}

function validateScam() {
    if (gameState.scamType === "") {
        alert("請選擇一種詐騙方式！");
    } else {
        goToScene('scene-char-select');
        updateCharacterUI(); 
    }
}

// === 3. 角色選擇邏輯 ===
function updateCharacterUI() {
    const char = characters[gameState.charIndex];
    
    const imgEl = document.getElementById('currentCharacterImage');
    if(imgEl) {
        imgEl.src = char.image;
        imgEl.alt = `當前角色：${char.name}`;
    }

    const contentEl = document.getElementById('characterInfoContent');
    if(contentEl) {
        const bioParagraphs = char.bio.split('\n').map(p => `<p>${p}</p>`).join('');
        contentEl.innerHTML = `
            <span class="section-title">簡介</span>
            <p>姓名：<span>${char.name}</span></p>
            <p><span>${char.trait}</span></p>
            ${bioParagraphs}
        `;
    }
}

function navigateCharacter(direction) {
    // 標記使用者已經互動過
    hasInteractedWithChar = true;
    
    // 顯示下一頁按鈕
    document.getElementById('nextPageBtn').classList.remove('hidden-btn');

    gameState.charIndex += direction;
    if (gameState.charIndex < 0) {
        gameState.charIndex = characters.length - 1;
    } else if (gameState.charIndex >= characters.length) {
        gameState.charIndex = 0;
    }
    updateCharacterUI();
}

window.onload = function() {
    updateCharacterUI();
};

