class AiGenerator {
    constructor() {
        this.aircraftTemplates = {
            fighter: {
                baseStats: { speed: 70, firepower: 60, armor: 50 },
                description: "轻巧快速的战斗机，具有优秀的机动性"
            },
            bomber: {
                baseStats: { speed: 40, firepower: 90, armor: 70 },
                description: "重型轰炸机，火力强大但机动性较差"
            },
            scout: {
                baseStats: { speed: 90, firepower: 30, armor: 40 },
                description: "高速侦察机，速度极快但防护较弱"
            },
            interceptor: {
                baseStats: { speed: 80, firepower: 70, armor: 60 },
                description: "拦截机，攻防平衡的多用途战机"
            }
        };

        this.weaponTypes = {
            laser: {
                name: "激光炮",
                damage: 20,
                fireRate: 200,
                description: "高精度能量武器",
                color: "#00ffff"
            },
            missile: {
                name: "导弹",
                damage: 40,
                fireRate: 500,
                description: "远程追踪导弹",
                color: "#ff8800"
            },
            plasma: {
                name: "等离子炮",
                damage: 30,
                fireRate: 300,
                description: "中程等离子武器",
                color: "#ff00ff"
            },
            railgun: {
                name: "轨道炮",
                damage: 60,
                fireRate: 800,
                description: "超高威力动能武器",
                color: "#ffff00"
            }
        };

        this.colorSchemes = {
            fire: ["#ff0000", "#ff4400", "#ff8800"],
            ice: ["#00ffff", "#4444ff", "#8888ff"],
            nature: ["#00ff00", "#44ff44", "#88ff88"],
            void: ["#440044", "#880088", "#cc00cc"],
            solar: ["#ffff00", "#ffaa00", "#ff6600"],
            stealth: ["#333333", "#666666", "#999999"]
        };

        this.nameGenerators = {
            prefixes: ["雷霆", "星际", "量子", "光速", "等离子", "虚空", "钢铁", "幽灵", "风暴", "烈焰"],
            types: ["战机", "猎手", "驱逐舰", "拦截机", "轰炸机", "侦察机", "战舰", "护卫舰"],
            suffixes: ["号", "型", "级", "式"]
        };

        this.promptKeywords = {
            speed: ["快速", "高速", "迅速", "敏捷", "闪电"],
            firepower: ["强大", "火力", "武装", "重型", "毁灭"],
            armor: ["装甲", "防护", "坚固", "重装", "护盾"],
            stealth: ["隐形", "潜行", "幽灵", "暗影", "隐秘"],
            colors: {
                "红色": "#ff0000", "蓝色": "#0000ff", "绿色": "#00ff00",
                "黄色": "#ffff00", "紫色": "#ff00ff", "青色": "#00ffff",
                "橙色": "#ff8800", "粉色": "#ff88ff", "白色": "#ffffff",
                "黑色": "#333333", "金色": "#ffdd00", "银色": "#cccccc"
            }
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('generateAiBtn').addEventListener('click', () => this.generateAircraft());
        document.getElementById('useAiBtn').addEventListener('click', () => this.useGeneratedAircraft());
    }

    async generateAircraft() {
        const prompt = document.getElementById('aiPrompt').value.trim();
        if (!prompt) {
            this.showError('请描述您想要的飞行器');
            return;
        }

        this.setGeneratingState(true);

        try {
            // Analyze prompt and generate aircraft
            const aircraftData = await this.analyzePromptAndGenerate(prompt);
            
            // Display results
            this.displayGeneratedAircraft(aircraftData);
            
        } catch (error) {
            console.error('Error generating aircraft:', error);
            this.showError('生成失败，请重试');
        } finally {
            this.setGeneratingState(false);
        }
    }

    async analyzePromptAndGenerate(prompt) {
        // Simulate AI processing time
        await this.delay(1500 + Math.random() * 1000);

        const analysis = this.analyzePrompt(prompt);
        const aircraft = this.generateFromAnalysis(analysis, prompt);
        
        return aircraft;
    }

    analyzePrompt(prompt) {
        const lowerPrompt = prompt.toLowerCase();
        const analysis = {
            type: 'fighter', // default
            emphasizedStats: [],
            colorPreferences: [],
            specialFeatures: [],
            weaponHints: []
        };

        // Analyze aircraft type
        if (lowerPrompt.includes('轰炸') || lowerPrompt.includes('重型')) {
            analysis.type = 'bomber';
        } else if (lowerPrompt.includes('侦察') || lowerPrompt.includes('快速')) {
            analysis.type = 'scout';
        } else if (lowerPrompt.includes('拦截') || lowerPrompt.includes('防御')) {
            analysis.type = 'interceptor';
        }

        // Analyze stat emphasis
        Object.entries(this.promptKeywords).forEach(([stat, keywords]) => {
            if (Array.isArray(keywords) && keywords.some(keyword => lowerPrompt.includes(keyword))) {
                analysis.emphasizedStats.push(stat);
            }
        });

        // Analyze color preferences
        Object.entries(this.promptKeywords.colors).forEach(([colorName, colorValue]) => {
            if (lowerPrompt.includes(colorName)) {
                analysis.colorPreferences.push(colorValue);
            }
        });

        // Analyze weapon hints
        Object.entries(this.weaponTypes).forEach(([weaponType, weaponData]) => {
            if (lowerPrompt.includes(weaponData.name) || lowerPrompt.includes(weaponType)) {
                analysis.weaponHints.push(weaponType);
            }
        });

        // Analyze special features
        if (this.promptKeywords.stealth.some(keyword => lowerPrompt.includes(keyword))) {
            analysis.specialFeatures.push('stealth');
        }

        return analysis;
    }

    generateFromAnalysis(analysis, originalPrompt) {
        const baseTemplate = this.aircraftTemplates[analysis.type];
        const stats = { ...baseTemplate.baseStats };

        // Modify stats based on emphasis
        analysis.emphasizedStats.forEach(stat => {
            if (stats[stat] !== undefined) {
                stats[stat] = Math.min(100, stats[stat] + 20 + Math.random() * 15);
            }
        });

        // Generate color
        let color = '#00ffff'; // default
        if (analysis.colorPreferences.length > 0) {
            color = analysis.colorPreferences[Math.floor(Math.random() * analysis.colorPreferences.length)];
        } else {
            // Generate based on type and features
            const colorSchemeKey = this.selectColorScheme(analysis);
            const colorScheme = this.colorSchemes[colorSchemeKey];
            color = colorScheme[Math.floor(Math.random() * colorScheme.length)];
        }

        // Generate weapon
        let weaponType = 'laser'; // default
        if (analysis.weaponHints.length > 0) {
            weaponType = analysis.weaponHints[Math.floor(Math.random() * analysis.weaponHints.length)];
        } else {
            // Select weapon based on aircraft type
            const weaponOptions = Object.keys(this.weaponTypes);
            weaponType = weaponOptions[Math.floor(Math.random() * weaponOptions.length)];
        }

        // Generate name
        const name = this.generateName(analysis);

        // Generate description
        const description = this.generateDescription(analysis, originalPrompt, baseTemplate.description);

        // Add special abilities
        const specialAbilities = this.generateSpecialAbilities(analysis);

        return {
            name: name,
            type: analysis.type,
            color: color,
            weaponType: weaponType,
            stats: stats,
            description: description,
            specialAbilities: specialAbilities,
            prompt: originalPrompt
        };
    }

    selectColorScheme(analysis) {
        if (analysis.specialFeatures.includes('stealth')) {
            return 'stealth';
        }
        
        if (analysis.emphasizedStats.includes('speed')) {
            return Math.random() < 0.5 ? 'ice' : 'solar';
        }
        
        if (analysis.emphasizedStats.includes('firepower')) {
            return 'fire';
        }
        
        if (analysis.emphasizedStats.includes('armor')) {
            return 'void';
        }

        // Default random selection
        const schemes = Object.keys(this.colorSchemes);
        return schemes[Math.floor(Math.random() * schemes.length)];
    }

    generateName(analysis) {
        const prefixes = this.nameGenerators.prefixes;
        const types = this.nameGenerators.types;
        const suffixes = this.nameGenerators.suffixes;

        let prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        let type = types[Math.floor(Math.random() * types.length)];
        let suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

        // Customize based on analysis
        if (analysis.emphasizedStats.includes('speed')) {
            prefix = ["光速", "闪电", "量子"][Math.floor(Math.random() * 3)];
        } else if (analysis.emphasizedStats.includes('firepower')) {
            prefix = ["雷霆", "烈焰", "毁灭"][Math.floor(Math.random() * 3)];
        } else if (analysis.specialFeatures.includes('stealth')) {
            prefix = ["幽灵", "暗影", "虚空"][Math.floor(Math.random() * 3)];
        }

        return `${prefix}${type}${suffix}`;
    }

    generateDescription(analysis, originalPrompt, baseDescription) {
        let description = baseDescription;
        
        const features = [];
        
        if (analysis.emphasizedStats.includes('speed')) {
            features.push("拥有超越常规的飞行速度");
        }
        
        if (analysis.emphasizedStats.includes('firepower')) {
            features.push("装备了毁灭性的武器系统");
        }
        
        if (analysis.emphasizedStats.includes('armor')) {
            features.push("具有坚不可摧的装甲防护");
        }
        
        if (analysis.specialFeatures.includes('stealth')) {
            features.push("配备先进的隐形技术");
        }
        
        if (features.length > 0) {
            description += "，" + features.join("，");
        }
        
        description += `。这架飞行器基于您的描述"${originalPrompt}"进行了特殊调优。`;
        
        return description;
    }

    generateSpecialAbilities(analysis) {
        const abilities = [];
        
        if (analysis.specialFeatures.includes('stealth')) {
            abilities.push({
                name: "隐形模式",
                description: "短时间内隐身，避免敌人攻击",
                cooldown: 10
            });
        }
        
        if (analysis.emphasizedStats.includes('speed')) {
            abilities.push({
                name: "极速冲刺",
                description: "瞬间提升移动速度",
                cooldown: 8
            });
        }
        
        if (analysis.emphasizedStats.includes('firepower')) {
            abilities.push({
                name: "超级齐射",
                description: "发射高密度弹幕攻击",
                cooldown: 12
            });
        }
        
        return abilities;
    }

    displayGeneratedAircraft(aircraftData) {
        // Update UI elements
        document.getElementById('generatedName').textContent = aircraftData.name;
        document.getElementById('generatedDescription').textContent = aircraftData.description;
        document.getElementById('generatedSpeed').textContent = Math.round(aircraftData.stats.speed);
        document.getElementById('generatedFirepower').textContent = Math.round(aircraftData.stats.firepower);
        document.getElementById('generatedArmor').textContent = Math.round(aircraftData.stats.armor);

        // Draw aircraft preview
        this.drawGeneratedAircraft(aircraftData);

        // Show use button
        document.getElementById('useAiBtn').classList.remove('hidden');

        // Store generated data for later use
        this.lastGenerated = aircraftData;

        // Add some visual effects
        this.animateStatBars(aircraftData.stats);
    }

    drawGeneratedAircraft(aircraftData) {
        const canvas = document.getElementById('aiPreviewCanvas');
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw stars background
        this.drawStarsBackground(ctx, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Draw aircraft based on type and customizations
        this.drawCustomAircraft(ctx, centerX, centerY, aircraftData);

        // Add weapon effects
        this.drawWeaponEffects(ctx, centerX, centerY, aircraftData);
    }

    drawStarsBackground(ctx, width, height) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 2;
            ctx.fillRect(x, y, size, size);
        }
    }

