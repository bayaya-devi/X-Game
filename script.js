(() => {
  const modal = document.getElementById("playModal");
  const title = document.getElementById("playTitle");
  const instructions = document.getElementById("playInstructions");
  const area = document.getElementById("playArea");
  const hint = document.getElementById("playHint");
  const closeButton = document.querySelector(".x-play-close");
  const restartButton = document.getElementById("restartGame");
  let activeGame = "";
  let cleanupGame = () => {};

  const gameInfo = {
    "neon-drift": {
      title: "Neon Drift",
      instructions: "بدّل المسار باش تفادى الحواجز. كلما بقيتي مدة أطول، كتجمع نقط أكثر.",
      hint: "← → أو أزرار اليمين واليسار"
    },
    "pixel-runner": {
      title: "Pixel Runner",
      instructions: "نقز فوق الحواجز. ضغط على المسافة أو على زر النقز.",
      hint: "مسافة أو ↑ أو زر «نقز»"
    },
    "memory-vault": {
      title: "Memory Vault",
      instructions: "قلب جوج كروت كل مرة وحاول تلقى 8 ديال الأزواج.",
      hint: "قلب الكروت بالضغط أو اللمس"
    },
    "snake-x": {
      title: "Snake X",
      instructions: "جمع النجوم وكبر، ولكن رد بالك من الحيطان ومن ذيلك.",
      hint: "الأسهم أو أزرار الاتجاهات"
    },
    "space-escape": {
      title: "Space Escape",
      instructions: "تفادى النيازك وجمع النجوم. عندك 3 محاولات.",
      hint: "← → أو أزرار اليمين واليسار"
    },
    "morpion-x": {
      title: "Morpion X",
      instructions: "لعبو بجوج ف نفس الجهاز: X من بعد O. أول واحد يصفّ 3 رموز كيربح.",
      hint: "ضغط على الخانة اللي بغيتي"
    },
    "puzzle-lab": {
      title: "Puzzle Lab",
      instructions: "حرّك الأرقام لخانة خاوية حتى يرتبو من 1 حتى 8.",
      hint: "ضغط غير على رقم حدا الخانة الخاوية"
    },
    "skyline-sprint": {
      title: "Skyline Sprint",
      instructions: "وقف المؤشر ملي يوصل للمنطقة المضيئة. خاصك تصيب 3 مرات فـ 5 محاولات.",
      hint: "ضغط على «وقف!» ملي يكون المؤشر فالوسط"
    }
  };

  function stopGame() {
    cleanupGame();
    cleanupGame = () => {};
  }

  function setStatus(text) {
    const status = area.querySelector(".x-game-status");
    if (status) status.textContent = text;
  }

  function setMessage(text) {
    const message = area.querySelector(".x-game-message");
    if (message) message.textContent = text;
  }

  function bindKeys(handler) {
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }

  function openGame(id) {
    if (!gameInfo[id]) return;
    stopGame();
    activeGame = id;
    title.textContent = gameInfo[id].title;
    instructions.textContent = gameInfo[id].instructions;
    hint.textContent = gameInfo[id].hint;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    restartGame();
    closeButton.focus();
  }

  function closeGame() {
    stopGame();
    modal.hidden = true;
    document.body.style.overflow = "";
    activeGame = "";
  }

  function restartGame() {
    stopGame();
    const renderers = {
      "neon-drift": renderNeonDrift,
      "pixel-runner": renderPixelRunner,
      "memory-vault": renderMemory,
      "snake-x": renderSnake,
      "space-escape": renderSpaceEscape,
      "morpion-x": renderMorpion,
      "puzzle-lab": renderPuzzle,
      "skyline-sprint": renderSkyline
    };
    cleanupGame = (renderers[activeGame] || (() => () => {}))();
  }

  document.querySelectorAll("[data-play]").forEach(button => {
    button.addEventListener("click", () => openGame(button.dataset.play));
  });
  closeButton.addEventListener("click", closeGame);
  restartButton.addEventListener("click", restartGame);
  modal.addEventListener("click", event => {
    if (event.target.hasAttribute("data-close-play")) closeGame();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !modal.hidden) closeGame();
  });

  function renderDodgeBoard(board, lane, icon) {
    board.innerHTML = "";
    board.forEach(item => {
      const row = document.createElement("div");
      row.className = "x-dodge-row";
      for (let i = 0; i < 3; i++) {
        const cell = document.createElement("div");
        cell.className = "x-dodge-cell" + (item === i ? " has-obstacle" : "");
        cell.textContent = item === i ? icon : "";
        row.appendChild(cell);
      }
      boardElement.appendChild(row);
    });
    const carRow = document.createElement("div");
    carRow.className = "x-dodge-car-row";
    for (let i = 0; i < 3; i++) {
      const cell = document.createElement("div");
      cell.className = "x-dodge-cell";
      cell.textContent = i === lane ? (icon === "☄" ? "🚀" : "🚘") : "";
      carRow.appendChild(cell);
    }
    boardElement.appendChild(carRow);
  }

  let boardElement;

  function renderNeonDrift() {
    area.innerHTML = '<div class="x-dodge-wrap"><p class="x-game-status">النقط: 0</p><div class="x-dodge-board" id="dodgeBoard" aria-label="مسارات اللعبة"></div><div class="x-control-row"><button class="x-control-button" data-lane="-1" type="button" aria-label="المسار لليسار">←</button><button class="x-control-button" data-lane="1" type="button" aria-label="المسار لليمين">→</button></div><p class="x-game-message">بدا تفادى الحواجز!</p></div>';
    const rows = Array(6).fill(-1);
    boardElement = area.querySelector("#dodgeBoard");
    let lane = 1;
    let score = 0;
    let ended = false;
    const move = change => { lane = Math.max(0, Math.min(2, lane + change)); };
    const draw = () => renderDodgeBoard(rows, lane, "◆");
    const click = event => {
      const button = event.target.closest("[data-lane]");
      if (button) move(Number(button.dataset.lane));
    };
    const key = event => {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") { event.preventDefault(); move(-1); }
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") { event.preventDefault(); move(1); }
    };
    area.addEventListener("click", click);
    const unbind = bindKeys(key);
    draw();
    const timer = window.setInterval(() => {
      if (ended) return;
      rows.unshift(Math.random() < 0.68 ? Math.floor(Math.random() * 3) : -1);
      rows.pop();
      if (rows[rows.length - 1] === lane) {
        ended = true;
        window.clearInterval(timer);
        setStatus("النقط: " + score);
        setMessage("صدمتِ الحاجز! ضغط على «Recommencer» باش تعاود.");
      } else {
        score++;
        setStatus("النقط: " + score);
        draw();
      }
    }, 600);
    return () => { window.clearInterval(timer); area.removeEventListener("click", click); unbind(); };
  }

  function renderPixelRunner() {
    area.innerHTML = '<div class="x-dodge-wrap"><p class="x-game-status">النقط: 0</p><div class="x-runner-track" id="runnerTrack"><span class="x-runner-character" id="runnerCharacter">✦</span><span class="x-runner-obstacle" id="runnerObstacle"></span></div><div class="x-control-row"><button class="x-control-button" id="jumpButton" type="button">نقز ↑</button></div><p class="x-game-message">نقز ملي يقرب الحاجز!</p></div>';
    const track = area.querySelector("#runnerTrack");
    const character = area.querySelector("#runnerCharacter");
    const obstacle = area.querySelector("#runnerObstacle");
    let obstacleIn = 13;
    let jumpTicks = 0;
    let score = 0;
    let ended = false;
    const jump = () => {
      if (ended || jumpTicks > 0) return;
      jumpTicks = 8;
      character.classList.add("is-jumping");
    };
    const onClick = event => { if (event.target.closest("#jumpButton")) jump(); };
    const key = event => {
      if (event.code === "Space" || event.key === "ArrowUp") { event.preventDefault(); jump(); }
    };
    area.addEventListener("click", onClick);
    const unbind = bindKeys(key);
    const timer = window.setInterval(() => {
      if (ended) return;
      obstacleIn--;
      if (jumpTicks > 0 && --jumpTicks === 0) character.classList.remove("is-jumping");
      obstacle.style.right = Math.max(3, obstacleIn * 6) + "%";
      score++;
      setStatus("النقط: " + score);
      if (obstacleIn <= 0) {
        if (jumpTicks > 0) {
          obstacleIn = 13 + Math.floor(Math.random() * 7);
          setMessage("زوين! كمل الجري.");
        } else {
          ended = true;
          track.classList.add("is-ended");
          window.clearInterval(timer);
          setMessage("الحاجز شدّك! عاود وحاول تقفز فوقو.");
        }
      }
    }, 150);
    return () => { window.clearInterval(timer); area.removeEventListener("click", onClick); unbind(); };
  }

  function renderMemory() {
    const symbols = ["◆", "●", "▲", "★", "✦", "⬟", "♥", "☾"];
    const deck = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
    area.innerHTML = '<div><p class="x-game-status">المحاولات: 0 · الأزواج: 0/8</p><div class="x-memory-grid" id="memoryGrid"></div><p class="x-game-message">قلب جوج كروت.</p></div>';
    const grid = area.querySelector("#memoryGrid");
    let first = null;
    let lock = false;
    let moves = 0;
    let pairs = 0;
    const matched = new Set();
    deck.forEach((symbol, index) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "x-memory-card";
      card.dataset.index = String(index);
      card.textContent = "?";
      card.setAttribute("aria-label", "كارت مخبية");
      grid.appendChild(card);
    });
    let hideTimer;
    const click = event => {
      const card = event.target.closest(".x-memory-card");
      if (!card || lock || matched.has(Number(card.dataset.index)) || card === first) return;
      const index = Number(card.dataset.index);
      card.textContent = deck[index];
      card.classList.add("is-open");
      card.setAttribute("aria-label", deck[index]);
      if (!first) { first = card; return; }
      moves++;
      const second = card;
      if (deck[Number(first.dataset.index)] === deck[index]) {
        matched.add(Number(first.dataset.index)); matched.add(index);
        first.classList.add("is-matched"); second.classList.add("is-matched");
        first = null; pairs++;
        setStatus("المحاولات: " + moves + " · الأزواج: " + pairs + "/8");
        if (pairs === 8) setMessage("ربحتي! لقيتي جميع الأزواج 🎉");
      } else {
        lock = true;
        setStatus("المحاولات: " + moves + " · الأزواج: " + pairs + "/8");
        hideTimer = window.setTimeout(() => {
          [first, second].forEach(item => {
            item.textContent = "?"; item.classList.remove("is-open"); item.setAttribute("aria-label", "كارت مخبية");
          });
          first = null; lock = false;
        }, 650);
      }
    };
    grid.addEventListener("click", click);
    return () => { window.clearTimeout(hideTimer); grid.removeEventListener("click", click); };
  }

  function renderSnake() {
    area.innerHTML = '<div class="x-snake-wrap"><p class="x-game-status">النقط: 0</p><canvas class="x-snake-canvas" id="snakeCanvas" width="300" height="300" aria-label="لعبة الثعبان"></canvas><div class="x-control-row"><button class="x-control-button" data-dir="up" type="button">↑</button></div><div class="x-control-row"><button class="x-control-button" data-dir="left" type="button">←</button><button class="x-control-button" data-dir="down" type="button">↓</button><button class="x-control-button" data-dir="right" type="button">→</button></div><p class="x-game-message">جمع النجمة باش تكبر.</p></div>';
    const canvas = area.querySelector("#snakeCanvas");
    const ctx = canvas.getContext("2d");
    const size = 15;
    let snake = [{x:9,y:10},{x:8,y:10},{x:7,y:10}];
    let direction = {x:1,y:0};
    let nextDirection = direction;
    let food = {x:4,y:5};
    let score = 0;
    let ended = false;
    const draw = () => {
      ctx.fillStyle = "#07130d"; ctx.fillRect(0,0,300,300);
      ctx.strokeStyle = "#173323"; ctx.lineWidth = 1;
      for (let n = 0; n <= 300; n += size) { ctx.beginPath();ctx.moveTo(n,0);ctx.lineTo(n,300);ctx.stroke();ctx.beginPath();ctx.moveTo(0,n);ctx.lineTo(300,n);ctx.stroke(); }
      ctx.fillStyle = "#f1d27d"; ctx.fillRect(food.x*size+3,food.y*size+3,size-6,size-6);
      snake.forEach((part,index) => {ctx.fillStyle=index===0?"#b5f399":"#56a878";ctx.fillRect(part.x*size+2,part.y*size+2,size-4,size-4);});
    };
    const setDirection = dir => {
      const d={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}}[dir];
      if (d && !(d.x === -direction.x && d.y === -direction.y)) nextDirection=d;
    };
    const click=event=>{const button=event.target.closest("[data-dir]");if(button)setDirection(button.dataset.dir);};
    const key=event=>{
      const map={ArrowUp:"up",w:"up",ArrowDown:"down",s:"down",ArrowLeft:"left",a:"left",ArrowRight:"right",d:"right"};
      if(map[event.key]){event.preventDefault();setDirection(map[event.key]);}
    };
    area.addEventListener("click",click);
    const unbind=bindKeys(key);
    draw();
    const timer=window.setInterval(()=>{
      if(ended)return;
      direction=nextDirection;
      const head={x:snake[0].x+direction.x,y:snake[0].y+direction.y};
      const ate=head.x===food.x&&head.y===food.y;
      const body=ate?snake:snake.slice(0,-1);
      if(head.x<0||head.x>=20||head.y<0||head.y>=20||body.some(part=>part.x===head.x&&part.y===head.y)){
        ended=true;window.clearInterval(timer);setMessage("سالـات اللعبة! النقط ديالك: "+score+". عاود جرّب.");return;
      }
      snake.unshift(head);
      if(ate){score++;setStatus("النقط: "+score);do{food={x:Math.floor(Math.random()*20),y:Math.floor(Math.random()*20)}}while(snake.some(part=>part.x===food.x&&part.y===food.y));}
      else snake.pop();
      draw();
    },130);
    return()=>{window.clearInterval(timer);area.removeEventListener("click",click);unbind();};
  }

  function renderSpaceEscape() {
    area.innerHTML = '<div class="x-dodge-wrap"><p class="x-game-status">النقط: 0 · المحاولات: 3</p><div class="x-dodge-board" id="spaceBoard" aria-label="مسارات الفضاء"></div><div class="x-control-row"><button class="x-control-button" data-space="-1" type="button" aria-label="لليسار">←</button><button class="x-control-button" data-space="1" type="button" aria-label="لليمين">→</button></div><p class="x-game-message">تفادى ☄ وجمع ✦.</p></div>';
    const rows = Array(6).fill(null);
    const target = area.querySelector("#spaceBoard");
    let lane=1,score=0,lives=3,ended=false;
    const paint=()=>{
      target.innerHTML="";
      rows.forEach(item=>{
        const row=document.createElement("div");row.className="x-dodge-row";
        for(let i=0;i<3;i++){
          const cell=document.createElement("div");cell.className="x-dodge-cell"+(item&&item.lane===i?" has-obstacle":"");
          cell.textContent=item&&item.lane===i?(item.type==="star"?"✦":"☄"):"";
          row.appendChild(cell);
        }
        target.appendChild(row);
      });
      const ship=document.createElement("div");ship.className="x-dodge-car-row";
      for(let i=0;i<3;i++){const cell=document.createElement("div");cell.className="x-dodge-cell";cell.textContent=i===lane?"🚀":"";ship.appendChild(cell);}
      target.appendChild(ship);
    };
    const move=n=>lane=Math.max(0,Math.min(2,lane+n));
    const click=event=>{const b=event.target.closest("[data-space]");if(b)move(Number(b.dataset.space));};
    const key=event=>{if(event.key==="ArrowLeft"){event.preventDefault();move(-1)}if(event.key==="ArrowRight"){event.preventDefault();move(1)}};
    area.addEventListener("click",click);const unbind=bindKeys(key);paint();
    const timer=window.setInterval(()=>{
      if(ended)return;
      rows.unshift(Math.random()<.48?{lane:Math.floor(Math.random()*3),type:Math.random()<.7?"rock":"star"}:null);rows.pop();
      const hit=rows[rows.length-1];
      if(hit&&hit.lane===lane){
        if(hit.type==="star"){score+=10;setMessage("نجمة! +10 نقط.");}
        else {lives--;setMessage(lives?"ضربك نيزك! باقي "+lives+" محاولات.":"وصلتي للنهاية! عاود وحاول.");}
      }else score++;
      setStatus("النقط: "+score+" · المحاولات: "+lives);paint();
      if(lives<=0){ended=true;window.clearInterval(timer);}
    },560);
    return()=>{window.clearInterval(timer);area.removeEventListener("click",click);unbind();};
  }

  function renderMorpion() {
    area.innerHTML = '<div><p class="x-game-status">دور اللاعب: X</p><div class="x-morpion-grid" id="morpionGrid"></div><p class="x-game-message">بداو اللعب!</p></div>';
    const grid=area.querySelector("#morpionGrid");
    let cells=Array(9).fill("");
    let turn="X",finished=false;
    const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    const paint=()=>{
      grid.innerHTML="";
      cells.forEach((value,index)=>{
        const b=document.createElement("button");b.type="button";b.className="x-morpion-cell"+(value==="O"?" is-o":"");b.textContent=value;b.dataset.cell=String(index);b.disabled=finished||Boolean(value);b.setAttribute("aria-label",value||"خانة فارغة");grid.appendChild(b);
      });
    };
    const click=event=>{
      const b=event.target.closest("[data-cell]");if(!b||finished)return;
      const i=Number(b.dataset.cell);cells[i]=turn;
      const win=wins.find(line=>line.every(n=>cells[n]===turn));
      if(win){finished=true;setStatus("الفائز: "+turn);setMessage("برافو! اللاعب "+turn+" ربح. عاود باش تلعبو من جديد.");}
      else if(cells.every(Boolean)){finished=true;setStatus("تعادل");setMessage("تعادلتو! عاودو اللعبة.");}
      else{turn=turn==="X"?"O":"X";setStatus("دور اللاعب: "+turn);}
      paint();
    };
    grid.addEventListener("click",click);paint();
    return()=>grid.removeEventListener("click",click);
  }

  function renderPuzzle() {
    area.innerHTML = '<div><p class="x-game-status">الحركات: 0</p><div class="x-puzzle-grid" id="puzzleGrid"></div><p class="x-game-message">رتّب الأرقام من 1 حتى 8.</p></div>';
    const grid=area.querySelector("#puzzleGrid");
    const values=[1,2,3,4,5,6,7,8,0];
    let blank=8,moves=0;
    let previous=-1;
    for(let n=0;n<80;n++){
      const options=[blank-3,blank+3,...(blank%3>0?[blank-1]:[]),...(blank%3<2?[blank+1]:[])].filter(i=>i>=0&&i<9&&i!==previous);
      const next=options[Math.floor(Math.random()*options.length)];
      [values[blank],values[next]]=[values[next],values[blank]];
      previous=blank;blank=next;
    }
    const paint=()=>{
      grid.innerHTML="";
      values.forEach((value,index)=>{
        const b=document.createElement("button");b.type="button";b.className="x-puzzle-tile";b.textContent=value||"";b.dataset-tile=String(index);b.setAttribute("aria-label",value?String(value):"خانة فارغة");
        if(!value)b.disabled=true;
        grid.appendChild(b);
      });
    };
    const click=event=>{
      const b=event.target.closest(".x-puzzle-tile");if(!b)return;
      const index=Number(b.dataset.tile);
      const adjacent=Math.abs(Math.floor(index/3)-Math.floor(blank/3))+Math.abs(index%3-blank%3)===1;
      if(!adjacent)return;
      [values[index],values[blank]]=[values[blank],values[index]];blank=index;moves++;
      setStatus("الحركات: "+moves);
      if(values.every((n,i)=>n===((i+1)%9)))setMessage("برافو! رتّبتي اللغز فـ "+moves+" حركة.");
      paint();
    };
    grid.addEventListener("click",click);paint();
    return()=>grid.removeEventListener("click",click);
  }

  function renderSkyline() {
    area.innerHTML = '<div class="x-sprint-wrap"><p class="x-game-status">الإصابات: 0 · المحاولات: 0/5</p><p class="x-sprint-label">وقف المؤشر فالمنطقة المضيئة!</p><div class="x-sprint-track"><span class="x-sprint-target"></span><span class="x-sprint-marker" id="sprintMarker"></span></div><button class="x-control-button" id="sprintStop" type="button">وقف!</button><p class="x-sprint-progress">خاصك 3 إصابات باش تربح.</p><p class="x-game-message">مستعد؟ وقف المؤشر فالنص.</p></div>';
    const marker=area.querySelector("#sprintMarker");
    const button=area.querySelector("#sprintStop");
    let position=0,direction=1,hits=0,attempts=0,ended=false;
    const timer=window.setInterval(()=>{
      if(ended)return;
      position+=direction*2;
      if(position>=100){position=100;direction=-1;}
      if(position<=0){position=0;direction=1;}
      marker.style.left=position+"%";
    },28);
    const hit=()=>{
      if(ended)return;
      attempts++;
      if(position>=38&&position<=62){hits++;setMessage("إصابة موفقة!");}
      else setMessage("قريبة! ركّز فالمحاولة الجاية.");
      setStatus("الإصابات: "+hits+" · المحاولات: "+attempts+"/5");
      if(hits>=3){ended=true;window.clearInterval(timer);setMessage("ربحتي Skyline Sprint! 🎉");}
      else if(attempts>=5){ended=true;window.clearInterval(timer);setMessage("سالاو المحاولات. عاود وحاول تصيب 3 مرات.");}
    };
    button.addEventListener("click",hit);
    const key=event=>{if(event.key==="Enter"&&!modal.hidden){event.preventDefault();hit();}};
    const unbind=bindKeys(key);
    return()=>{window.clearInterval(timer);button.removeEventListener("click",hit);unbind();};
  }
})();