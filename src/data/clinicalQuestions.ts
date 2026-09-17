import { ClinicalQuestion } from '../types/waypoint';

/**
 * Validated Clinical Tool Questions and Trauma-Informed Phrasing
 * All questions are presented in accessible, non-judgmental language.
 */

// ==========================================
// 1. CRAFFT (Youth Substance Screener - Under 18)
// ==========================================
export const CRAFFT_QUESTIONS: ClinicalQuestion[] = [
  {
    id: 'crafft_1',
    tool: 'CRAFFT',
    question: 'Have you ever ridden in a Car driven by someone (including yourself) who was high or using alcohol or drugs?',
    subtext: 'Your honest answers remain 100% private on your phone. We use this to ensure your safety tools are ready.',
    options: [
      { label: 'No, never', points: 0 },
      { label: 'Yes, once or twice', points: 1 },
      { label: 'Yes, regularly', points: 2 },
    ],
  },
  {
    id: 'crafft_2',
    tool: 'CRAFFT',
    question: 'Do you ever use alcohol or drugs to Relax, feel better about yourself, or fit in?',
    subtext: 'It is natural to look for ways to unwind; we want to explore what helps you feel grounded.',
    options: [
      { label: 'No, never', points: 0 },
      { label: 'Sometimes', points: 1 },
      { label: 'Often', points: 2 },
    ],
  },
  {
    id: 'crafft_3',
    tool: 'CRAFFT',
    question: 'Do you ever use alcohol or drugs while you are by yourself (Alone)?',
    subtext: 'Using substances when alone can suggest you might be carrying a heavy emotional load.',
    options: [
      { label: 'Never', points: 0 },
      { label: 'Occasionally', points: 1 },
      { label: 'Frequently', points: 2 },
    ],
  },
  {
    id: 'crafft_4',
    tool: 'CRAFFT',
    question: 'Do you ever Forget things you did while using alcohol or substances?',
    subtext: 'Memory lapses or blackouts are biological warning signs that your body needs a break.',
    options: [
      { label: 'Never', points: 0 },
      { label: 'Once or twice', points: 1 },
      { label: 'Several times', points: 2 },
    ],
  },
  {
    id: 'crafft_5',
    tool: 'CRAFFT',
    question: 'Do your Family or Friends ever tell you that you should cut down on your use?',
    subtext: 'Feedback from people around you can highlight blind spots without meaning you are in trouble.',
    options: [
      { label: 'No', points: 0 },
      { label: 'Once or twice', points: 1 },
      { label: 'Yes, regularly', points: 2 },
    ],
  },
  {
    id: 'crafft_6',
    tool: 'CRAFFT',
    question: 'Have you ever gotten into Trouble while you were using alcohol or drugs?',
    subtext: 'This includes school issues, arguments, or accidental physical scrapes.',
    options: [
      { label: 'Never', points: 0 },
      { label: 'Once', points: 1 },
      { label: 'More than once', points: 2 },
    ],
  },
];

// ==========================================
// 2. WEMWBS (Warwick-Edinburgh Mental Wellbeing Scale - Short Form)
// ==========================================
export const WEMWBS_QUESTIONS: ClinicalQuestion[] = [
  {
    id: 'wemwbs_1',
    tool: 'WEMWBS',
    question: 'I’ve been feeling optimistic about the future',
    subtext: 'Over the last two weeks, thinking about your daily mood.',
    options: [
      { label: 'None of the time', points: 1 },
      { label: 'Rarely', points: 2 },
      { label: 'Some of the time', points: 3 },
      { label: 'Often', points: 4 },
      { label: 'All of the time', points: 5 },
    ],
  },
  {
    id: 'wemwbs_2',
    tool: 'WEMWBS',
    question: 'I’ve been feeling useful and purposeful',
    subtext: 'Whether in school, work, hobbies, or supporting others.',
    options: [
      { label: 'None of the time', points: 1 },
      { label: 'Rarely', points: 2 },
      { label: 'Some of the time', points: 3 },
      { label: 'Often', points: 4 },
      { label: 'All of the time', points: 5 },
    ],
  },
  {
    id: 'wemwbs_3',
    tool: 'WEMWBS',
    question: 'I’ve been feeling relaxed and calm',
    subtext: 'Having moments where your mind and body can let down their guard.',
    options: [
      { label: 'None of the time', points: 1 },
      { label: 'Rarely', points: 2 },
      { label: 'Some of the time', points: 3 },
      { label: 'Often', points: 4 },
      { label: 'All of the time', points: 5 },
    ],
  },
  {
    id: 'wemwbs_4',
    tool: 'WEMWBS',
    question: 'I’ve been dealing with problems well',
    subtext: 'When obstacles come up, feeling able to find a step forward.',
    options: [
      { label: 'None of the time', points: 1 },
      { label: 'Rarely', points: 2 },
      { label: 'Some of the time', points: 3 },
      { label: 'Often', points: 4 },
      { label: 'All of the time', points: 5 },
    ],
  },
  {
    id: 'wemwbs_5',
    tool: 'WEMWBS',
    question: 'I’ve been feeling close to other people',
    subtext: 'Sense of connection to friends, mentors, or family members.',
    options: [
      { label: 'None of the time', points: 1 },
      { label: 'Rarely', points: 2 },
      { label: 'Some of the time', points: 3 },
      { label: 'Often', points: 4 },
      { label: 'All of the time', points: 5 },
    ],
  },
];

