import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/Tabs";
import { Card, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Progress } from "./ui/Progress";
import { CheckCircle, Sword, RefreshCw, BookOpen, Clock, Target, Trophy, Zap, Shield, Star, Flame, Heart } from "lucide-react";

// Motor verileri
const motors = [
  { name: "Yuki Taro GP2", img: "https://images.pexels.com/photos/358278/pexels-photo-358278.jpeg" },
  { name: "BMW S1000RR", img: "https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg" },
  { name: "Honda CBR1000RR-R", img: "https://images.pexels.com/photos/2116469/pexels-photo-2116469.jpeg" },
  { name: "Kawasaki H2R", img: "https://images.pexels.com/photos/2116456/pexels-photo-2116456.jpeg" },
  { name: "Drift L", img: "https://images.pexels.com/photos/2116450/pexels-photo-2116450.jpeg" }
];

// Boss verileri
const bosses = [
  { name: "Ejderha", img: "https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg" },
  { name: "Robot", img: "https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg" },
  { name: "Canavar", img: "https://images.pexels.com/photos/6256065/pexels-photo-6256065.jpeg" },
  { name: "Motor Şeytanı", img: "https://images.pexels.com/photos/8101533/pexels-photo-8101533.jpeg" }
];

// Genişletilmiş skill sistemi
const skills = [
  { 
    id: 1, 
    name: "XP Ustası", 
    desc: "Tüm XP kazancını arttırır", 
    icon: <CheckCircle className="w-5 h-5" />, 
    effect: "xpBoost",
    maxLevel: 10,
    bonusPerLevel: 5 // Her seviye %5 bonus
  },
  { 
    id: 2, 
    name: "Boss Avcısı", 
    desc: "Boss'lara verilen hasarı arttırır", 
    icon: <Sword className="w-5 h-5" />, 
    effect: "bossDamage",
    maxLevel: 8,
    bonusPerLevel: 8 // Her seviye %8 bonus
  },
  { 
    id: 3, 
    name: "Görev Yenileyici", 
    desc: "Günlük görev yenileme hakkı", 
    icon: <RefreshCw className="w-5 h-5" />, 
    effect: "reroll",
    maxLevel: 5,
    bonusPerLevel: 1 // Her seviye +1 yenileme hakkı
  },
  { 
    id: 4, 
    name: "Video Uzmanı", 
    desc: "Video izlerken ekstra XP", 
    icon: <BookOpen className="w-5 h-5" />, 
    effect: "videoBoost",
    maxLevel: 7,
    bonusPerLevel: 10 // Her seviye %10 bonus
  },
  { 
    id: 5, 
    name: "Zaman Efendisi", 
    desc: "Ders süresinden ekstra XP", 
    icon: <Clock className="w-5 h-5" />, 
    effect: "timeBoost",
    maxLevel: 7,
    bonusPerLevel: 10 // Her seviye %10 bonus
  },
  { 
    id: 6, 
    name: "Görev Şampiyonu", 
    desc: "Görevlerden ekstra XP", 
    icon: <Target className="w-5 h-5" />, 
    effect: "questBoost",
    maxLevel: 6,
    bonusPerLevel: 12 // Her seviye %12 bonus
  },
  { 
    id: 7, 
    name: "Soru Dehası", 
    desc: "Sorulardan ekstra XP", 
    icon: <Star className="w-5 h-5" />, 
    effect: "questionBoost",
    maxLevel: 8,
    bonusPerLevel: 8 // Her seviye %8 bonus
  },
  { 
    id: 8, 
    name: "Kalkan Ustası", 
    desc: "Boss saldırılarından korunma", 
    icon: <Shield className="w-5 h-5" />, 
    effect: "defense",
    maxLevel: 5,
    bonusPerLevel: 15 // Her seviye %15 savunma
  },
  { 
    id: 9, 
    name: "Ateş Gücü", 
    desc: "Kritik hasar şansı", 
    icon: <Flame className="w-5 h-5" />, 
    effect: "criticalHit",
    maxLevel: 6,
    bonusPerLevel: 10 // Her seviye %10 kritik şansı
  },
  { 
    id: 10, 
    name: "Yaşam Gücü", 
    desc: "Maksimum HP arttırır", 
    icon: <Heart className="w-5 h-5" />, 
    effect: "healthBoost",
    maxLevel: 5,
    bonusPerLevel: 20 // Her seviye +20 HP
  }
];