    drawCustomAircraft(ctx, x, y, aircraftData) {
        ctx.save();
        ctx.translate(x, y);

        // Main body - vary size based on type
        const sizeMultiplier = this.getAircraftSizeMultiplier(aircraftData.type);
        const width = 30 * sizeMultiplier;
        const height = 40 * sizeMultiplier;

        // Main hull
        ctx.fillStyle = aircraftData.color;
        ctx.fillRect(-width / 2, -height / 2, width, height);

        // Cockpit
        ctx.fillStyle = this.lightenColor(aircraftData.color, 0.3);
        ctx.fillRect(-width / 4, -height / 2, width / 2, height / 4);

        // Wings - vary based on type
        this.drawWings(ctx, aircraftData.type, aircraftData.color, width, height);

        // Engine exhaust
        this.drawEngineEffects(ctx, aircraftData, width, height);

        // Special features
        if (aircraftData.specialAbilities.some(ability => ability.name.includes('隐形'))) {
            this.drawStealthEffects(ctx, width, height);
        }

        ctx.restore();
    }

    getAircraftSizeMultiplier(type) {
        const multipliers = {
            scout: 0.8,
            fighter: 1.0,
            interceptor: 1.1,
            bomber: 1.3
        };
        return multipliers[type] || 1.0;
    }