// ==========================================
// 3. AUDIT (Alcohol Use Disorders Identification Test - 18+)
// Complete 10-question validated clinical instrument
// ==========================================
export const AUDIT_QUESTIONS: ClinicalQuestion[] = [
  {
    id: 'audit_1',
    tool: 'AUDIT',
    question: 'How often do you have a drink containing alcohol?',
    subtext: 'Standard units help calibrate your recovery track without judgment.',
    options: [
      { label: 'Never', points: 0 },
      { label: 'Monthly or less', points: 1 },
      { label: '2 to 4 times a month', points: 2 },
      { label: '2 to 3 times a week', points: 3 },
      { label: '4 or more times a week', points: 4 },
    ],
  },
  {
    id: 'audit_2',
    tool: 'AUDIT',
    question: 'How many standard drinks do you have on a typical day when you are drinking?',
    subtext: '1 drink = half pint of beer (4%), small glass of wine (12%), or single measure spirits (25ml).',
    options: [
      { label: '1 or 2', points: 0 },
      { label: '3 or 4', points: 1 },
      { label: '5 or 6', points: 2 },
      { label: '7 to 9', points: 3 },
      { label: '10 or more', points: 4 },
    ],
  },
  {
    id: 'audit_3',
    tool: 'AUDIT',
    question: 'How often do you have six or more standard drinks on one occasion?',
    subtext: 'This measures episodic heavy intake which strains liver enzymes and cognitive stability.',
    options: [
      { label: 'Never', points: 0 },
      { label: 'Less than monthly', points: 1 },
      { label: 'Monthly', points: 2 },
      { label: 'Weekly', points: 3 },
      { label: 'Daily or almost daily', points: 4 },
    ],
  },
  {
    id: 'audit_4',
    tool: 'AUDIT',
    question: 'How often in the last year have you found you could not stop drinking once you had started?',
    subtext: 'Loss of control during a session is a physiological response, not a moral failure.',
    options: [
      { label: 'Never', points: 0 },
      { label: 'Less than monthly', points: 1 },
      { label: 'Monthly', points: 2 },
      { label: 'Weekly', points: 3 },
      { label: 'Daily or almost daily', points: 4 },
    ],
  },
  {
    id: 'audit_5',
    tool: 'AUDIT',
    question: 'How often during the last year have you failed to do what was expected of you because of drinking?',
    subtext: 'Work tasks, family commitments, or self-care routines missed.',
    options: [
      { label: 'Never', points: 0 },
      { label: 'Less than monthly', points: 1 },
      { label: 'Monthly', points: 2 },
      { label: 'Weekly', points: 3 },
      { label: 'Daily or almost daily', points: 4 },
    ],
  },
  {
    id: 'audit_6',
    tool: 'AUDIT',
    question: 'How often in the last year have you needed a first drink in the morning to get yourself going?',
    subtext: 'Morning drinking to settle nerves or stop trembling indicates physical neuroadaptation.',
    options: [
      { label: 'Never', points: 0 },
      { label: 'Less than monthly', points: 1 },
      { label: 'Monthly', points: 2 },
      { label: 'Weekly', points: 3 },
      { label: 'Daily or almost daily', points: 4 },
    ],
  },
  {
    id: 'audit_7',
    tool: 'AUDIT',
    question: 'How often during the last year have you had a feeling of guilt or remorse after drinking?',
    subtext: 'Emotional hangovers and self-criticism often drive secondary cravings.',
    options: [
      { label: 'Never', points: 0 },
      { label: 'Less than monthly', points: 1 },
      { label: 'Monthly', points: 2 },
      { label: 'Weekly', points: 3 },
      { label: 'Daily or almost daily', points: 4 },
    ],
  },
  {
    id: 'audit_8',
    tool: 'AUDIT',
    question: 'How often during the last year have you been unable to remember what happened the night before?',
    subtext: 'Alcohol-induced amnesia occurs when the hippocampus stops encoding memories.',
    options: [
      { label: 'Never', points: 0 },
      { label: 'Less than monthly', points: 1 },
      { label: 'Monthly', points: 2 },
      { label: 'Weekly', points: 3 },
      { label: 'Daily or almost daily', points: 4 },
    ],
  },
  {
    id: 'audit_9',
    tool: 'AUDIT',
    question: 'Have you or someone else been injured because of your drinking?',
    subtext: 'Physical safety is our top priority. We tailor harm-reduction based on this.',
    options: [
      { label: 'No', points: 0 },
      { label: 'Yes, but not in the last year', points: 2 },
      { label: 'Yes, during the last year', points: 4 },
    ],
  },
  {
    id: 'audit_10',
    tool: 'AUDIT',
    question: 'Has a relative, friend, doctor, or healthcare worker been concerned about your drinking or suggested you cut down?',
    subtext: 'External concerns can serve as a supportive wake-up call.',
    options: [
      { label: 'No', points: 0 },
      { label: 'Yes, but not in the last year', points: 2 },
      { label: 'Yes, during the last year', points: 4 },
    ],
  },
];

