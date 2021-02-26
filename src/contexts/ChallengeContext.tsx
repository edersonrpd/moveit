import Cookies from 'js-cookie';
import { createContext, ReactNode, useEffect, useState } from 'react';
import challenges from '../../challenges.json';
import { LevelUpModal } from '../components/LevelUpModal';

interface Challenge {
    type: 'body' | 'eye';
    description: string;
    amount: number;
}

interface ChallengeContextData {
    level: number;
    currentExperience: number;
    challengesCompleted: number;
    experienceToNextLevel: number;

    levelUp: () => void;
    startNewChallenge: () => void;
    activeChallenge: Challenge;
    resetChallenge: () => void;

    completeChallenge: () => void;
    closeLevelUpModal: () => void;
}

interface ChallengesProviderProps {
    children: ReactNode;
    level: number;
    currentExperience: number;
    challengesCompleted: number;
}

export const ChallengesContext = createContext({} as ChallengeContextData);

export function ChallengesProvider({
    children,
    ...rest
}: ChallengesProviderProps) {
    const [level, setLevel] = useState(rest.level ?? 1);
    const [currentExperience, setCurrentExperience] = useState(
        rest.currentExperience ?? 0
    );
    const [challengesCompleted, setChallengesCompleted] = useState(
        rest.challengesCompleted ?? 0
    );

    const [activeChallenge, setActiveChallenge] = useState(null);
    const [isLevelUpModalOPen, setIsLevelUpModalOPen] = useState(false);

    const experienceToNextLevel = Math.pow((level + 1) * 4, 2);

    useEffect(() => {
        Notification.requestPermission();
    }, []);

    useEffect(() => {
        Cookies.set('level', String(level));
        Cookies.set('currentExperience', String(currentExperience));
        Cookies.set('challengesCompleted', String(challengesCompleted));
    }, [level, currentExperience, challengesCompleted]);

    function levelUp() {
        setLevel(level + 1);
        setIsLevelUpModalOPen(true);
    }

    function closeLevelUpModal() {
        setIsLevelUpModalOPen(false);
    }

    function startNewChallenge() {
        const random = Math.floor(Math.random() * challenges.length);
        const challenge = challenges[random];

        setActiveChallenge(challenge);

        new Audio('/notification.mp3').play();

        if (Notification.permission === 'granted') {
            new Notification('Novo desafio 🎉', {
                body: `Valendo ${challenge.amount}xp`,
            });
        }
    }

    function resetChallenge() {
        setActiveChallenge(null);
    }

    function completeChallenge() {
        if (!activeChallenge) {
            return;
        }
        const { amount } = activeChallenge;

        let finalExperiencie = currentExperience + amount;

        if (finalExperiencie >= experienceToNextLevel) {
            finalExperiencie = finalExperiencie - experienceToNextLevel;
            levelUp();
        }
        setCurrentExperience(finalExperiencie);
        setActiveChallenge(null);
        setChallengesCompleted(challengesCompleted + 1);
    }

    return (
        <ChallengesContext.Provider
            value={{
                level,
                currentExperience,
                experienceToNextLevel,
                challengesCompleted,
                levelUp,
                startNewChallenge,
                activeChallenge,
                resetChallenge,
                completeChallenge,
                closeLevelUpModal,
            }}
        >
            {children}
            {isLevelUpModalOPen && <LevelUpModal />}
        </ChallengesContext.Provider>
    );
}
