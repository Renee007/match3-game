class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 8;
        this.cellSize = 75;
        this.score = 0;
        
        // 设置画布大小
        this.canvas.width = this.gridSize * this.cellSize;
        this.canvas.height = this.gridSize * this.cellSize;
        
        // 游戏状态
        this.selected = null;
        this.animations = [];
        this.board = [];
        
        // 动物类型
        this.patterns = ['sheep', 'rabbit', 'capybara', 'bear', 'dino'];
        
        // 颜色配置
        this.colors = {
            'sheep': {
                main: '#FFFFFF',     // 羊毛白
                detail: '#E8E8E8',   // 浅灰
                face: '#FFE5D9',     // 肤色
                dark: '#4A4A4A'      // 深灰
            },
            'rabbit': {
                main: '#D4A7A1',     // 兔毛色
                detail: '#C49A94',   // 深兔毛色
                face: '#FFE5D9',     // 肤色
                dark: '#8B6E6A'      // 深褐色
            },
            'capybara': {
                main: '#8B7355',     // 棕色
                detail: '#6B563D',   // 深棕
                face: '#9B8B73',     // 浅棕
                dark: '#4A3C2A'      // 暗棕
            },
            'bear': {
                main: '#6B4423',     // 棕熊色
                detail: '#523318',   // 深棕
                face: '#7B542D',     // 浅棕
                dark: '#3A2412'      // 暗棕
            },
            'dino': {
                main: '#4F7942',     // 恐龙绿
                detail: '#3A5A30',   // 深绿
                face: '#5F8952',     // 浅绿
                dark: '#2A4020'      // 暗绿
            }
        };
        
        // 动画配置
        this.animationConfig = {
            swapDuration: 300,    // 交换动画持续时间（毫秒）
            removeDuration: 400,  // 消除动画持续时间（毫秒）
            fallDuration: 500,    // 下落动画持续时间（毫秒）
            lastTime: 0
        };
        
        // 初始化游戏
        this.initializeBoard();
        this.setupEventListeners();
        this.gameLoop();
    }
    
    initializeBoard() {
        // 创建初始游戏板
        for (let row = 0; row < this.gridSize; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                this.board[row][col] = this.patterns[Math.floor(Math.random() * this.patterns.length)];
            }
        }
        
        // 确保初始状态没有匹配
        while (this.findMatches().length > 0) {
            this.initializeBoard();
        }
    }
    
    // 缓动函数
    easeOutBack(x) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    }
    
    easeOutBounce(x) {
        const n1 = 7.5625;
        const d1 = 2.75;
        
        if (x < 1 / d1) {
            return n1 * x * x;
        } else if (x < 2 / d1) {
            return n1 * (x -= 1.5 / d1) * x + 0.75;
        } else if (x < 2.5 / d1) {
            return n1 * (x -= 2.25 / d1) * x + 0.9375;
        } else {
            return n1 * (x -= 2.625 / d1) * x + 0.984375;
        }
    }
    
    easeOutElastic(x) {
        const c4 = (2 * Math.PI) / 3;
        return x === 0 ? 0 : x === 1 ? 1 :
            Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    }
    
    drawAnimal(pattern, x, y, size, scale = 1, rotation = 0, opacity = 1) {
        const colors = this.colors[pattern];
        
        this.ctx.save();
        this.ctx.translate(x + size/2, y + size/2);
        this.ctx.rotate(rotation);
        this.ctx.scale(scale, scale);
        this.ctx.translate(-(x + size/2), -(y + size/2));
        this.ctx.globalAlpha = opacity;
        
        switch(pattern) {
            case 'sheep':
                // 绘制羊
                // 身体轮廓
                this.ctx.fillStyle = colors.main;
                this.ctx.beginPath();
                this.ctx.arc(x + size/2, y + size/2, size/2 - 2, 0, Math.PI * 2);
                this.ctx.fill();
                
                // 卷曲羊毛效果
                this.ctx.fillStyle = colors.detail;
                for(let i = 0; i < 12; i++) {
                    const angle = (i / 12) * Math.PI * 2;
                    const radius = size/2 - 5;
                    const cx = x + size/2 + Math.cos(angle) * radius * 0.8;
                    const cy = y + size/2 + Math.sin(angle) * radius * 0.8;
                    
                    this.ctx.beginPath();
                    this.ctx.arc(cx, cy, size/8, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                
                // 头部
                this.ctx.fillStyle = colors.face;
                this.ctx.beginPath();
                this.ctx.ellipse(x + size/2, y + size/2, size/3, size/2.5, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                // 耳朵
                this.ctx.fillStyle = colors.dark;
                this.ctx.beginPath();
                this.ctx.ellipse(x + size/3, y + size/3, size/10, size/6, -Math.PI/6, 0, Math.PI * 2);
                this.ctx.ellipse(x + size*2/3, y + size/3, size/10, size/6, Math.PI/6, 0, Math.PI * 2);
                this.ctx.fill();
                break;
                
            case 'rabbit':
                // 绘制兔子
                // 头部
                this.ctx.fillStyle = colors.main;
                this.ctx.beginPath();
                this.ctx.ellipse(x + size/2, y + size/2, size/2.2, size/2, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                // 长耳朵
                this.ctx.fillStyle = colors.main;
                this.ctx.beginPath();
                this.ctx.ellipse(x + size/3, y + size/4, size/6, size/2.2, -Math.PI/12, 0, Math.PI * 2);
                this.ctx.ellipse(x + size*2/3, y + size/4, size/6, size/2.2, Math.PI/12, 0, Math.PI * 2);
                this.ctx.fill();
                
                // 耳朵内部
                this.ctx.fillStyle = colors.detail;
                this.ctx.beginPath();
                this.ctx.ellipse(x + size/3, y + size/4, size/8, size/2.4, -Math.PI/12, 0, Math.PI * 2);
                this.ctx.ellipse(x + size*2/3, y + size/4, size/8, size/2.4, Math.PI/12, 0, Math.PI * 2);
                this.ctx.fill();
                
                // 鼻子
                this.ctx.fillStyle = colors.dark;
                this.ctx.beginPath();
                this.ctx.ellipse(x + size/2, y + size/2 + size/8, size/12, size/16, 0, 0, Math.PI * 2);
                this.ctx.fill();
                break;
                
            case 'capybara':
                // 绘制水豚
                // 圆润的身体
                this.ctx.fillStyle = colors.main;
                this.ctx.beginPath();
                this.ctx.ellipse(x + size/2, y + size/2, size/2 - 2, size/2.2, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                // 特征性的大鼻子
                this.ctx.fillStyle = colors.dark;
                this.ctx.beginPath();
                this.ctx.ellipse(x + size/2, y + size/2 + size/6, size/4, size/6, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                // 耳朵
                this.ctx.fillStyle = colors.detail;
                this.ctx.beginPath();
                this.ctx.arc(x + size/4, y + size/3, size/8, 0, Math.PI * 2);
                this.ctx.arc(x + size*3/4, y + size/3, size/8, 0, Math.PI * 2);
                this.ctx.fill();
                break;
                
            case 'bear':
                // 绘制熊
                // 圆脸
                this.ctx.fillStyle = colors.main;
                this.ctx.beginPath();
                this.ctx.arc(x + size/2, y + size/2, size/2 - 2, 0, Math.PI * 2);
                this.ctx.fill();
                
                // 圆耳朵
                this.ctx.fillStyle = colors.main;
                this.ctx.beginPath();
                this.ctx.arc(x + size/4, y + size/4, size/4, 0, Math.PI * 2);
                this.ctx.arc(x + size*3/4, y + size/4, size/4, 0, Math.PI * 2);
                this.ctx.fill();
                
                // 耳朵内部
                this.ctx.fillStyle = colors.detail;
                this.ctx.beginPath();
                this.ctx.arc(x + size/4, y + size/4, size/6, 0, Math.PI * 2);
                this.ctx.arc(x + size*3/4, y + size/4, size/6, 0, Math.PI * 2);
                this.ctx.fill();
                
                // 鼻子
                this.ctx.fillStyle = colors.dark;
                this.ctx.beginPath();
                this.ctx.ellipse(x + size/2, y + size/2 + size/8, size/6, size/8, 0, 0, Math.PI * 2);
                this.ctx.fill();
                break;
                
            case 'dino':
                // 绘制恐龙（霸王龙风格）
                // 头部轮廓
                this.ctx.fillStyle = colors.main;
                this.ctx.beginPath();
                this.ctx.moveTo(x + size*0.3, y + size*0.3);
                this.ctx.quadraticCurveTo(x + size*0.5, y + size*0.2, x + size*0.8, y + size*0.4);
                this.ctx.quadraticCurveTo(x + size*0.9, y + size*0.5, x + size*0.8, y + size*0.7);
                this.ctx.quadraticCurveTo(x + size*0.6, y + size*0.8, x + size*0.3, y + size*0.7);
                this.ctx.closePath();
                this.ctx.fill();
                
                // 下颌
                this.ctx.fillStyle = colors.detail;
                this.ctx.beginPath();
                this.ctx.moveTo(x + size*0.8, y + size*0.5);
                this.ctx.quadraticCurveTo(x + size*0.7, y + size*0.65, x + size*0.4, y + size*0.6);
                this.ctx.lineTo(x + size*0.3, y + size*0.7);
                this.ctx.quadraticCurveTo(x + size*0.6, y + size*0.8, x + size*0.8, y + size*0.7);
                this.ctx.closePath();
                this.ctx.fill();
                break;
        }
        
        // 为所有动物添加眼睛
        if (pattern !== 'dino') {
            // 普通动物的圆形眼睛
            this.ctx.fillStyle = '#000000';
            this.ctx.beginPath();
            this.ctx.arc(x + size*0.35, y + size*0.4, size/12, 0, Math.PI * 2);
            this.ctx.arc(x + size*0.65, y + size*0.4, size/12, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 眼睛高光
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.beginPath();
            this.ctx.arc(x + size*0.35 + size/24, y + size*0.4 - size/24, size/30, 0, Math.PI * 2);
            this.ctx.arc(x + size*0.65 + size/24, y + size*0.4 - size/24, size/30, 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            // 恐龙的椭圆形眼睛
            this.ctx.fillStyle = '#000000';
            this.ctx.beginPath();
            this.ctx.ellipse(x + size*0.6, y + size*0.4, size/16, size/12, Math.PI/6, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 恐龙眼睛高光
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.beginPath();
            this.ctx.ellipse(x + size*0.62, y + size*0.38, size/32, size/24, Math.PI/6, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格背景
        this.ctx.fillStyle = '#f0f0f0';
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if ((row + col) % 2 === 0) {
                    this.ctx.fillRect(col * this.cellSize, row * this.cellSize, 
                                    this.cellSize, this.cellSize);
                }
            }
        }
        
        // 绘制动物
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const pattern = this.board[row][col];
                if (pattern) {
                    let x = col * this.cellSize;
                    let y = row * this.cellSize;
                    let scale = 1;
                    let rotation = 0;
                    let opacity = 1;
                    
                    // 检查是否有动画
                    const anim = this.animations.find(a => 
                        a.row === row && a.col === col);
                    
                    if (anim) {
                        const progress = anim.easedProgress || anim.progress;
                        
                        switch(anim.type) {
                            case 'swap':
                                x += anim.offsetX * progress;
                                y += anim.offsetY * progress;
                                // 添加轻微的旋转效果
                                rotation = Math.sin(progress * Math.PI) * 0.2;
                                break;
                                
                            case 'remove':
                                scale = 1 - progress;
                                opacity = 1 - progress;
                                rotation = progress * Math.PI * 2;
                                break;
                                
                            case 'fall':
                                y = (anim.startY + (row - anim.startRow) * 
                                    this.cellSize * progress);
                                // 添加弹跳效果
                                scale = 1 + Math.sin(progress * Math.PI) * 0.2;
                                break;
                        }
                    }
                    
                    // 绘制动物时加入所有动画效果
                    this.drawAnimal(pattern, x, y, this.cellSize, scale, rotation, opacity);
                }
            }
        }
        
        // 绘制选中框
        if (this.selected) {
            const [row, col] = this.selected;
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(col * this.cellSize, row * this.cellSize,
                              this.cellSize, this.cellSize);
        }
    }
    
    updateAnimations(timestamp) {
        if (!this.animationConfig.lastTime) {
            this.animationConfig.lastTime = timestamp;
            return;
        }
        
        const deltaTime = timestamp - this.animationConfig.lastTime;
        this.animationConfig.lastTime = timestamp;
        
        for (let anim of this.animations) {
            const duration = {
                'swap': this.animationConfig.swapDuration,
                'remove': this.animationConfig.removeDuration,
                'fall': this.animationConfig.fallDuration
            }[anim.type];
            
            anim.progress = Math.min(1, anim.progress + (deltaTime / duration));
            
            // 为不同类型的动画使用不同的缓动函数
            switch(anim.type) {
                case 'swap':
                    anim.easedProgress = this.easeOutBack(anim.progress);
                    break;
                case 'remove':
                    anim.easedProgress = this.easeOutElastic(anim.progress);
                    break;
                case 'fall':
                    anim.easedProgress = this.easeOutBounce(anim.progress);
                    break;
            }
        }
        
        // 移除完成的动画
        const completedAnimations = this.animations.filter(anim => anim.progress >= 1);
        this.animations = this.animations.filter(anim => anim.progress < 1);
        
        // 如果有动画完成，检查是否需要进行下一步操作
        if (completedAnimations.length > 0) {
            setTimeout(() => {
                if (this.removeMatches()) {
                    setTimeout(() => {
                        this.applyGravity();
                    }, 50);
                }
            }, 50);
        }
    }
    
    findMatches() {
        const matches = new Set();
        
        // 检查水平匹配
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize - 2; col++) {
                const current = this.board[row][col];
                if (current && 
                    current === this.board[row][col + 1] && 
                    current === this.board[row][col + 2]) {
                    matches.add(`${row},${col}`);
                    matches.add(`${row},${col+1}`);
                    matches.add(`${row},${col+2}`);
                }
            }
        }
        
        // 检查垂直匹配
        for (let row = 0; row < this.gridSize - 2; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const current = this.board[row][col];
                if (current && 
                    current === this.board[row + 1][col] && 
                    current === this.board[row + 2][col]) {
                    matches.add(`${row},${col}`);
                    matches.add(`${row+1},${col}`);
                    matches.add(`${row+2},${col}`);
                }
            }
        }
        
        return Array.from(matches).map(pos => {
            const [row, col] = pos.split(',').map(Number);
            return {row, col};
        });
    }
    
    removeMatches() {
        const matches = this.findMatches();
        if (matches.length === 0) return false;
        
        // 添加消除动画
        for (const {row, col} of matches) {
            this.animations.push({
                type: 'remove',
                row,
                col,
                progress: 0
            });
            this.board[row][col] = null;
        }
        
        // 更新分数
        this.score += matches.length * 10;
        document.getElementById('score').textContent = this.score;
        
        return true;
    }
    
    applyGravity() {
        let moved = false;
        for (let col = 0; col < this.gridSize; col++) {
            let emptyRow = this.gridSize - 1;
            for (let row = this.gridSize - 1; row >= 0; row--) {
                if (this.board[row][col]) {
                    if (emptyRow !== row) {
                        // 添加下落动画
                        this.animations.push({
                            type: 'fall',
                            row: emptyRow,
                            col: col,
                            startRow: row,
                            startY: row * this.cellSize,
                            progress: 0
                        });
                        
                        this.board[emptyRow][col] = this.board[row][col];
                        this.board[row][col] = null;
                        moved = true;
                    }
                    emptyRow--;
                }
            }
        }
        return moved;
    }
    
    swapTiles(pos1, pos2) {
        const [row1, col1] = pos1;
        const [row2, col2] = pos2;
        
        // 添加交换动画
        this.animations.push({
            type: 'swap',
            row: row1,
            col: col1,
            offsetX: (col2 - col1) * this.cellSize,
            offsetY: (row2 - row1) * this.cellSize,
            progress: 0
        });
        
        this.animations.push({
            type: 'swap',
            row: row2,
            col: col2,
            offsetX: (col1 - col2) * this.cellSize,
            offsetY: (row1 - row2) * this.cellSize,
            progress: 0
        });
        
        // 实际交换
        [this.board[row1][col1], this.board[row2][col2]] = 
        [this.board[row2][col2], this.board[row1][col1]];
    }
    
    handleClick(event) {
        // 如果有动画正在进行，不处理点击
        if (this.animations.length > 0) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize) return;
        
        if (!this.selected) {
            this.selected = [row, col];
        } else {
            const [selectedRow, selectedCol] = this.selected;
            const isAdjacent = Math.abs(row - selectedRow) + Math.abs(col - selectedCol) === 1;
            
            if (isAdjacent) {
                // 交换前先保存状态
                const oldBoard = JSON.parse(JSON.stringify(this.board));
                
                // 尝试交换
                this.swapTiles(this.selected, [row, col]);
                
                // 检查是否形成匹配
                if (!this.findMatches().length) {
                    // 如果没有匹配，等待动画完成后换回来
                    setTimeout(() => {
                        this.swapTiles(this.selected, [row, col]);
                        this.board = oldBoard;
                    }, this.animationConfig.swapDuration);
                }
            }
            this.selected = null;
        }
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('click', this.handleClick.bind(this));
    }
    
    gameLoop(timestamp) {
        this.updateAnimations(timestamp);
        
        if (this.animations.length === 0) {
            if (this.removeMatches()) {
                setTimeout(() => {
                    this.applyGravity();
                }, 50);  // 减少延迟时间使动画更连贯
            }
        }
        
        this.draw();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}

// 启动游戏
window.onload = () => {
    new Game();
};