// ==========================================
// 4. SADQ (Severity of Alcohol Dependence Questionnaire)
// Seamlessly triggered if AUDIT > 16 to evaluate physical withdrawal & relief drinking
// ==========================================
export const SADQ_QUESTIONS: ClinicalQuestion[] = [
  {
    id: 'sadq_1',
    tool: 'SADQ',
    question: 'After a heavy drinking session, wake up with shaky hands or physical tremors?',
    subtext: 'Physical shakiness is an early sign of central nervous system rebound hyperactivity.',
    options: [
      { label: 'Never or rarely', points: 0 },
      { label: 'Sometimes', points: 1 },
      { label: 'Often', points: 2 },
      { label: 'Nearly always', points: 3 },
    ],
  },
  {
    id: 'sadq_2',
    tool: 'SADQ',
    question: 'Wake up with sweating, clamminess, or cold chills the morning after drinking?',
    subtext: 'Autonomic nervous system dysregulation occurs during acute alcohol clearance.',
    options: [
      { label: 'Never or rarely', points: 0 },
      { label: 'Sometimes', points: 1 },
      { label: 'Often', points: 2 },
      { label: 'Nearly always', points: 3 },
    ],
  },
  {
    id: 'sadq_3',
    tool: 'SADQ',
    question: 'Experience intense dread, severe panic, or racing heart the morning after drinking?',
    subtext: 'GABA depletion creates intense affective rebound anxiety ("hangxiety").',
    options: [
      { label: 'Never or rarely', points: 0 },
      { label: 'Sometimes', points: 1 },
      { label: 'Often', points: 2 },
      { label: 'Nearly always', points: 3 },
    ],
  },
  {
    id: 'sadq_4',
    tool: 'SADQ',
    question: 'Drink alcohol in the morning or early afternoon specifically to stop shakiness or sickness?',
    subtext: 'Relief drinking indicates physiological dependence where alcohol is used as medication.',
    options: [
      { label: 'Never or rarely', points: 0 },
      { label: 'Sometimes', points: 1 },
      { label: 'Often', points: 2 },
      { label: 'Nearly always', points: 3 },
    ],
  },
  {
    id: 'sadq_5',
    tool: 'SADQ',
    question: 'How quickly would you start feeling tremors or sweating if you suddenly stopped drinking?',
    subtext: 'Helps us calibrate whether medical detox support is recommended for safe recovery.',
    options: [
      { label: 'Not at all / No withdrawal', points: 0 },
      { label: 'Within 24 to 48 hours', points: 1 },
      { label: 'Within 12 to 24 hours', points: 2 },
      { label: 'Within 6 to 12 hours of last drink', points: 3 },
    ],
  },
  {
    id: 'sadq_6',
    tool: 'SADQ',
    question: 'If you drink again after a period of abstinence, how quickly do you return to heavy drinking?',
    subtext: 'Measures rapid reinstatement of tolerance and neurological craving loops.',
    options: [
      { label: 'I do not return to heavy drinking', points: 0 },
      { label: 'Within several weeks or months', points: 1 },
      { label: 'Within a few days', points: 2 },
      { label: 'Within 24 to 48 hours', points: 3 },
    ],
  },
];

