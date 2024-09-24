// -*- coding: utf-8 -*-
document.addEventListener('DOMContentLoaded', function() {
    const content = document.getElementById('content');
    const links = document.querySelectorAll('nav a');
    const contentCache = {};
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    // 简繁体转换字典
    const simplifiedToTraditionalMap = {
        '简': '簡', '体': '體', '电': '電', '脑': '腦', '软': '軟', '件': '件',
        '发': '發', '开': '開', '无': '無', '时': '時', '从': '從', '这': '這',
        '业': '業', '计': '計', '划': '劃', '为': '為', '产': '產', '动': '動',
        // ... 添加更多映射
    };

    function simplifiedToTraditional(text) {
        return text.split('').map(char => simplifiedToTraditionalMap[char] || char).join('');
    }

    function stripHtml(html) {
        let tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    }

    function generatePageTitle(page) {
        switch(page) {
            case 'home': return '首頁';
            case 'news': return '新消息';
            case 'events': return '活動計劃';
            case 'school-affairs': return '校内事務';
            case 'welfare': return '學生福利';
            case 'members': return '學生會名單';
            case 'contact': return '聯絡我們';
            default: return page;
        }
    }

    function search() {
        console.log("开始执行搜索");
        const searchTerm = searchInput.value.trim();
        console.log("搜索词:", searchTerm);
        
        if (searchTerm.length < 2) {
            alert('請輸入至少兩個字符進行搜索。');
            return;
        }

        const traditionalSearchTerm = simplifiedToTraditional(searchTerm.toLowerCase());
        const searchWords = jieba.cut(traditionalSearchTerm);

        let results = [];
        for (let page in contentCache) {
            const pageContent = stripHtml(contentCache[page]);
            const traditionalPageContent = simplifiedToTraditional(pageContent.toLowerCase());
            
            let score = 0;
            for (let word of searchWords) {
                if (traditionalPageContent.includes(word)) {
                    score += 1;
                }
            }

            if (score > 0) {
                const pageTitle = generatePageTitle(page);
                const snippet = generateSnippet(pageContent, searchWords);
                results.push({ page, pageTitle, snippet, score });
            }
        }

        results.sort((a, b) => b.score - a.score);
        console.log('搜索结果:', results);
        displaySearchResults(results, searchTerm);
        console.log('搜索完成');
    }

    function generateSnippet(content, searchWords) {
        const traditionalContent = simplifiedToTraditional(content.toLowerCase());
        let bestIndex = 0;
        let maxScore = 0;

        for (let i = 0; i < traditionalContent.length; i++) {
            let score = 0;
            for (let word of searchWords) {
                if (traditionalContent.slice(i).startsWith(word)) {
                    score += word.length;
                }
            }
            if (score > maxScore) {
                maxScore = score;
                bestIndex = i;
            }
        }

        const start = Math.max(0, bestIndex - 50);
        const end = Math.min(content.length, bestIndex + 100);
        return '...' + content.slice(start, end) + '...';
    }

    function highlightSearchTerm(text, searchTerm) {
        const traditionalText = simplifiedToTraditional(text.toLowerCase());
        const searchWords = jieba.cut(simplifiedToTraditional(searchTerm.toLowerCase()));
        let result = text;

        for (let word of searchWords) {
            const regex = new RegExp(word, 'gi');
            result = result.replace(regex, match => `<mark>${match}</mark>`);
        }

        return result;
    }

    function displaySearchResults(results, searchTerm) {
        if (results.length === 0) {
            content.innerHTML = `<h2>搜索結果</h2><p>未找到與 "${searchTerm}" 相關的結果。</p>`;
            return;
        }

        let resultsHtml = `<h2>搜索結果</h2><p>找到 ${results.length} 個與 "${searchTerm}" 相關的結果：</p>`;
        results.forEach(result => {
            resultsHtml += `
                <div class="search-result">
                    <h3><a href="#${result.page}" onclick="loadContentAndUpdateURL('${result.page}'); return false;">${result.pageTitle}</a></h3>
                    <p>${highlightSearchTerm(result.snippet, searchTerm)}</p>
                </div>
            `;
        });
        content.innerHTML = resultsHtml;
    }

    // 预加载所有内容
    function preloadContent() {
        links.forEach(link => {
            const page = link.getAttribute('href').substr(1);
            contentCache[page] = generateContent(page);
        });
    }

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.closest('a').getAttribute('href').substr(1);
            loadContentAndUpdateURL(page);
        });
    });

    function setActiveLink(activeLink) {
        links.forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
    }

    function loadContent(page) {
        content.classList.add('fade-out');
        setTimeout(() => {
            content.innerHTML = contentCache[page] || generateContent(page);
            content.classList.remove('fade-out');
            content.classList.add('fade-in');
            
            // 添加新的动画效果
            const elements = content.querySelectorAll('h2, h3, p, .event-card, .member-card');
            elements.forEach((el, index) => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    el.style.transition = 'opacity 0.5s, transform 0.5s';
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, index * 100);
            });

            setTimeout(() => {
                content.classList.remove('fade-in');
            }, 300);

            if (page === 'home') {
                setupImageCarousel();
            }
        }, 150);
    }

    function loadContentAndUpdateURL(page) {
        loadContent(page);
        const activeLink = document.querySelector('nav a[href="#' + page + '"]');
        if (activeLink) {
            setActiveLink(activeLink);
        }
        history.pushState(null, '', '#' + page);
    }

    function generateContent(page) {
        switch(page) {
            case 'home':
                return `
                <h2>歡迎來到 Champions！候選內閣</h2>
                <p>我們是一群充滿熱情和理想的學生，致力於為全體同學提供優質的服務，促進校園文化建設，豐富學生生活。</p>
                <p class="slogan"><strong>我們的競選口號是：</strong></p>
                <p class="slogan-highlight">「探索Champions，成為Champions，超越Champions」</p>
                </div>
                
                <h3 class="section-title">競選目標</h3>
                <p>Champions學生會的核心競選目標是實現"娛樂與學術兼並"，為我校學生創造一個充滿活力、創新與支持的校園環境。我們相信，學術與娛樂並非對立，而是可以相輔相成，讓學生在輕鬆愉的氛圍中，提升學習效果和全方位的成長。</p>
                <h4 class="blue-text">1. 增強學術資源與支持</h4>
                <p>我們將積極擴大學術資源，為同學們提供更豐富、更靈活的學習機會，包括與其他學校交換模擬考卷、設立"圖書館補習員"計劃，並引入"數學小鎮"活動，為常見學術問題提供實時解答，幫助同學們應對學習中的各種挑戰。</p>
                <h4 class="blue-text">2. 促進娛樂與學術的結合</h4>
                <p>我們將策劃一系列創新活動，讓同學們在娛樂中找到學術的樂趣。我們將舉辦學科比賽、校內外聯合文化活動，以及創意學習工作坊，讓學生們在參與中激發創造力，同時加強對學科知識的理解和應用。</p>
                <h4 class="blue-text">3. 加強對外聯繫與合作</h4>
                <p>Champions學生會將打破僅側重校內事務的傳統，積極促進對外交流與合作。我們將組織與其他學校的學術和文化交流活動，為同學們提供拓展視野、增強社會實踐能力的機會。同時，我們會與外部機構合作，引入更多升學和職業規劃指導，幫助同學們更好地為未來做準備</p>
                <h4 class="blue-text">4. 提升校園歸屬感與學生權益</h4>
                <p>我們將不斷完善校內設施，並在校園內推動更多關於學生權益的活動，使每一位同學都能感受到被重視和尊重。我們還將開展定期調查，傾聽同學們的需求與建議，確保學生會的每一項工作都切實服務於同學的利益。</p>
                <p><strong>Champions學生會以<span class="blue-text">"探索Champions，成為Champions，超越Champions"</span>的精神，致力於在學術與娛樂中促進每位同學的成長，激發他們探索潛能、實現夢想並突破自我。</strong></p>
                `;
            case 'news':
                return '<h2><i class="fas fa-newspaper"></i> 最新消息</h2>' +
                    '<ul class="news-list">' +
                    '<li><h3>Champions！候選內閣宣傳活動即將開始</h3>' +
                    '<p><i class="far fa-calendar-alt"></i> 日期：2023年9月25日</p>' +
                    '<p>我們誠摯邀請所有同學參與 Champions！候選內閣的首次宣傳活動。屆時我們將介紹我們的理念、目標和計劃。讓我們一起探索如何為學校帶來積極的改變！</p></li>' +
                    '<li><h3>第二輪宣傳活動</h3>' +
                    '<p><i class="far fa-calendar-alt"></i> 日期：2023年10月2日</p>' +
                    '<p>第二輪傳活動將更深入地介紹我們的體方案。我們將設立互動攤位，讓同們更好地了解我們的計劃，並收集大家的寶貴意見。</p></li>' +
                    '<li><h3>學生會選舉即將開始</h3>' +
                    '<p><i class="far fa-calendar-alt"></i> 日期：2023年10月16日</p>' +
                    '<p>學生會選舉將於10月16正式開始。我們鼓勵所有同學積極參與，為自己心目中的最佳候選內閣投下寶貴的一票。讓我們一起塑造學校的未來！</p></li>' +
                    '</ul>';
            case 'events':
                return `
                <h2 style="margin-bottom: 1.5em;"><i class="fas fa-calendar-alt"></i> 活動計劃</h2>
                <div class="event-list">
                    <div class="event-card">
                        <h3>9月26號 – 宣傳期第一天</h3>
                        <p><strong>活動主題：</strong>「探尋Champions!」 （Champions! Discovery Day）</p>
                        <p><strong>時間安排：</strong></p>
                        <ul>
                            <li>上課前：宣傳、派發宣傳物資、廣播介紹午息活動。</li>
                            <li>午息：進行「Champions!免費影即有體驗」、張貼海報。</li>
                            <li>放學後：在學校門口宣傳，follow IG，發放宣傳物品（糖）。</li>
                        </ul>
                    </div>
                    <div class="event-card">
                        <h3>9月27號 – 宣傳期第二天</h3>
                        <p><strong>活動主題：</strong>「Champions!傳奇揭幕」 （Champions! Legend Unveiled）</p>
                        <p><strong>時間安排：</strong></p>
                        <ul>
                            <li>上課前：宣傳、派發宣傳資、廣播介紹午息活動。</li>
                            <li>放學後：在校門口宣傳，follow IG，發放宣傳物品（糖、紙巾）。</li>
                        </ul>
                    </div>
                    <div class="event-card">
                        <h3>10月2號 – 宣傳期第三天</h3>
                        <p><strong>活動主題：</strong>「Champions!之路：啟程，成就，超越」（Champions!:Embark,Achieve,Surpass）</p>
                        <p><strong>時間安排：</strong></p>
                        <ul>
                            <li>上課前：禮堂播宣傳片、宣傳活。</li>
                            <li>午息：進行「三分戰神」挑戰，先在IG私信報名，挑戰成功的同學可以獲得Champions!紀念品和雪糕，並且進行合照，同時在SAC可以獲得「Champions!免費即影即有體驗」、張貼海報。</li>
                        </ul>
                    </div>
                    <div class="event-card">
                        <h3>10月3日 – 宣傳期第四天</h3>
                        <p><strong>活動主題：</strong>「Champions!運動日」（Champions! Sports Day）</p>
                        <p><strong>時間安排：</strong></p>
                        <ul>
                            <li>上課前：學生會成員穿著運動裝，進行簡單的運動宣傳，派發宣傳單張和糖果，介紹午息的趣味活動。</li>
                            <li>午息：舉辦「健康知識快問快，同答與運動或健康相關的小問題，答對的可獲得專屬筆或糖果。同時在SAC進行即影即有拍攝，並發放糖果和紙巾。</li>
                            <li>放學後：門口宣傳，follow IG，發放宣傳物品（糖果和紙巾），鼓勵大家參與接下來的活動。</li>
                        </ul>
                    </div>
                    <div class="event-card">
                        <h3>10月4號 – 宣傳期第五天</h3>
                        <p><strong>活動主題：</strong>「Champions!之路：追求，创造，征服」（Champions!:Pursue, Create, Conquer）</p>
                        <p><strong>時間安排：</strong></p>
                        <ul>
                            <li>上課前：宣傳、派發宣傳物資、廣播介紹午息活動。</li>
                            <li>午息：舉辦午間旋律」，可以邀請老師或者同學，可以點歌亦可以坐着聽歌、聊天。如果有同學有興趣可以上去唱歌，一起帶動氣氛。同時進行random dance隨機舞蹈。在SAC可以獲得「Champions!免費即影即有體驗」、派發宣傳品、發布寶遊戲的線索與點信息。</li>
                            <li>放學後在校門口宣傳，follow IG，發放宣傳物品（糖）。</li>
                        </ul>
                    </div>
                    <div class="event-card">
                        <h3>10月7號 – 宣傳期第六天</h3>
                        <p><strong>���動主題：</strong>「Champions!尋寶遊戲」（Champions! Treasure Hunt）</p>
                        <p><strong>時間安排：</strong></p>
                        <ul>
                            <li>上課前：宣傳、派發宣傳物資、重申尋寶遊戲的線索與起點信息（全校學生可以自由參與）。</li>
                            <li>小息：繼續尋寶遊戲，並引導參與者在校園內不同地點尋找線索，解答問題。</li>
                            <li>午息：在操場進行random dance隨機舞蹈，邀請舞社的同學前來表演。</li>
                            <li>放學後：在學校門口宣傳，follow IG，發放宣傳物品（糖）。</li>
                        </ul>
                    </div>
                    <div class="event-card">
                        <h3>10月8日 宣傳期第七天</h3>
                        <p><strong>活動主題：</strong>「Champions!創意日」（Champions! Creativity Day）</p>
                        <p><strong>時間安排：</strong></p>
                        <ul>
                            <li>上課前：發筆和宣傳單張，介紹午息的創意活動。</li>
                            <li>午息：進行「趣味猜詞比賽」，學生會成員選擇一些與學生會、學校或流行文化相關的詞語，讓參與者進行猜詞遊戲。答對的同學可獲得筆或糖果。</li>
                            <li>放學後：門口宣傳，follow IG，發放筆、糖果和紙巾</li>
                        </ul>
                    </div>
                    <div class="event-card">
                        <h3>10月9日  宣傳期第八天</h3>
                        <p><strong>活動主題：</strong>「Champions!決戰」（Champions! Showdown Day）</p>
                        <p><strong>時間安排：</strong></p>
                        <ul>
                            <li>上課前：派發投票指南和筆，介紹午息的學術對決活動。</li>
                            <li>放學後：門口宣傳，follow IG，發放糖果和紙巾，提醒同學積極參與接下來的投票。</li>
                        </ul>
                    </div>
                    <div class="event-card">
                        <h3>10月10號 – 宣傳期第九天</h3>
                        <p><strong>活動主題：</strong>最終拉票（Final Campaign）</p>
                        <p><strong>時間安排：</strong></p>
                        <ul>
                            <li>上課前：最終宣傳、派發宣傳物資。</li>
                            <li>午息：在禮堂設置「Champions!攤位活動」，設置數學題目、中文詩詞、估歌仔，變成攤位，例如搭幾張枱凳，開中央咪宣傳。參與的同學可以獲得「Champions!免費即影即有體驗」</li>
                            <li>放學後：在學校門口宣傳，follow IG，發放宣傳物品（糖）。</li>
                        </ul>
                    </div>
                </div>
                `;
            case 'school-affairs':
                return '<h2><i class="fas fa-school"></i> 校內事務</h2>' +
                    '<p style="margin-bottom: 1.5em;">同學們應關心本校事務，學生會不僅是學生的代表，也應積極參與學校事務。Champions抱持開放態度，不僅為學生發聲，還鼓勵大家親自參與，詳如下：</p>' +
                    '<h3 class="blue-text" style="margin-top: 1.5em; margin-bottom: 1em;">i) 多元活動、動靜皆宜</h3>' +
                    '<p style="margin-bottom: 1.5em;">舉辦不同課外活動，包括：</p>' +
                    '<ol style="margin-bottom: 1.5em;">' +
                    '<li style="margin-bottom: 0.75em;">羽毛球比賽</li>' +
                    '<li style="margin-bottom: 0.75em;">三人籃球</li>' +
                    '<li style="margin-bottom: 0.75em;">排球比賽</li>' +
                    '<li style="margin-bottom: 0.75em;">萬聖節trick or treat</li>' +
                    '<li style="margin-bottom: 0.75em;">聖誕聯歡（爭取便服日）</li>' +
                    '<li style="margin-bottom: 0.75em;">尋找利是</li>' +
                    '<li style="margin-bottom: 0.75em;">Random dance</li>' +
                    '<li style="margin-bottom: 0.75em;">Easter尋蛋</li>' +
                    '<li style="margin-bottom: 0.75em;">電競比賽</li>' +
                    '<li style="margin-bottom: 0.75em;">迎新活動</li>' +
                    '<li style="margin-bottom: 0.75em;">歌唱賽</li>' +
                    '</ol>' +
                    '<h3 class="blue-text" style="margin-top: 1.5em; margin-bottom: 1em;">ii) 學術發展、開發潛能</h3>' +
                    '<ol start="12" style="margin-bottom: 1.5em;">' +
                    '<li style="margin-bottom: 0.75em;">聯校oral</li>' +
                    '<li style="margin-bottom: 0.75em;">交換mock卷</li>' +
                    '<li style="margin-bottom: 0.75em;">尖子策略交流會</li>' +
                    '</ol>' +
                    '<h3 class="blue-text" style="margin-top: 1.5em; margin-bottom: 1em;">iii) 師生同樂、樂也融融</h3>' +
                    '<ol start="15" style="margin-bottom: 1.5em;">' +
                    '<li style="margin-bottom: 0.75em;">敬師週　(送小禮物給老師、猜猜我是誰、給老師的話)</li>' +
                    '<li style="margin-bottom: 0.75em;">各類師生比賽 (籃球，足球)</li>' +
                    '<li style="margin-bottom: 0.75em;">師生烹飪大賽 (同學請老師組隊參加)</li>' +
                    '<li style="margin-bottom: 0.75em;">校長面對面</li>' +
                    '</ol>';
            case 'welfare':
                // 创建样式标签
                const style = document.createElement('style');
                style.textContent = `
                    .welfare-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                        gap: 20px;
                        margin-top: 20px;
                    }
                    .welfare-item {
                        background-color: #f0f0f0;
                        border-radius: 8px;
                        padding: 15px;
                        text-align: center;
                        transition: all 0.3s ease;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    }
                    .welfare-item span {
                        display: inline-block;
                        transition: transform 0.3s ease;
                    }
                    .welfare-item:hover {
                        background-color: #e0e0e0;
                        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                    }
                    .welfare-item:hover span {
                        transform: translateX(5px);
                    }
                `;
                // 将样式标签插入到文档头部
                document.head.appendChild(style);

                return '<h2><i class="fas fa-heart"></i> 學生福利</h2>' +
                    '<p>Champions！候選內閣致力於為同學們提供多樣化的福利服務。以下是我們計劃提供的福利項目：</p>' +
                    '<div class="welfare-grid">' +
                    '<div class="welfare-item"><span>叮飯</span></div>' +
                    '<div class="welfare-item"><span>借用雨傘</span></div>' +
                    '<div class="welfare-item"><span>借用風筒</span></div>' +
                    '<div class="welfare-item"><span>借用充電寶</span></div>' +
                    '<div class="welfare-item"><span>借用髮圈髮夾</span></div>' +
                    '<div class="welfare-item"><span>意見收集</span></div>' +
                    '<div class="welfare-item"><span>拍立得"即影即有"</span></div>' +
                    '<div class="welfare-item"><span>改善洗手間</span></div>' +
                    '<div class="welfare-item"><span>文具售賣</span></div>' +
                    '<div class="welfare-item"><span>暖包售賣</span></div>' +
                    '<div class="welfare-item"><span>女性用品售賣</span></div>' +
                    '<div class="welfare-item"><span>爭取改善飲水機水質</span></div>' +
                    '</div>' +
                    '<p><strong>P.S. 本閣所提供的一切福利將不會收取任何的利潤。本閣會不斷提供校內福利，因此未能夠絕對清楚列明物品。</strong></p>';
            case 'members':
                return '<h2><i class="fas fa-list"></i> 學生會名單</h2>' +
                    '<div class="members-grid">' +
                    '<div class="member-card">' +
                    '<div class="member-position">主席</div>' +
                    '<div class="member-name">5B 18 冼星朗</div>' +
                    '</div>' +
                    '<div class="member-card">' +
                    '<div class="member-position">內務副主席</div>' +
                    '<div class="member-name">5B 19 施鈿熙</div>' +
                    '</div>' +
                    '<div class="member-card">' +
                    '<div class="member-position">外務副主席</div>' +
                    '<div class="member-name">4A 24 吳煒樺</div>' +
                    '</div>' +
                    '<div class="member-card">' +
                    '<div class="member-position">康樂（規劃）</div>' +
                    '<div class="member-name">5B 26 吳慧珍，5A 19 李詩凡</div>' +
                    '</div>' +
                    '<div class="member-card">' +
                    '<div class="member-position">文書</div>' +
                    '<div class="member-name">5B 14 廖梓鍵</div>' +
                    '</div>' +
                    '<div class="member-card">' +
                    '<div class="member-position">宣傳</div>' +
                    '<div class="member-name">2D 29 王雯雯，2A 17 林建希，5B 23 屈子强</div>' +
                    '</div>' +
                    '<div class="member-card">' +
                    '<div class="member-position">福利</div>' +
                    '<div class="member-name">5C 15 李家宏，2D 32 周芷缘</div>' +
                    '</div>' +
                    '<div class="member-card">' +
                    '<div class="member-position">財政</div>' +
                    '<div class="member-name">5B 34 鍾咏琳</div>' +
                    '</div>' +
                    '<div class="member-card">' +
                    '<div class="member-position">四社聯繫</div>' +
                    '<div class="member-name">5B 3 陳蔓涵</div>' +
                    '</div>' +
                    '<div class="member-card">' +
                    '<div class="member-position">資與科技幹事</div>' +
                    '<div class="member-name">4B 18 吳澤璟</div>' +
                    '</div>' +
                    '<div class="member-card">' +
                    '<div class="member-position">體育幹事</div>' +
                    '<div class="member-name">5B 25 胡俊賢</div>' +
                    '</div>' +
                    '</div>';
            case 'contact':
                return '<h2><i class="fas fa-envelope"></i> 聯絡我們</h2>' +
                    '<p>我們非常重視您的意見和建議。如果您有任何問題或想法，請隨時與我們聯繫。</p>' +
                    '<div class="contact-info">' +
                    '<p>Email：randyxian08@gmail.com</p>' +
                    '<p>' +
                    '<a href="https://www.instagram.com/klss_champions" target="_blank" rel="noopener noreferrer"><i class="fab fa-instagram" style="font-size: 16px;"></i> Instagram：@klss_champions</a>' +
                    '</p>' +
                    '<p>' +
                    '<a href="https://www.klss.edu.hk/" target="_blank" rel="noopener noreferrer"><img src="images/schoollogo.png" alt="School Logo" style="width: 16px; height: 16px; vertical-align: middle;"> 學校官網</a>' +
                    '</p>' +
                    '<p>辦公室地址：高雷中學學生活動中心 SU</p>' +
                    '</div>';
            default:
                return '<h2>404 Not Found</h2><p>抱歉，您要查看的頁面不存在。</p>';
        }
    }

    // 搜索功能
    if (searchButton) {
        searchButton.addEventListener('click', search);
    } else {
        console.error('搜索按钮未找到');
    }
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            search();
        }
    });

    // 初始化
    preloadContent();
    var initialPage = window.location.hash.substr(1) || 'home';
    loadContent(initialPage);
    setActiveLink(document.querySelector('nav a[href="#' + initialPage + '"]'));

    // 确保 loadContentAndUpdateURL 函数在全局范围内可用
    window.loadContentAndUpdateURL = loadContentAndUpdateURL;

    // 处理浏览器的后退和前进按钮
    window.addEventListener('popstate', function(event) {
        var page = window.location.hash.substr(1) || 'home';
        loadContent(page);
        setActiveLink(document.querySelector('nav a[href="#' + page + '"]'));
    });

    console.log('页面加载完成');
    console.log('搜索按钮:', searchButton);
    console.log('搜索输入框:', searchInput);

    // 手动初始化 jieba
    if (typeof jieba === 'undefined') {
        console.log('正在手动初始化 jieba');
        window.jieba = {
            cut: function(text) {
                // 简单的分词实现，按空格分割
                return text.split(/\s+/);
            }
        };
    }

    console.log('jieba 状态:', typeof jieba !== 'undefined' ? '已加载' : '未加载');

    // 图片轮播
    function setupImageCarousel() {
        const carousel = document.querySelector('.image-carousel');
        const images = carousel.querySelectorAll('img');
        const leftArrow = carousel.querySelector('.carousel-arrow.left');
        const rightArrow = carousel.querySelector('.carousel-arrow.right');
        let currentImage = 0;

        function showImage(index) {
            images[currentImage].classList.remove('active');
            images[index].classList.add('active');
            currentImage = index;
        }

        function nextImage() {
            showImage((currentImage + 1) % images.length);
        }

        function prevImage() {
            showImage((currentImage - 1 + images.length) % images.length);
        }

        leftArrow.addEventListener('click', prevImage);
        rightArrow.addEventListener('click', nextImage);

        // 自动轮播
        setInterval(nextImage, 5000);
    }

    // 在 loadContent 函数中调用 setupImageCarousel
    function loadContent(page) {
        content.classList.add('fade-out');
        setTimeout(() => {
            content.innerHTML = contentCache[page] || generateContent(page);
            content.classList.remove('fade-out');
            content.classList.add('fade-in');
            
            // 添加新的动画效果
            const elements = content.querySelectorAll('h2, h3, p, .event-card, .member-card');
            elements.forEach((el, index) => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    el.style.transition = 'opacity 0.5s, transform 0.5s';
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, index * 100);
            });

            setTimeout(() => {
                content.classList.remove('fade-in');
            }, 300);

            if (page === 'home') {
                setupImageCarousel();
            }
        }, 150);
    }
});