    drawWings(ctx, type, color, width, height) {
        ctx.fillStyle = color;
        
        switch (type) {
            case 'scout':
                // Thin, swept wings
                ctx.fillRect(-width / 2 - 8, height / 4, 16, 4);
                ctx.fillRect(width / 2 - 8, height / 4, 16, 4);
                break;
            case 'bomber':
                // Large, thick wings
                ctx.fillRect(-width / 2 - 15, height / 4, 25, 12);
                ctx.fillRect(width / 2 - 10, height / 4, 25, 12);
                break;
            case 'interceptor':
                // Angular wings
                ctx.beginPath();
                ctx.moveTo(-width / 2, height / 4);
                ctx.lineTo(-width / 2 - 12, height / 4 + 8);
                ctx.lineTo(-width / 2 - 8, height / 4 + 12);
                ctx.lineTo(-width / 2, height / 4 + 8);
                ctx.fill();
                
                ctx.beginPath();
                ctx.moveTo(width / 2, height / 4);
                ctx.lineTo(width / 2 + 12, height / 4 + 8);
                ctx.lineTo(width / 2 + 8, height / 4 + 12);
                ctx.lineTo(width / 2, height / 4 + 8);
                ctx.fill();
                break;
            default: // fighter
                // Standard wings
                ctx.fillRect(-width / 2 - 10, height / 4, 20, 8);
                ctx.fillRect(width / 2 - 10, height / 4, 20, 8);
        }
    }