// ==========================================
// 5. DUDIT (Drug Use Disorders Identification Test - 18+)
// Validated 11-question screener for drug misuse
// ==========================================
export const DUDIT_QUESTIONS: ClinicalQuestion[] = [
  {
    id: 'dudit_1',
    tool: 'DUDIT',
    question: 'How often do you use drugs other than alcohol?',
    subtext: 'Includes cannabis, non-prescribed medications, cocaine, stimulants, opioids, or synthetics.',
    options: [
      { label: 'Never', points: 0 },
      { label: 'Once a month or less', points: 1 },
      { label: '2 to 4 times a month', points: 2 },
      { label: '2 to 3 times a week', points: 3 },
      { label: '4 or more times a week', points: 4 },
    ],
  },
  {
    id: 'dudit_2',
    tool: 'DUDIT',
    question: 'Do you use more than one type of drug on the same occasion?',
    subtext: 'Polysubstance use exponentially increases cardiac and psychological load.',
    options: [
      { label: 'Never', points: 0 },
      { label: 'Seldom', points: 1 },
      { label: 'Sometimes', points: 2 },
      { label: 'Often', points: 3 },
      { label: 'Always', points: 4 },
    ],
  },
  {
    id: 'dudit_3',
    tool: 'DUDIT',
    question: 'How many times do you use drugs on a typical day when you use them?',
    subtext: 'Measures dosing frequency across an active usage day.',
    options: [
      { label: '0 times', points: 0 },
      { label: '1 or 2 times', points: 1 },
      { label: '3 or 4 times', points: 2 },
      { label: '5 or 6 times', points: 3 },
      { label: '7 or more times', points: 4 },
    ],
  },
  {
    id: 'dudit_4',
    tool: 'DUDIT',
    question: 'How often are you influenced by drugs so that you lose track of time or surroundings?',
    subtext: 'Intense intoxication alters risk perception and cognitive regulation.',
    options: [
      { label: 'Never', points: 0 },
      { label: 'Less than monthly', points: 1 },
      { label: 'Monthly', points: 2 },
      { label: 'Weekly', points: 3 },
      { label: 'Daily or almost daily', points: 4 },
    ],
  },
  {
    id: 'dudit_5',
    tool: 'DUDIT',
    question: 'How often during the past year have you felt that your longing or craving for drugs was uncontrollable?',
    subtext: 'Craving surges hijack dopamine prediction pathways.',
    options: [
      { label: 'Never', points: 0 },
      { label: 'Less than monthly', points: 1 },
      { label: 'Monthly', points: 2 },
      { label: 'Weekly', points: 3 },
      { label: 'Daily or almost daily', points: 4 },
    ],
  },
  {
    id: 'dudit_6',
    tool: 'DUDIT',
    question: 'How often in the last year have you failed to do what was expected of you due to drug use?',
    subtext: 'School, vocational obligations, or commitments to family.',
    options: [
      { label: 'Never', points: 0 },
      { label: 'Less than monthly', points: 1 },
      { label: 'Monthly', points: 2 },
      { label: 'Weekly', points: 3 },
      { label: 'Daily or almost daily', points: 4 },
    ],
  },
  {
    id: 'dudit_7',
    tool: 'DUDIT',
    question: 'Have you experienced negative physical or mental reactions (paranoia, chest tightness, extreme fatigue)?',
    subtext: 'Your body letting you know when physiological limits are exceeded.',
    options: [
      { label: 'Never', points: 0 },
      { label: 'Less than monthly', points: 1 },
      { label: 'Monthly', points: 2 },
      { label: 'Weekly', points: 3 },
      { label: 'Daily or almost daily', points: 4 },
    ],
  },
  {
    id: 'dudit_8',
    tool: 'DUDIT',
    question: 'Has a relative, friend, or doctor ever been concerned about your drug use or advised you to stop?',
    subtext: 'External perspectives can reveal patterns that are hard to spot from within.',
    options: [
      { label: 'No', points: 0 },
      { label: 'Yes, but not in the past year', points: 2 },
      { label: 'Yes, during the past year', points: 4 },
    ],
  },
];