export default function StudyQuest() {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [skillPoints, setSkillPoints] = useState(5); // Başlangıç için biraz skill point
  const [questions, setQuestions] = useState(0);
  const [videos, setVideos] = useState(0);
  const [studyTime, setStudyTime] = useState(0);
  const [motorIndex, setMotorIndex] = useState(0);
  const [motorCollection, setMotorCollection] = useState<typeof motors>([]);
  const [boss, setBoss] = useState<typeof bosses[0] | null>(null);
  const [bossHp, setBossHp] = useState(0);
  const [bossMaxHp, setBossMaxHp] = useState(0);
  const [dailyTasks, setDailyTasks] = useState<Array<{text: string, reward: number, completed: boolean}>>([]);
  const [weeklyTasks, setWeeklyTasks] = useState<Array<{text: string, reward: number, completed: boolean}>>([]);
  const [rerollsAvailable, setRerollsAvailable] = useState(1);
  const [skillLevels, setSkillLevels] = useState<{[key: string]: number}>({});
  
  // Timer states
  const [dailyResetTime, setDailyResetTime] = useState<Date>(new Date());
  const [weeklyResetTime, setWeeklyResetTime] = useState<Date>(new Date());
  const [dailyTimeLeft, setDailyTimeLeft] = useState("");
  const [weeklyTimeLeft, setWeeklyTimeLeft] = useState("");

  // XP seviyeleri
  const xpNeeded = level === 1 ? 100 : level === 2 ? 150 : 250;

  // Görev havuzu
  const taskPool = [
    { text: "10 soru çöz", reward: 30 },
    { text: "20 soru çöz", reward: 60 },
    { text: "15 dk video izle", reward: 15 },
    { text: "30 dk ders çalış", reward: 90 },
    { text: "Bir ders tekrar et", reward: 50 },
    { text: "30 dk telefonsuz kal", reward: 40 },
    { text: "Deftere konu özetle", reward: 80 },
    { text: "5 soru çöz", reward: 15 },
    { text: "45 dk ders çalış", reward: 135 },
    { text: "Özet çıkar", reward: 70 }
  ];

  const weeklyPool = [
    { text: "200 soru çöz", reward: 600 },
    { text: "3 saat video izle", reward: 180 },
    { text: "6 gün günlük görevleri tamamla", reward: 500 },
    { text: "7 gün boyunca 20 dk çalış", reward: 350 },
    { text: "150 soru çöz", reward: 450 },
    { text: "5 saat ders çalış", reward: 900 }
  ];

  // Timer hesaplama fonksiyonu
  const calculateTimeLeft = (targetDate: Date) => {
    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();
    
    if (difference <= 0) return "00:00:00";
    
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Timer güncelleme
  useEffect(() => {
    const timer = setInterval(() => {
      const dailyLeft = calculateTimeLeft(dailyResetTime);
      const weeklyLeft = calculateTimeLeft(weeklyResetTime);
      
      setDailyTimeLeft(dailyLeft);
      setWeeklyTimeLeft(weeklyLeft);
      
      // Reset kontrolü
      if (dailyLeft === "00:00:00") {
        generateDailyTasks();
        const nextReset = new Date();
        nextReset.setDate(nextReset.getDate() + 1);
        nextReset.setHours(0, 0, 0, 0);
        setDailyResetTime(nextReset);
      }
      
      if (weeklyLeft === "00:00:00") {
        generateWeeklyTasks();
        const nextReset = new Date();
        nextReset.setDate(nextReset.getDate() + 7);
        nextReset.setHours(0, 0, 0, 0);
        setWeeklyResetTime(nextReset);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [dailyResetTime, weeklyResetTime]);

  // İlk yükleme
  useEffect(() => {
    resetBoss();
    generateDailyTasks();
    generateWeeklyTasks();
    
    // Reset zamanlarını ayarla
    const nextDaily = new Date();
    nextDaily.setDate(nextDaily.getDate() + 1);
    nextDaily.setHours(0, 0, 0, 0);
    setDailyResetTime(nextDaily);
    
    const nextWeekly = new Date();
    nextWeekly.setDate(nextWeekly.getDate() + 7);
    nextWeekly.setHours(0, 0, 0, 0);
    setWeeklyResetTime(nextWeekly);
  }, []);

  const resetBoss = () => {
    const newBoss = bosses[Math.floor(Math.random() * bosses.length)];
    const hp = Math.floor(Math.random() * 5000) + 3000;
    setBoss(newBoss);
    setBossHp(hp);
    setBossMaxHp(hp);
  };

  const generateDailyTasks = () => {
    let shuffled = [...taskPool].sort(() => 0.5 - Math.random());
    const tasks = shuffled.slice(0, 3).map(task => ({ ...task, completed: false }));
    setDailyTasks(tasks);
    
    // Reroll hakkını yenile
    const rerollSkillLevel = skillLevels["reroll"] || 0;
    setRerollsAvailable(1 + rerollSkillLevel);
  };

  const generateWeeklyTasks = () => {
    let shuffled = [...weeklyPool].sort(() => 0.5 - Math.random());
    const tasks = shuffled.slice(0, 2).map(task => ({ ...task, completed: false }));
    setWeeklyTasks(tasks);
  };

  const completeTask = (taskIndex: number, reward: number, isWeekly: boolean = false) => {
    const tasks = isWeekly ? weeklyTasks : dailyTasks;
    const task = tasks[taskIndex];
    
    if (task.completed) return; // Zaten tamamlanmış
    
    // Skill bonusları
    let bonus = 0;
    const questBoostLevel = skillLevels["questBoost"] || 0;
    if (questBoostLevel > 0) {
      bonus += reward * (questBoostLevel * 0.12); // Her seviye %12 bonus
    }
    
    const totalReward = reward + bonus;
    setXp(prev => prev + totalReward);
    damageBoss(totalReward);
    
    // Görevi tamamlanmış olarak işaretle
    if (isWeekly) {
      const updatedTasks = [...weeklyTasks];
      updatedTasks[taskIndex].completed = true;
      setWeeklyTasks(updatedTasks);
    } else {
      const updatedTasks = [...dailyTasks];
      updatedTasks[taskIndex].completed = true;
      setDailyTasks(updatedTasks);
    }
  };

  const rerollTask = (index: number) => {
    if (rerollsAvailable <= 0) return;
    
    let newTask = taskPool[Math.floor(Math.random() * taskPool.length)];
    let updated = [...dailyTasks];
    updated[index] = { ...newTask, completed: false };
    setDailyTasks(updated);
    setRerollsAvailable(prev => prev - 1);
  };

  const damageBoss = (earnedXp: number) => {
    let damage = earnedXp * 2;
    
    // Boss damage skill bonusu
    const bossDamageLevel = skillLevels["bossDamage"] || 0;
    if (bossDamageLevel > 0) {
      damage *= (1 + (bossDamageLevel * 0.08)); // Her seviye %8 bonus
    }
    
    // Kritik hasar şansı
    const criticalLevel = skillLevels["criticalHit"] || 0;
    if (criticalLevel > 0) {
      const critChance = criticalLevel * 0.1; // Her seviye %10 şans
      if (Math.random() < critChance) {
        damage *= 2; // Kritik hasar 2x
      }
    }
    
    setBossHp((prev) => Math.max(0, prev - damage));
  };

  useEffect(() => {
    if (xp >= xpNeeded) {
      setXp(prev => prev - xpNeeded);
      setLevel(prev => prev + 1);
      setSkillPoints(prev => prev + 1);
      
      // Motor parçası kazanma
      if ((level + 1) % 10 === 0) {
        let newCollection = [...motorCollection, motors[motorIndex]];
        setMotorCollection(newCollection);
        
        if (motorIndex < motors.length - 1) {
          setMotorIndex(prev => prev + 1);
        }
      }
      
      // Boss öldüyse yeni boss
      if (bossHp === 0) {
        resetBoss();
      }
    }
  }, [xp, xpNeeded, level, motorCollection, motorIndex, bossHp]);

  const handleStudySubmit = () => {
    let earnedXp = 0;
    
    // Soru XP hesaplama
    let questionXp = questions * 3;
    const questionBoostLevel = skillLevels["questionBoost"] || 0;
    if (questionBoostLevel > 0) {
      questionXp *= (1 + (questionBoostLevel * 0.08)); // Her seviye %8 bonus
    }
    
    // Video XP hesaplama
    let videoXp = videos * 1;
    const videoBoostLevel = skillLevels["videoBoost"] || 0;
    if (videoBoostLevel > 0) {
      videoXp *= (1 + (videoBoostLevel * 0.1)); // Her seviye %10 bonus
    }
    
    // Ders süresi XP hesaplama
    let timeXp = studyTime * 3;
    const timeBoostLevel = skillLevels["timeBoost"] || 0;
    if (timeBoostLevel > 0) {
      timeXp *= (1 + (timeBoostLevel * 0.1)); // Her seviye %10 bonus
    }
    
    earnedXp = questionXp + videoXp + timeXp;
    
    // Genel XP boost
    const xpBoostLevel = skillLevels["xpBoost"] || 0;
    if (xpBoostLevel > 0) {
      earnedXp *= (1 + (xpBoostLevel * 0.05)); // Her seviye %5 bonus
    }
    
    setXp(prev => prev + earnedXp);
    damageBoss(earnedXp);
    setQuestions(0);
    setVideos(0);
    setStudyTime(0);
  };

  const upgradeSkill = (skill: typeof skills[0]) => {
    if (skillPoints <= 0) return;
    
    const currentLevel = skillLevels[skill.effect] || 0;
    if (currentLevel >= skill.maxLevel) return;
    
    setSkillLevels(prev => ({
      ...prev,
      [skill.effect]: currentLevel + 1
    }));
    setSkillPoints(prev => prev - 1);
  };

  const getSkillDescription = (skill: typeof skills[0]) => {
    const currentLevel = skillLevels[skill.effect] || 0;
    const bonus = currentLevel * skill.bonusPerLevel;
    
    if (currentLevel === 0) {
      return skill.desc;
    }
    
    switch (skill.effect) {
      case "reroll":
        return `${skill.desc} (Şu an: ${1 + bonus} hak)`;
      case "defense":
      case "criticalHit":
        return `${skill.desc} (Şu an: %${bonus})`;
      case "healthBoost":
        return `${skill.desc} (Şu an: +${bonus} HP)`;
      default:
        return `${skill.desc} (Şu an: %${bonus} bonus)`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              StudyQuest RPG
            </h1>
            <Trophy className="w-8 h-8 text-yellow-400" />
          </div>
          
          <div className="flex items-center justify-center gap-6 text-lg">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <span>Level {level}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span>XP: {Math.floor(xp)}/{xpNeeded}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              <span>Skill Points: {skillPoints}</span>
            </div>
          </div>
          
          <div className="mt-4 max-w-md mx-auto">
            <Progress value={(xp / xpNeeded) * 100} />
          </div>
        </div>

        <Tabs defaultValue="tasks">
          <TabsList className="grid grid-cols-5 max-w-2xl mx-auto">
            <TabsTrigger value="tasks">Görevler</TabsTrigger>
            <TabsTrigger value="xp">XP Girişi</TabsTrigger>
            <TabsTrigger value="boss">Boss</TabsTrigger>
            <TabsTrigger value="skills">Skill Points</TabsTrigger>
            <TabsTrigger value="motors">Motor Garaj</TabsTrigger>
          </TabsList>

          {/* Görevler */}
          <TabsContent value="tasks">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  🎯 Günlük Görevler
                  <span className="text-sm font-normal text-white/70">(3 görev)</span>
                </h2>
                <div className="text-right">
                  <div className="text-sm text-white/70">Yenileme:</div>
                  <div className="font-mono text-lg text-yellow-400">{dailyTimeLeft}</div>
                </div>
              </div>
              
              <div className="grid gap-4 mb-8">
                {dailyTasks.map((task, i) => (
                  <Card key={i} className={`hover:scale-102 transition-transform ${task.completed ? 'opacity-50' : ''}`}>
                    <CardContent className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-green-400' : 'bg-blue-400'}`}></div>
                        <span className={`font-medium ${task.completed ? 'line-through' : ''}`}>{task.text}</span>
                        <span className="text-green-400 font-semibold">+{task.reward} XP</span>
                        {task.completed && <span className="text-green-400 text-sm">✓ Tamamlandı</span>}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => completeTask(i, task.reward)} 
                          disabled={task.completed}
                        >
                          {task.completed ? 'Tamamlandı' : 'Tamamla'}
                        </Button>
                        {rerollsAvailable > 0 && !task.completed && (
                          <Button variant="outline" onClick={() => rerollTask(i)}>
                            🎲 Yenile ({rerollsAvailable})
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  📅 Haftalık Görevler
                  <span className="text-sm font-normal text-white/70">(2 görev)</span>
                </h2>
                <div className="text-right">
                  <div className="text-sm text-white/70">Yenileme:</div>
                  <div className="font-mono text-lg text-purple-400">{weeklyTimeLeft}</div>
                </div>
              </div>
              
              <div className="grid gap-4">
                {weeklyTasks.map((task, i) => (
                  <Card key={i} className={`border-l-4 border-l-purple-500 hover:scale-102 transition-transform ${task.completed ? 'opacity-50' : ''}`}>
                    <CardContent className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${task.completed ? 'bg-green-400' : 'bg-purple-400'}`}></div>
                        <span className={`font-medium ${task.completed ? 'line-through' : ''}`}>{task.text}</span>
                        <span className="text-yellow-400 font-semibold">+{task.reward} XP</span>
                        {task.completed && <span className="text-green-400 text-sm">✓ Tamamlandı</span>}
                      </div>
                      <Button 
                        onClick={() => completeTask(i, task.reward, true)}
                        disabled={task.completed}
                      >
                        {task.completed ? 'Tamamlandı' : 'Tamamla'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* XP Girişi */}
          <TabsContent value="xp">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardContent>
                  <h2 className="text-2xl font-bold mb-6 text-center">📖 Çalışma Aktivitelerini Ekle</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-lg font-medium mb-2">Soru Sayısı</label>
                      <input 
                        type="number" 
                        value={questions} 
                        onChange={(e) => setQuestions(Number(e.target.value))} 
                        className="w-full p-3 text-black rounded-xl border-2 border-white/20 focus:border-purple-400 focus:outline-none" 
                        placeholder="Kaç soru çözdün?"
                      />
                      <p className="text-sm text-white/70 mt-1">Her soru = 3 XP</p>
                    </div>
                    
                    <div>
                      <label className="block text-lg font-medium mb-2">Video İzleme (dakika)</label>
                      <input 
                        type="number" 
                        value={videos} 
                        onChange={(e) => setVideos(Number(e.target.value))} 
                        className="w-full p-3 text-black rounded-xl border-2 border-white/20 focus:border-purple-400 focus:outline-none" 
                        placeholder="Kaç dakika video izledin?"
                      />
                      <p className="text-sm text-white/70 mt-1">Her dakika = 1 XP</p>
                    </div>
                    
                    <div>
                      <label className="block text-lg font-medium mb-2">Ders Çalışma (dakika)</label>
                      <input 
                        type="number" 
                        value={studyTime} 
                        onChange={(e) => setStudyTime(Number(e.target.value))} 
                        className="w-full p-3 text-black rounded-xl border-2 border-white/20 focus:border-purple-400 focus:outline-none" 
                        placeholder="Kaç dakika ders çalıştın?"
                      />
                      <p className="text-sm text-white/70 mt-1">Her dakika = 3 XP</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <div className="mb-4 p-4 bg-white/10 rounded-xl">
                      <p className="text-lg">
                        Toplam XP: <span className="font-bold text-green-400">
                          {questions * 3 + videos * 1 + studyTime * 3}
                        </span>
                      </p>
                    </div>
                    <Button onClick={handleStudySubmit} className="w-full text-lg py-3">
                      🎯 XP Kazan!
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Boss */}
          <TabsContent value="boss">
            <div className="max-w-2xl mx-auto text-center">
              {boss && (
                <Card>
                  <CardContent>
                    <h2 className="text-3xl font-bold mb-6 flex items-center justify-center gap-2">
                      🐲 {boss.name}
                    </h2>
                    <div className="mb-6">
                      <img 
                        src={boss.img} 
                        alt={boss.name} 
                        className="w-64 h-48 mx-auto rounded-2xl shadow-2xl object-cover hover:scale-105 transition-transform" 
                      />
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-white/70">Boss HP</span>
                        <span className="font-mono">{Math.floor(bossHp)}/{bossMaxHp}</span>
                      </div>
                      <Progress value={(bossHp / bossMaxHp) * 100} />
                    </div>
                    
                    {bossHp === 0 ? (
                      <div className="p-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl">
                        <p className="text-2xl font-bold mb-2">🎉 Boss Yenildi!</p>
                        <p className="text-lg">Ödül XP: <span className="font-bold">{Math.floor(bossMaxHp / 10)}</span></p>
                        <Button onClick={resetBoss} className="mt-4">
                          Yeni Boss Çağır
                        </Button>
                      </div>
                    ) : (
                      <div className="p-4 bg-white/10 rounded-2xl">
                        <p className="text-lg mb-2">XP kazanarak boss'a hasar ver!</p>
                        <p className="text-sm text-white/70">Her XP = 2 hasar</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Skill Points */}
          <TabsContent value="skills">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">🌟 Skill Points</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {skills.map((skill) => {
                  const currentLevel = skillLevels[skill.effect] || 0;
                  const isMaxLevel = currentLevel >= skill.maxLevel;
                  
                  return (
                    <Card 
                      key={skill.id} 
                      className={`hover:scale-105 transition-all ${
                        currentLevel > 0 ? "border-2 border-green-400 bg-green-400/10" : ""
                      }`}
                    >
                      <CardContent className="text-center">
                        <div className="flex items-center justify-center mb-3">
                          <div className="p-3 bg-white/10 rounded-full">
                            {skill.icon}
                          </div>
                        </div>
                        <h3 className="font-bold text-lg mb-2">{skill.name}</h3>
                        <p className="text-white/70 text-sm mb-2">{getSkillDescription(skill)}</p>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-white/70 mb-1">
                            <span>Level {currentLevel}</span>
                            <span>{currentLevel}/{skill.maxLevel}</span>
                          </div>
                          <Progress value={(currentLevel / skill.maxLevel) * 100} />
                        </div>
                        
                        {isMaxLevel ? (
                          <div className="p-2 bg-yellow-400/20 rounded-xl text-yellow-400 font-semibold">
                            ⭐ MAX LEVEL
                          </div>
                        ) : currentLevel > 0 ? (
                          <Button 
                            onClick={() => upgradeSkill(skill)} 
                            disabled={skillPoints <= 0}
                            className="w-full"
                          >
                            Upgrade (1 SP)
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => upgradeSkill(skill)} 
                            disabled={skillPoints <= 0}
                            className="w-full"
                          >
                            Unlock (1 SP)
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Motor Kütüphanesi */}
          <TabsContent value="motors">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">🏍 Motor Garajı</h2>
              
              {motorCollection.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <div className="text-6xl mb-4">🏍</div>
                    <h3 className="text-2xl font-bold mb-2">Garajın Boş!</h3>
                    <p className="text-white/70 text-lg">
                      Her 10 seviyede bir motor kazanırsın. 
                      <br />
                      Çalışmaya devam et ve koleksiyonunu büyüt!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {motorCollection.map((motor, i) => (
                    <Card key={i} className="hover:scale-105 transition-transform">
                      <CardContent>
                        <img 
                          src={motor.img} 
                          alt={motor.name} 
                          className="w-full h-48 rounded-xl mb-4 object-cover shadow-lg" 
                        />
                        <h3 className="text-xl font-bold text-center">{motor.name}</h3>
                        <div className="flex justify-center mt-2">
                          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                            Level {(i + 1) * 10}'da Kazanıldı
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              <div className="mt-8 text-center">
                <p className="text-white/70">
                  Toplam Motor: <span className="font-bold text-white">{motorCollection.length}</span> / {motors.length}
                </p>
                <div className="mt-2">
                  <Progress value={(motorCollection.length / motors.length) * 100} />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}