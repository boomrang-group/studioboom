
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle } from 'lucide-react';
import { type GenerateQuizOutput } from '@/ai/flows/generate-quiz';
import Confetti from 'react-confetti';


function QuizContent() {
    const searchParams = useSearchParams();
    const [quizData, setQuizData] = useState<GenerateQuizOutput | null>(null);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        const data = searchParams.get('data');
        if (data) {
            try {
                const decodedData = Buffer.from(decodeURIComponent(data), 'base64').toString('utf-8');
                setQuizData(JSON.parse(decodedData));
            } catch (error) {
                console.error("Failed to parse quiz data:", error);
            }
        }
    }, [searchParams]);

    const handleAnswerChange = (questionIndex: number, value: string) => {
        setUserAnswers(prev => ({ ...prev, [questionIndex]: value }));
    };

    const handleSubmit = () => {
        if (!quizData) return;
        let correctCount = 0;
        quizData.questions.forEach((q, i) => {
            if (userAnswers[i]?.toLowerCase().trim() === q.answer.toLowerCase().trim()) {
                correctCount++;
            }
        });
        setScore(correctCount);
        setSubmitted(true);
        if (correctCount === quizData.questions.length) {
            setShowConfetti(true);
        }
    };

    if (!quizData) {
        return <p>Chargement du quiz...</p>;
    }

    return (
        <div className="container mx-auto p-4 max-w-2xl">
             {showConfetti && <Confetti />}
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Quiz Interactif</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {quizData.questions.map((q, i) => (
                        <div key={i} className={`p-4 rounded-lg border ${submitted ? (userAnswers[i]?.toLowerCase().trim() === q.answer.toLowerCase().trim() ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'border-border'}`}>
                            <p className="font-semibold mb-3">{i + 1}. {q.question}</p>
                            
                            {q.options.length > 2 ? ( // Multiple Choice
                                 <RadioGroup onValueChange={(value) => handleAnswerChange(i, value)} disabled={submitted}>
                                    {q.options.map((option, j) => (
                                        <div key={j} className="flex items-center space-x-2">
                                            <RadioGroupItem value={option} id={`q${i}-opt${j}`} />
                                            <Label htmlFor={`q${i}-opt${j}`}>{option}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            ) : q.options.length === 2 ? ( // True/False
                                <RadioGroup onValueChange={(value) => handleAnswerChange(i, value)} disabled={submitted}>
                                    {q.options.map((option, j) => (
                                        <div key={j} className="flex items-center space-x-2">
                                            <RadioGroupItem value={option} id={`q${i}-opt${j}`} />
                                            <Label htmlFor={`q${i}-opt${j}`}>{option}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            ) : ( // Short Answer
                                <Input 
                                    placeholder="Votre réponse..." 
                                    onChange={(e) => handleAnswerChange(i, e.target.value)}
                                    disabled={submitted}
                                />
                            )}
                           
                            {submitted && (
                                <div className="mt-3 text-sm">
                                    {userAnswers[i]?.toLowerCase().trim() === q.answer.toLowerCase().trim() ? (
                                        <div className="flex items-center text-green-600">
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Correct !
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-red-600">
                                            <XCircle className="h-4 w-4 mr-1" />
                                            Incorrect. La bonne réponse est : <strong>{q.answer}</strong>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </CardContent>
                <CardFooter className="flex-col items-center gap-4">
                    {!submitted ? (
                        <Button onClick={handleSubmit} className="w-full">Valider mes réponses</Button>
                    ) : (
                         <div className="text-center p-4 bg-muted rounded-lg w-full">
                            <h3 className="text-xl font-bold">Résultats du Quiz</h3>
                            <p className="text-2xl mt-2">Votre score : {score} / {quizData.questions.length}</p>
                             <Button onClick={() => window.location.reload()} className="mt-4">
                                Recommencer le quiz
                            </Button>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}

export default function QuizPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <QuizContent />
        </Suspense>
    )
}