// ==========================================
// 6. GAD-7 (Generalized Anxiety Disorder Screener - 7 Items)
// Over the last 2 weeks, how often have you been bothered by:
// ==========================================
export const GAD7_QUESTIONS: ClinicalQuestion[] = [
  {
    id: 'gad7_1',
    tool: 'GAD7',
    question: 'Feeling nervous, anxious, or on edge',
    subtext: 'Over the last 2 weeks, experiencing internal tension or hyper-alertness.',
    options: [
      { label: 'Not at all', points: 0 },
      { label: 'Several days', points: 1 },
      { label: 'More than half the days', points: 2 },
      { label: 'Nearly every day', points: 3 },
    ],
  },
  {
    id: 'gad7_2',
    tool: 'GAD7',
    question: 'Not being able to stop or control worrying',
    subtext: 'Racing thoughts that replay difficult scenarios repeatedly.',
    options: [
      { label: 'Not at all', points: 0 },
      { label: 'Several days', points: 1 },
      { label: 'More than half the days', points: 2 },
      { label: 'Nearly every day', points: 3 },
    ],
  },
  {
    id: 'gad7_3',
    tool: 'GAD7',
    question: 'Worrying too much about different things',
    subtext: 'Apprehension shifting between health, work, relationships, and routines.',
    options: [
      { label: 'Not at all', points: 0 },
      { label: 'Several days', points: 1 },
      { label: 'More than half the days', points: 2 },
      { label: 'Nearly every day', points: 3 },
    ],
  },
  {
    id: 'gad7_4',
    tool: 'GAD7',
    question: 'Trouble relaxing or unwinding',
    subtext: 'Feeling physically unable to let your muscles or mind rest.',
    options: [
      { label: 'Not at all', points: 0 },
      { label: 'Several days', points: 1 },
      { label: 'More than half the days', points: 2 },
      { label: 'Nearly every day', points: 3 },
    ],
  },
  {
    id: 'gad7_5',
    tool: 'GAD7',
    question: 'Being so restless that it is hard to sit still',
    subtext: 'Motor agitation, pacing, or feeling an internal motor running.',
    options: [
      { label: 'Not at all', points: 0 },
      { label: 'Several days', points: 1 },
      { label: 'More than half the days', points: 2 },
      { label: 'Nearly every day', points: 3 },
    ],
  },
  {
    id: 'gad7_6',
    tool: 'GAD7',
    question: 'Becoming easily annoyed or irritable',
    subtext: 'A low sensory threshold where small disruptions trigger sudden frustration.',
    options: [
      { label: 'Not at all', points: 0 },
      { label: 'Several days', points: 1 },
      { label: 'More than half the days', points: 2 },
      { label: 'Nearly every day', points: 3 },
    ],
  },
  {
    id: 'gad7_7',
    tool: 'GAD7',
    question: 'Feeling afraid, as if something awful might happen',
    subtext: 'A persistent sense of impending catastrophe without a specific trigger.',
    options: [
      { label: 'Not at all', points: 0 },
      { label: 'Several days', points: 1 },
      { label: 'More than half the days', points: 2 },
      { label: 'Nearly every day', points: 3 },
    ],
  },
];