    drawEngineEffects(ctx, aircraftData, width, height) {
        const speedStat = aircraftData.stats.speed;
        const flameIntensity = speedStat / 100;
        
        // Engine glow
        const gradient = ctx.createLinearGradient(0, height / 2, 0, height / 2 + 20);
        gradient.addColorStop(0, `rgba(0, 150, 255, ${flameIntensity})`);
        gradient.addColorStop(0.5, `rgba(100, 200, 255, ${flameIntensity * 0.7})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(-width / 4, height / 2, width / 2, 20);
    }

    drawStealthEffects(ctx, width, height) {
        // Add shimmer effect for stealth
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#88ccff';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, (width / 2 + i * 5), 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    drawWeaponEffects(ctx, x, y, aircraftData) {
        const weaponData = this.weaponTypes[aircraftData.weaponType];
        if (!weaponData) return;

        ctx.save();
        ctx.translate(x, y);

        // Draw weapon indicators
        ctx.fillStyle = weaponData.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = weaponData.color;

        // Different weapon visualizations
        switch (aircraftData.weaponType) {
            case 'laser':
                // Laser charging points
                ctx.fillRect(-8, -25, 3, 8);
                ctx.fillRect(5, -25, 3, 8);
                break;
            case 'missile':
                // Missile hardpoints
                ctx.fillRect(-12, -10, 6, 4);
                ctx.fillRect(6, -10, 6, 4);
                break;
            case 'plasma':
                // Plasma coils
                ctx.beginPath();
                ctx.arc(-10, -15, 3, 0, Math.PI * 2);
                ctx.arc(10, -15, 3, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'railgun':
                // Railgun barrel
                ctx.fillRect(-2, -30, 4, 15);
                break;
        }

        ctx.restore();
    }

    animateStatBars(stats) {
        // Animate the stat display with a smooth transition effect
        Object.keys(stats).forEach((statName, index) => {
            setTimeout(() => {
                const statElement = document.getElementById(`generated${statName.charAt(0).toUpperCase() + statName.slice(1)}`);
                if (statElement) {
                    let currentValue = 0;
                    const targetValue = Math.round(stats[statName]);
                    const increment = Math.ceil(targetValue / 20);
                    
                    const animate = () => {
                        currentValue = Math.min(currentValue + increment, targetValue);
                        statElement.textContent = currentValue;
                        
                        if (currentValue < targetValue) {
                            requestAnimationFrame(animate);
                        }
                    };
                    
                    animate();
                }
            }, index * 200);
        });
    }

    useGeneratedAircraft() {
        if (!this.lastGenerated) {
            this.showError('没有生成的飞行器可使用');
            return;
        }

        // Apply the generated aircraft to the game
        if (window.game) {
            window.game.customAircraft = this.lastGenerated;
            console.log('Applied AI generated aircraft:', this.lastGenerated);
        }

        alert(`已应用 ${this.lastGenerated.name}！\n特殊能力: ${this.lastGenerated.specialAbilities.map(ability => ability.name).join(', ') || '无'}`);
        
        // Return to main menu
        window.game.showMainMenu();
    }

    lightenColor(color, factor) {
        // Simple color lightening function
        const hex = color.replace('#', '');
        const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + Math.round(factor * 255));
        const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + Math.round(factor * 255));
        const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + Math.round(factor * 255));
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    setGeneratingState(isGenerating) {
        const button = document.getElementById('generateAiBtn');
        const useButton = document.getElementById('useAiBtn');
        
        if (isGenerating) {
            button.textContent = '正在生成...';
            button.disabled = true;
            useButton.classList.add('hidden');
        } else {
            button.textContent = '生成飞行器';
            button.disabled = false;
        }
    }

    showError(message) {
        alert(`错误: ${message}`);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize AI generator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aiGenerator = new AiGenerator();
});
