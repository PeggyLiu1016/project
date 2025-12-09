        document.addEventListener('DOMContentLoaded', () => {
            const bgMusic = document.getElementById('bgMusic');
            const clickSound = document.getElementById('clickSound');

            // --- 1. 背景音樂初始播放 ---
            const playBGM = () => {
                bgMusic.volume = 0.5; 
                bgMusic.play().catch(e => console.log("等待互動播放音樂"));
                document.removeEventListener('click', playBGM);
            };
            document.addEventListener('click', playBGM);

            // --- 2. 按鈕點擊音效 ---
            document.body.addEventListener('click', (event) => {
                const target = event.target.closest('button, .btn, input[type="button"], input[type="submit"]');
                if (target) {
                    clickSound.currentTime = 0;
                    clickSound.play();
                }
            });

            // --- 3. 影片與背景音樂互斥邏輯 (新增部分) ---
            
            // 影片播放 -> BGM 暫停
            document.addEventListener('play', (event) => {
                if (event.target.tagName === 'VIDEO') {
                    bgMusic.pause();
                }
            }, true); // 使用 capture: true 抓取 play 事件

            // 影片暫停 -> BGM 恢復
            document.addEventListener('pause', (event) => {
                if (event.target.tagName === 'VIDEO') {
                    bgMusic.play().catch(e => {});
                }
            }, true);

            // 影片結束 -> BGM 恢復
            document.addEventListener('ended', (event) => {
                if (event.target.tagName === 'VIDEO') {
                    bgMusic.play().catch(e => {});
                }
            }, true);
        });