// ==========================================
// 7. PHQ-9 (Patient Health Questionnaire - 9 Items)
// Over the last 2 weeks, how often have you been bothered by:
// ==========================================
export const PHQ9_QUESTIONS: ClinicalQuestion[] = [
  {
    id: 'phq9_1',
    tool: 'PHQ9',
    question: 'Little interest or pleasure in doing things',
    subtext: 'Anhedonia: finding that activities that used to bring joy feel flat or exhausting.',
    options: [
      { label: 'Not at all', points: 0 },
      { label: 'Several days', points: 1 },
      { label: 'More than half the days', points: 2 },
      { label: 'Nearly every day', points: 3 },
    ],
  },
  {
    id: 'phq9_2',
    tool: 'PHQ9',
    question: 'Feeling down, depressed, or hopeless',
    subtext: 'A persistent low mood or heaviness in your chest or mind.',
    options: [
      { label: 'Not at all', points: 0 },
      { label: 'Several days', points: 1 },
      { label: 'More than half the days', points: 2 },
      { label: 'Nearly every day', points: 3 },
    ],
  },
  {
    id: 'phq9_3',
    tool: 'PHQ9',
    question: 'Trouble falling or staying asleep, or sleeping too much',
    subtext: 'Circadian disruption is one of the clearest neurochemical signals of stress.',
    options: [
      { label: 'Not at all', points: 0 },
      { label: 'Several days', points: 1 },
      { label: 'More than half the days', points: 2 },
      { label: 'Nearly every day', points: 3 },
    ],
  },
  {
    id: 'phq9_4',
    tool: 'PHQ9',
    question: 'Feeling tired or having little energy',
    subtext: 'Physical exhaustion even after waking or minimal effort.',
    options: [
      { label: 'Not at all', points: 0 },
      { label: 'Several days', points: 1 },
      { label: 'More than half the days', points: 2 },
      { label: 'Nearly every day', points: 3 },
    ],
  },
  {
    id: 'phq9_5',
    tool: 'PHQ9',
    question: 'Poor appetite or overeating',
    subtext: 'Subtle shifts in gut-brain axis metabolism under chronic stress.',
    options: [
      { label: 'Not at all', points: 0 },
      { label: 'Several days', points: 1 },
      { label: 'More than half the days', points: 2 },
      { label: 'Nearly every day', points: 3 },
    ],
  },
  {
    id: 'phq9_6',
    tool: 'PHQ9',
    question: 'Feeling bad about yourself — or that you are a failure or let your family down',
    subtext: 'Depressive cognitive bias magnifying guilt and minimizing achievements.',
    options: [
      { label: 'Not at all', points: 0 },
      { label: 'Several days', points: 1 },
      { label: 'More than half the days', points: 2 },
      { label: 'Nearly every day', points: 3 },
    ],
  },
  {
    id: 'phq9_7',
    tool: 'PHQ9',
    question: 'Trouble concentrating on things, such as reading or watching television',
    subtext: 'Executive dysfunction caused by excessive cortisol circulating in working memory.',
    options: [
      { label: 'Not at all', points: 0 },
      { label: 'Several days', points: 1 },
      { label: 'More than half the days', points: 2 },
      { label: 'Nearly every day', points: 3 },
    ],
  },
  {
    id: 'phq9_8',
    tool: 'PHQ9',
    question: 'Moving or speaking so slowly that other people could have noticed, or the opposite — being fidgety',
    subtext: 'Psychomotor retardation or agitation.',
    options: [
      { label: 'Not at all', points: 0 },
      { label: 'Several days', points: 1 },
      { label: 'More than half the days', points: 2 },
      { label: 'Nearly every day', points: 3 },
    ],
  },
  {
    id: 'phq9_9',
    tool: 'PHQ9',
    question: 'Thoughts that you would be better off dead or of hurting yourself in some way',
    subtext: 'Compassionate check-in: Waypoint will immediately activate confidential 24/7 crisis anchors if needed.',
    options: [
      { label: 'Not at all', points: 0 },
      { label: 'Several days', points: 1 },
      { label: 'More than half the days', points: 2 },
      { label: 'Nearly every day', points: 3 },
    ],
  },
];

// ==========================================
// Clinical Band Calculation Utilities
// ==========================================

export function calculateAuditBand(score: number): 'Low' | 'Hazardous' | 'Harmful' | 'Severe' {
  if (score <= 7) return 'Low';
  if (score <= 15) return 'Hazardous';
  if (score <= 19) return 'Harmful';
  return 'Severe';
}

export function calculateSadqBand(score: number): 'Mild' | 'Moderate' | 'Severe' {
  if (score <= 15) return 'Mild';
  if (score <= 30) return 'Moderate';
  return 'Severe';
}

export function calculateDuditBand(score: number): 'Low' | 'Harmful' | 'Severe' {
  if (score <= 5) return 'Low';
  if (score <= 24) return 'Harmful';
  return 'Severe';
}

export function calculatePhq9Band(score: number): 'Minimal' | 'Mild' | 'Moderate' | 'Moderately Severe' | 'Severe' {
  if (score <= 4) return 'Minimal';
  if (score <= 9) return 'Mild';
  if (score <= 14) return 'Moderate';
  if (score <= 19) return 'Moderately Severe';
  return 'Severe';
}

export function calculateGad7Band(score: number): 'Minimal' | 'Mild' | 'Moderate' | 'Severe' {
  if (score <= 4) return 'Minimal';
  if (score <= 9) return 'Mild';
  if (score <= 14) return 'Moderate';
  return 'Severe';
}

export function calculateCrafftBand(score: number): 'Low' | 'Elevated' {
  return score >= 2 ? 'Elevated' : 'Low';
}

export function calculateWemwbsBand(score: number): 'Low' | 'Moderate' | 'High' {
  if (score <= 14) return 'Low';
  if (score <= 20) return 'Moderate';
  return 'High';
}
